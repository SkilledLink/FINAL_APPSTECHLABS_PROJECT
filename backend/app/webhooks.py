import hmac
import json
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Request, Response, HTTPException
from sqlmodel import Session

from app.core.config import settings
from app.database.session import get_session
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
    return json.dumps(processed, separators=(',', ':'), ensure_ascii=False)

# ─── Webhook handler ──────────────────────────────────────

@router.post("/didit")
async def handle_didit_webhook(request: Request) -> Response:
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

    # 6. Idempotency – you MUST store event_id in a WebhookEvent table.
    #    For now, we skip it – add it before production.
    event_id = parsed.get("event_id")
    # if already_processed(event_id): return Response(status_code=200, content="ok")
    # mark_processed(event_id)

    # 7. Extract data
    status = parsed.get("status")
    vendor_data = parsed.get("vendor_data")   # this is the user's UUID (string)
    decision = parsed.get("decision", {})

    if not vendor_data:
        return Response(status_code=400, content="missing vendor_data")

    # 8. Update professional status
    with next(get_session()) as session:  # or use a context manager
        service = ProfessionalService(session)
        if status == "Approved":
            service.update_verification_status(
                user_id=vendor_data,
                status="approved",
                decision=decision,
                verified_at=datetime.now(timezone.utc),
            )
        elif status == "Declined":
            service.update_verification_status(
                user_id=vendor_data,
                status="declined",
                decision=decision,
                verified_at=None,
            )
        elif status == "In Review":
            service.update_verification_status(
                user_id=vendor_data,
                status="review",
                decision=decision,
                verified_at=None,
            )
        # Other statuses: Resubmitted, Kyc Expired, etc. – implement as needed
        else:
            # Log but don't change status
            pass
        session.commit()

    # 9. Always return 2xx within 5 seconds
    return Response(status_code=200, content="ok")