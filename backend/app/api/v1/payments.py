# app/api/v1/payments.py

import logging

from fastapi import APIRouter, HTTPException

from app.api.deps_payments import PaymentServiceDep
from app.services.payments.mtn_client import MtnMomoClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])


@router.get("/status/{provider_reference}")
async def payment_status(
    provider_reference: str,
    service: PaymentServiceDep,
) -> dict:
    """Poll MTN directly for a requestToPay transaction's current status."""
    client = getattr(service, "provider", None)
    if not isinstance(client, MtnMomoClient):
        raise HTTPException(400, "Active provider does not support polling")

    try:
        raw = client.get_status(provider_reference)
    except Exception as e:
        logger.warning("MoMo status lookup failed: %s", e)
        raise HTTPException(502, f"Could not fetch status: {e}")

    return {
        "status": raw.get("status"),
        "reason": raw.get("reason"),
        "financial_transaction_id": raw.get("financialTransactionId"),
        "amount": raw.get("amount"),
        "currency": raw.get("currency"),
    }