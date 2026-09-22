# app/api/v1/professional_kyc.py

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session

from app.core.config import settings
from app.database.session import get_session
from app.dependencies.current_user import get_current_user
from app.enums.professional import VerificationStatus
from app.models.user import User
from app.services.professional_service import ProfessionalService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/professionals/kyc",
    tags=["professional-verification"],
)


# ─── Schemas ────────────────────────────────────────────────────

class KYCStatusResponse(BaseModel):
    status: str
    attempts: int
    max_attempts: int
    can_retry: bool
    verified_at: Optional[str] = None
    last_attempt_at: Optional[str] = None


class KYCStartResponse(BaseModel):
    url: str
    session_id: str
    status: str


# ─── Endpoints ──────────────────────────────────────────────────

@router.get("/status", response_model=KYCStatusResponse)
async def get_kyc_status(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> KYCStatusResponse:
    service = ProfessionalService(session)
    professional = service.get_by_user(current_user)
    if professional is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional profile not found",
        )

    vstatus = professional.verification_status
    vstatus_value = vstatus.value if hasattr(vstatus, "value") else str(vstatus)

    return KYCStatusResponse(
        status=vstatus_value,
        attempts=professional.verification_attempts or 0,
        max_attempts=settings.DIDIT_SESSION_MAX_ATTEMPTS,
        can_retry=service.can_retry_verification(professional),
        verified_at=professional.verified_at.isoformat()
        if professional.verified_at
        else None,
        last_attempt_at=professional.verification_last_attempt_at.isoformat()
        if professional.verification_last_attempt_at
        else None,
    )


@router.post("/start", response_model=KYCStartResponse)
async def start_professional_verification(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> KYCStartResponse:
    service = ProfessionalService(session)
    professional = service.get_by_user(current_user)

    if professional is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional profile not found",
        )

    if professional.verification_status == VerificationStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already verified",
        )

    if not service.can_retry_verification(professional):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Maximum attempts reached. Contact support.",
        )

    # Rate-limit rapid retries
    last = professional.verification_last_attempt_at
    if last is not None:
        # Ensure `last` is timezone-aware for the subtraction
        if last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
        elapsed = datetime.now(timezone.utc) - last
        if elapsed < timedelta(
            seconds=settings.DIDIT_MIN_SECONDS_BETWEEN_SESSIONS
        ):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Please wait before starting another verification",
            )

    payload = {
        "workflow_id": settings.DIDIT_WORKFLOW_ID,
        "vendor_data": str(current_user.id),
        "callback": settings.DIDIT_REDIRECT_URL,
    }

    try:
        async with httpx.AsyncClient(
            timeout=settings.DIDIT_TIMEOUT_SECONDS
        ) as client:
            response = await client.post(
                settings.DIDIT_SESSION_URL,
                headers={
                    "x-api-key": settings.DIDIT_API_KEY,
                    "Content-Type": "application/json",
                },
                json=payload,
            )
    except httpx.HTTPError:
        logger.exception("[DIDIT] transport error creating session")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Verification provider unreachable",
        )

    if response.status_code not in (200, 201):
        logger.error(
            "[DIDIT] session create failed status=%s body=%s",
            response.status_code,
            response.text[:500],
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to create verification session",
        )

    data = response.json()
    session_id = data.get("session_id") or data.get("id")
    url = data.get("url") or data.get("verification_url")

    if not session_id or not url:
        logger.error("[DIDIT] unexpected payload: %s", data)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Verification provider returned an invalid response",
        )

    # ── Increment attempt + record session ──────────────────────
    now = datetime.now(timezone.utc)
    professional.verification_data = {
        **(professional.verification_data or {}),
        "didit_session_id": session_id,
        "didit_session_started_at": now.isoformat(),
    }
    professional.verification_attempts = (
        professional.verification_attempts or 0
    ) + 1
    professional.verification_last_attempt_at = now
    professional.verification_status = VerificationStatus.PENDING
    professional.updated_at = now
    session.add(professional)
    session.commit()

    return KYCStartResponse(
        url=url,
        session_id=session_id,
        status="pending",
    )