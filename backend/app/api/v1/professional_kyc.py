import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.config import settings
from app.database.session import get_session
from app.dependencies.current_user import get_current_user
from app.models.user import User
from app.services.professional_service import ProfessionalService

router = APIRouter(
    prefix="/professionals/kyc",
    tags=["professional-verification"]
)


@router.post("/start")
async def start_professional_verification(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Start the KYC verification process for the authenticated professional.
    Returns a Didit verification URL that the frontend must open.
    """
    # 1. Ensure the user has a professional profile
    prof_service = ProfessionalService(session)
    professional = prof_service.get_by_user(current_user)
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional profile not found – only professionals can verify"
        )

    # 2. If already verified, return early
    if professional.verification_status == "approved":
        return {
            "message": "Already verified",
            "status": "approved",
            "verified_at": professional.verified_at,
        }

    # 3. Create a Didit session using the user's ID as vendor_data
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://verification.didit.me/v3/session/",
            headers={
                "x-api-key": settings.DIDIT_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "workflow_id": settings.DIDIT_WORKFLOW_ID,
                "vendor_data": str(current_user.id),   # unique, stable identifier
                "callback": "https://your-domain.com/webhooks/didit",  # public URL
            },
            timeout=30.0,
        )

    if response.status_code != 201:
        # Log response.text for debugging
        raise HTTPException(
            status_code=502,
            detail=f"Failed to create verification session: {response.text}"
        )

    data = response.json()
    return {
        "url": data["url"],
        "session_id": data["session_id"],
        "status": "not_started",
    }