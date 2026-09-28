# app/services/payments/mock_client.py
"""Mock mobile-money client for local development and demos.

Implements PaymentProviderClient so the payment service layer never
knows the difference. No network calls; state lives in an in-process
dict and resets when the process restarts.

Simulated outcomes by MSISDN (mirrors MTN sandbox stubs):
    46733123450 → SUCCESSFUL immediately
    46733123451 → FAILED (user rejected)
    46733123452 → FAILED (timeout)
    46733123453 → PENDING (never resolves)
    46733123454 → SUCCESSFUL after ~15 s
    any other number → SUCCESSFUL after ~3 s (nicer for demos)
"""

import logging
import time
import uuid
from decimal import Decimal
from typing import Optional

from app.services.payments.base import ChargeInitResult, WebhookEvent

logger = logging.getLogger(__name__)


class _MockStore:
    """Process-local transaction store."""

    def __init__(self) -> None:
        self._rows: dict[str, dict] = {}

    def put(self, reference: str, **kwargs) -> None:
        self._rows[reference] = kwargs

    def update(self, reference: str, **kwargs) -> None:
        if reference in self._rows:
            self._rows[reference].update(kwargs)

    def get(self, reference: str) -> Optional[dict]:
        return self._rows.get(reference)

    def find_by_provider_reference(self, provider_reference: str) -> Optional[dict]:
        for data in self._rows.values():
            if data.get("provider_reference") == provider_reference:
                return data
        return None

    def reset(self) -> None:
        self._rows.clear()


_store = _MockStore()


def _decide_outcome(phone: str) -> tuple[str, float]:
    """Return (final_status, delay_seconds) based on the phone number."""
    digits = "".join(c for c in phone if c.isdigit())

    if digits.endswith("46733123450"):
        return "SUCCESSFUL", 0.0
    if digits.endswith("46733123451"):
        return "FAILED", 0.0
    if digits.endswith("46733123452"):
        return "FAILED", 0.0
    if digits.endswith("46733123453"):
        return "PENDING", 10_000_000.0
    if digits.endswith("46733123454"):
        return "SUCCESSFUL", 15.0

    # Any other number — auto-approve after a short delay so the UI
    # can show the "waiting" phase before flipping to success.
    return "SUCCESSFUL", 3.0

  
class MockMomoClient:
    """PaymentProviderClient implementation that never leaves the process."""

    def __init__(
        self,
        *,
        currency: str = "EUR",
        target_env: str = "mock",
        **_: object,
    ) -> None:
        self.currency = currency
        self.target_env = target_env

    # ───────────────────────── protocol ─────────────────────────

    def initiate_charge(
        self,
        *,
        reference: str,
        amount: Decimal,
        currency: str,
        customer: dict,
        phone_number: str,
        network: str,
        description: Optional[str] = None,
    ) -> ChargeInitResult:
        mtn_ref = str(uuid.uuid4())
        outcome, delay = _decide_outcome(phone_number)

        _store.put(
            reference,
            provider_reference=mtn_ref,
            phone=phone_number,
            amount=str(amount),
            currency=currency,
            outcome=outcome,
            delay_seconds=delay,
            created_at=time.time(),
            description=description or "Subscription",
        )

        logger.info(
            "[MOCK] initiate ref=%s phone=%s amount=%s %s → %s (delay %.1fs)",
            reference, phone_number, amount, currency, outcome, delay,
        )

        return ChargeInitResult(
            status="pending",
            raw={"reference_id": mtn_ref, "mock": True},
            provider_reference=mtn_ref,
            checkout_url=None,
            instructions=(
                "This is a mock payment. No real prompt was sent. "
                "The status will resolve automatically for demos."
            ),
            message="Mock payment initiated",
        )

    def verify_webhook_signature(self, raw_body: bytes, headers: dict) -> bool:
        return True

    def parse_webhook_event(self, body: dict) -> WebhookEvent:
        reference = body.get("externalId") or body.get("referenceId") or ""
        raw_status = (body.get("status") or "").lower()
        if raw_status in {"successful", "success"}:
            status = "success"
        elif raw_status in {"failed", "failure", "cancelled", "canceled"}:
            status = "failed"
        else:
            status = "pending"
        return WebhookEvent(
            reference=reference,
            status=status,
            provider_transaction_id=body.get("financialTransactionId"),
            reason=body.get("reason"),
            raw=body,
        )

    # ───────────────────── status lookup ─────────────────────

    def get_status(self, provider_reference: str) -> dict:
        """Resolve the current status based on elapsed time."""
        data = _store.find_by_provider_reference(provider_reference)
        if data is None:
            raise RuntimeError(f"Mock: unknown reference {provider_reference}")

        elapsed = time.time() - data["created_at"]
        outcome = data["outcome"]
        delay = data["delay_seconds"]

        if outcome == "PENDING" or elapsed < delay:
            status = "PENDING"
        else:
            status = outcome

        if status == "SUCCESSFUL":
            return {
                "status": "SUCCESSFUL",
                "reason": None,
                "financialTransactionId": f"MOCK-TXN-{provider_reference[-8:]}",
                "amount": data["amount"],
                "currency": data["currency"],
            }
        if status == "FAILED":
            reason = (
                "Mock: user rejected the payment"
                if data["phone"].endswith("451")
                else "Mock: payment timed out"
            )
            return {
                "status": "FAILED",
                "reason": reason,
                "financialTransactionId": None,
                "amount": data["amount"],
                "currency": data["currency"],
            }
        return {
            "status": "PENDING",
            "reason": None,
            "financialTransactionId": None,
            "amount": data["amount"],
            "currency": data["currency"],
        }

    def reset(self) -> None:
        _store.reset()