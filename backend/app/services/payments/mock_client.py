# app/services/payments/mock_client.py
"""Mock mobile-money client for local development.

Accepts BOTH networks (MTN MoMo + Orange Money). No network calls.
State is process-local; wipes on restart.

Auto-success time is intentionally short (1.5 s) so the frontend's
1.5-second poll loop sees the flip on the second poll.

Simulated outcomes by MSISDN suffix (overrides the default timing):
    46733123450 → SUCCESSFUL immediately
    46733123451 → FAILED  (user rejected)
    46733123452 → FAILED  (timeout)
    46733123453 → PENDING (never resolves)
    46733123454 → SUCCESSFUL after 8 s
    any other number → SUCCESSFUL after 1.5 s
"""

import logging
import time
import uuid
from decimal import Decimal
from typing import Optional

from app.services.payments.base import ChargeInitResult, WebhookEvent

logger = logging.getLogger(__name__)

# Recognised network names (case-insensitive). The mock treats both
# identically — everything that isn't None ends up SUCCESSFUL.
_MTN = {"mtn", "mtn_momo", "mtn_mobile_money"}
_ORANGE = {"orange", "orange_money", "orange_mobile_money"}


def _network_label(network: str) -> str:
    n = (network or "").strip().lower()
    if n in _MTN:
        return "MTN MoMo"
    if n in _ORANGE:
        return "Orange Money"
    return network or "unknown"


class _MockStore:
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
        return "SUCCESSFUL", 8.0

    # The user-facing happy path: succeed fast enough that the
    # frontend's second poll (at t≈3s) sees SUCCESSFUL.
    return "SUCCESSFUL", 1.5


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
        label = _network_label(network)

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
            network=network,
        )

        logger.info(
            "[MOCK] initiate ref=%s network=%s phone=%s amount=%s %s "
            "→ %s (delay %.1fs)",
            reference, label, phone_number, amount, currency, outcome, delay,
        )

        return ChargeInitResult(
            status="pending",
            raw={"reference_id": mtn_ref, "mock": True, "network": network},
            provider_reference=mtn_ref,
            checkout_url=None,
            instructions=(
                f"A {label} prompt has been sent to {phone_number}. "
                "Enter your PIN to approve the payment."
            ),
            message=f"{label} payment initiated",
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
        data = _store.find_by_provider_reference(provider_reference)
        if data is None:
            raise RuntimeError(
                f"Mock: unknown reference {provider_reference}"
            )

        elapsed = time.time() - data["created_at"]
        outcome = data["outcome"]
        delay = data["delay_seconds"]

        if outcome == "PENDING" or elapsed < delay:
            return {
                "status": "PENDING",
                "reason": None,
                "financialTransactionId": None,
                "amount": data["amount"],
                "currency": data["currency"],
            }

        if outcome == "SUCCESSFUL":
            return {
                "status": "SUCCESSFUL",
                "reason": None,
                "financialTransactionId": f"MOCK-TXN-{provider_reference[-8:]}",
                "amount": data["amount"],
                "currency": data["currency"],
            }

        # FAILED
        phone = data.get("phone", "")
        reason = (
            "Mock: user rejected the payment"
            if phone.endswith("451")
            else "Mock: payment timed out"
        )
        return {
            "status": "FAILED",
            "reason": reason,
            "financialTransactionId": None,
            "amount": data["amount"],
            "currency": data["currency"],
        }

    def reset(self) -> None:
        _store.reset()