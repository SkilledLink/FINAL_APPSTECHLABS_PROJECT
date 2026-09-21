# app/services/payments/base.py
"""Provider-agnostic payment client contract.

Any aggregator (Kora, Flutterwave, Campay, …) that SkilledLink adopts must
implement this Protocol. The service layer never talks to a specific
aggregator's HTTP API directly.
"""

from dataclasses import dataclass
from decimal import Decimal
from typing import Optional, Protocol, runtime_checkable


@dataclass
class ChargeInitResult:
    """Normalized result of a charge-initiation call."""
    status: str  # "pending" | "processing" | "success" | "failed"
    raw: dict
    provider_reference: Optional[str] = None
    checkout_url: Optional[str] = None
    instructions: Optional[str] = None
    message: Optional[str] = None


@dataclass
class WebhookEvent:
    """Normalized webhook event, provider-independent."""
    reference: str
    status: str  # "success" | "failed" | "pending"
    provider_transaction_id: Optional[str] = None
    reason: Optional[str] = None
    raw: Optional[dict] = None


@runtime_checkable
class PaymentProviderClient(Protocol):
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
    ) -> ChargeInitResult: ...

    def verify_webhook_signature(
        self, raw_body: bytes, headers: dict
    ) -> bool: ...

    def parse_webhook_event(self, body: dict) -> WebhookEvent: ...