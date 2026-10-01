# app/webhooks.py

import hmac
import json
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlmodel import Session

from app.core.config import settings
from app.database.session import get_session
from app.enums.professional import VerificationStatus
from app.services.professional_service import ProfessionalService

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


# ─── Canonicalisation helpers (must match Didit exactly) ───

def shorten_floats(obj: Any) -> Any:
    if isinstance(obj, list):
        return [shorten_floats(item) for item in obj]
    if isinstance(obj, dict):
        return {k: shorten_floats(v) for k, v in obj.items()}
    if isinstance(obj, float) and obj.is_integer():
        return int(obj)
    return obj


def sort_keys(obj: Any) -> Any:
    if isinstance(obj, list):
        return [sort_keys(item) for item in obj]
    if isinstance(obj, dict):
        return {k: sort_keys(v) for k, v in sorted(obj.items())}
    return obj


def canonicalise(body_dict: dict) -> str:
    processed = sort_keys(shorten_floats(body_dict))
    return json.dumps(processed, separators=(",", ":"), ensure_ascii=False)


# ─── Status mapping: Didit string → VerificationStatus enum ───

DIDIT_STATUS_MAP: dict[str, VerificationStatus] = {
    "Approved": VerificationStatus.APPROVED,
    "Declined": VerificationStatus.REJECTED,
    "In Review": VerificationStatus.MANUAL_REVIEW,
    "Kyc Expired": VerificationStatus.EXPIRED,
    # "Resubmitted" is a transient state — no DB change needed.
    # Add more mappings here as Didit adds statuses.
}


# ─── Webhook handler ──────────────────────────────────────

@router.post("/didit")
async def handle_didit_webhook(
    request: Request,
    db: Session = Depends(get_session),
) -> Response:
    # 1. Read raw body
    raw_body = await request.body()
    raw_str = raw_body.decode("utf-8")

    # 2. Extract headers
    signature = request.headers.get("x-signature-v2", "")
    timestamp_str = request.headers.get("x-timestamp", "")
    if not signature or not timestamp_str:
        raise HTTPException(status_code=401, detail="Missing signature headers")

    try:
        timestamp = int(timestamp_str)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid timestamp")

    # 3. Freshness check (300s window)
    now_ts = int(datetime.now(timezone.utc).timestamp())
    if abs(now_ts - timestamp) > 300:
        return Response(status_code=401, content="stale")

    # 4. Parse and canonicalise
    try:
        parsed = json.loads(raw_str)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    canonical_payload = canonicalise(parsed)

    # 5. HMAC verification (constant-time)
    expected_hmac = hmac.new(
        key=settings.DIDIT_WEBHOOK_SECRET.encode("utf-8"),
        msg=canonical_payload.encode("utf-8"),
        digestmod="sha256",
    ).hexdigest()

    if not hmac.compare_digest(expected_hmac, signature):
        raise HTTPException(status_code=401, detail="bad sig")

    # 6. Idempotency (optional — see the note at the bottom of this file).
    #    Re-enable once WebhookEvent storage is wired up:
    #
    # from app.models.webhook_event import WebhookEvent
    # event_id = parsed.get("event_id")
    # if event_id:
    #     existing = db.exec(
    #         select(WebhookEvent).where(WebhookEvent.event_id == event_id)
    #     ).first()
    #     if existing:
    #         return Response(status_code=200, content="ok")
    #     db.add(WebhookEvent(event_id=event_id, source="didit"))
    #     db.commit()

    # 7. Extract data
    status_str = parsed.get("status")
    vendor_data = parsed.get("vendor_data")  # the user's UUID (string)
    decision = parsed.get("decision", {})

    if not vendor_data:
        return Response(status_code=400, content="missing vendor_data")

    # 8. Map Didit's status → our VerificationStatus
    mapped_status = DIDIT_STATUS_MAP.get(status_str)
    if mapped_status is None:
        # Unknown or no-op status (e.g. "Resubmitted", "Not Started").
        # Log it and return 200 so Didit doesn't retry forever.
        print(f"ℹ️  Didit webhook: no-op status '{status_str}' for user {vendor_data}")
        return Response(status_code=200, content="ok")

    # 9. Look up the professional by user_id
    service = ProfessionalService(db)
    professional = service.get_by_user_id(vendor_data)
    if professional is None:
        # The user may not have created a professional profile yet,
        # or the vendor_data is stale. Return 200 so Didit stops retrying —
        # the record will reconcile on the next legit webhook.
        print(f"⚠️  Didit webhook: no professional found for user_id {vendor_data}")
        return Response(status_code=200, content="ok")

    # 10. Persist the result via the existing service method.
    #     record_verification_result handles:
    #       - setting verification_status / is_verified / verified_at
    #       - auto-activating the account on approval
    #       - audit logging
    #       - notifying the user
    #     We pass the full Didit payload as `raw_data` so it lands in
    #     professional.verification_data for later inspection.
    service.record_verification_result(
        professional=professional,
        didit_status=mapped_status,
        raw_data={
            "didit_status": status_str,
            "session_id": parsed.get("session_id"),
            "decision": decision,
            "raw": parsed,
        },
    )

    print(
        f"✅ Didit webhook processed: user={vendor_data} "
        f"status={status_str} → {mapped_status.value}"
    )

    # 11. Always return 2xx within 5 seconds
    return Response(status_code=200, content="ok")