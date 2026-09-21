# app/api/v1/payment_webhooks.py
"""Payment provider webhook receiver.

Lives at /api/v1/payments/webhooks/* so it never collides with the
existing app/webhooks.py (KYC / Didit / other). No auth dependency —
the service verifies the HMAC signature on the raw body.
"""

import json
import logging

from fastapi import APIRouter, Body, HTTPException, Request, status as http_status

from app.api.deps_payments import PaymentServiceDep

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/payments/webhooks",
    tags=["payment-webhooks"],
)


@router.post("/kora", status_code=http_status.HTTP_200_OK)
async def kora_webhook(
    request: Request,
    service: PaymentServiceDep,
    # Declared so Swagger renders a body input. The actual raw bytes are
    # re-read from the request for HMAC verification — Starlette caches
    # the body, so this is safe.
    body: dict = Body(
        ...,
        examples=[
            {
                "event": "charge.success",
                "data": {
                    "reference": "SKL-XXXXXXXX",
                    "status": "success",
                    "transaction_reference": "KORA-TEST-001",
                },
            }
        ],
    ),
) -> dict:
    raw_body = await request.body()

    # If the client sent an empty body, fall back to the parsed dict.
    if not raw_body:
        raw_body = json.dumps(body).encode()

    if not isinstance(body, dict):
        raise HTTPException(
            http_status.HTTP_400_BAD_REQUEST, "Invalid JSON payload"
        )

    payment = service.handle_webhook(
        raw_body=raw_body,
        body=body,
        headers=dict(request.headers),
    )

    return {"status": "ok", "payment_id": str(payment.id)}