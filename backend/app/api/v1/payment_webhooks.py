# app/api/v1/payment_webhooks.py
"""Payment provider webhook receiver.

No auth dependency — HMAC verification happens inside the service.
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
    body: dict = Body(...),
) -> dict:
    raw_body = await request.body()
    if not raw_body:
        raw_body = json.dumps(body).encode()
    if not isinstance(body, dict):
        raise HTTPException(http_status.HTTP_400_BAD_REQUEST, "Invalid JSON payload")
    payment = service.handle_webhook(
        raw_body=raw_body, body=body, headers=dict(request.headers)
    )
    return {"status": "ok", "payment_id": str(payment.id)}


@router.post("/mtn", status_code=http_status.HTTP_200_OK)
async def mtn_webhook(
    request: Request,
    service: PaymentServiceDep,
    body: dict = Body(
        ...,
        examples=[{
            "referenceId": "8b3f5a2c-1d4e-4f6a-9b8c-7d5e3f1a2b4c",
            "externalId": "SKL-XXXXXXXX",
            "financialTransactionId": "1234567890",
            "status": "SUCCESSFUL",
            "reason": None,
            "amount": "100",
            "currency": "EUR",
        }],
    ),
) -> dict:
    raw_body = await request.body()
    if not raw_body:
        raw_body = json.dumps(body).encode()
    if not isinstance(body, dict):
        raise HTTPException(http_status.HTTP_400_BAD_REQUEST, "Invalid JSON payload")

    logger.info("[MTN] webhook received: %s", body)
    payment = service.handle_webhook(
        raw_body=raw_body, body=body, headers=dict(request.headers)
    )
    return {"status": "ok", "payment_id": str(payment.id)}