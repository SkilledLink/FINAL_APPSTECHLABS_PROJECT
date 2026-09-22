# app/api/v1/webhooks.py
"""Webhook receivers.

Currently handles Didit KYC callbacks.

- HMAC-V2 signature verification over a canonicalised JSON body
- Idempotency via `webhook_events` (dedup by provider+event_id)
- Explicit mapping from Didit status strings → VerificationStatus
- Always returns 2xx once the payload is accepted, so a bad payload
  doesn't cause an infinite retry storm.
"""

import hmac
import json
import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Request, Response

from app.core.config import settings
from app.database.session import SessionLocal
from app.enums.professional import VerificationStatus
from app.repositories.webhook_event_repository import (
    WebhookEventRepository,
)
from app.services.professional_service import ProfessionalService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

PROVIDER = "didit"


# Didit status string → our enum.
DIDIT_STATUS_MAP: dict[str, VerificationStatus] = {
    "approved": VerificationStatus.APPROVED,
    "declined": VerificationStatus.REJECTED,
    "in review": VerificationStatus.MANUAL_REVIEW,
    "resubmitted": VerificationStatus.MANUAL_REVIEW,
    "kyc expired": VerificationStatus.EXPIRED,
    "abandoned": VerificationStatus.REJECTED,
}


# ─── Canonicalisation (must match Didit's V2 spec) ────────────

def _shorten_floats(obj: Any) -> Any:
    if isinstance(obj, list):
        return [_shorten_floats(i) for i in obj]
    if isinstance(obj, dict):
        return {k: _shorten_floats(v) for k, v in obj.items()}
    if isinstance(obj, float) and obj.is_integer():
        return int(obj)
    return obj


def _sort_keys(obj: Any) -> Any:
    if isinstance(obj, list):
        return [_sort_keys(i) for i in obj]
    if isinstance(obj, dict):
        return {k: _sort_keys(v) for k, v in sorted(obj.items())}
    return obj


def _canonicalise(body: dict) -> str:
    return json.dumps(
        _sort_keys(_shorten_floats(body)),
        separators=(",", ":"),
        ensure_ascii=False,
    )


def _verify_signature(raw_body: bytes, headers: dict) -> tuple[bool, str]:
    """
    Supports comma-separated secrets in DIDIT_WEBHOOK_SECRET for
    zero-downtime rotation:
        DIDIT_WEBHOOK_SECRET="new,old"
    """
    signature = headers.get("x-signature-v2") or headers.get("x-signature")
    timestamp_str = headers.get("x-timestamp")

    if not signature or not timestamp_str:
        return False, "missing signature headers"

    try:
        timestamp = int(timestamp_str)
    except ValueError:
        return False, "invalid timestamp"

    now_ts = int(datetime.now(timezone.utc).timestamp())
    if abs(now_ts - timestamp) > 300:
        return False, "stale timestamp"

    try:
        parsed = json.loads(raw_body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return False, "invalid JSON"

    canonical = _canonicalise(parsed)
    secrets = [
        s.strip()
        for s in settings.DIDIT_WEBHOOK_SECRET.split(",")
        if s.strip()
    ]

    for secret in secrets:
        expected = hmac.new(
            key=secret.encode("utf-8"),
            msg=canonical.encode("utf-8"),
            digestmod="sha256",
        ).hexdigest()
        if hmac.compare_digest(expected, signature):
            return True, "ok"

    return False, "signature mismatch"


# ─── Handler ──────────────────────────────────────────────────

@router.post("/didit")
async def handle_didit_webhook(request: Request) -> Response:
    raw_body = await request.body()
    headers = {k.lower(): v for k, v in request.headers.items()}

    ok, reason = _verify_signature(raw_body, headers)
    if not ok:
        logger.warning("[DIDIT] webhook rejected: %s", reason)
        raise HTTPException(status_code=401, detail=reason)

    try:
        parsed: dict = json.loads(raw_body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event_id = parsed.get("event_id") or parsed.get("id")
    didit_status = (parsed.get("status") or "").strip()
    vendor_data = parsed.get("vendor_data")

    logger.info(
        "[DIDIT] received event_id=%s status=%r vendor_data=%s",
        event_id,
        didit_status,
        vendor_data,
    )

    if not event_id:
        logger.error("[DIDIT] webhook missing event_id")
        return Response(status_code=200, content='{"status":"ignored"}')

    if not vendor_data:
        logger.error(
            "[DIDIT] webhook missing vendor_data event_id=%s", event_id
        )
        return Response(status_code=200, content='{"status":"ignored"}')

    with SessionLocal() as session:
        events = WebhookEventRepository(session)
        claim = events.try_claim(
            provider=PROVIDER,
            event_id=str(event_id),
            event_type=parsed.get("event_type") or parsed.get("type"),
            status=didit_status,
            payload=parsed,
        )
        session.commit()

        if claim is None:
            logger.info("[DIDIT] duplicate event_id=%s — skipping", event_id)
            return Response(status_code=200, content='{"status":"ok"}')

        mapped = DIDIT_STATUS_MAP.get(didit_status.lower())
        if mapped is None:
            logger.info(
                "[DIDIT] non-terminal status %r event_id=%s — acking",
                didit_status,
                event_id,
            )
            events.mark_processed(claim)
            session.commit()
            return Response(status_code=200, content='{"status":"ok"}')

        service = ProfessionalService(session)
        professional = service.get_by_user_id(vendor_data)
        if professional is None:
            logger.error(
                "[DIDIT] no professional vendor_data=%s event_id=%s",
                vendor_data,
                event_id,
            )
            events.mark_failed(claim, f"unknown vendor_data={vendor_data}")
            session.commit()
            return Response(status_code=200, content='{"status":"ok"}')

        try:
            service.record_verification_result(
                professional,
                mapped,
                raw_data=parsed,
            )
            events.mark_processed(claim)
            session.commit()
            logger.info(
                "[DIDIT] event_id=%s user=%s didit=%s → %s",
                event_id,
                vendor_data,
                didit_status,
                mapped.value,
            )
        except Exception as exc:
            logger.exception("[DIDIT] failed to apply webhook")
            session.rollback()
            events.mark_failed(claim, str(exc))
            session.commit()

    return Response(status_code=200, content='{"status":"ok"}')