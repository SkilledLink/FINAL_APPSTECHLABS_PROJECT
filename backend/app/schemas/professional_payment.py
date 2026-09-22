# app/schemas/professional_payment.py

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.enums.payment import PaymentMethod, PaymentProvider, PaymentStatus


# ─────────────────────────────────────────────────────────────
#  Payment — responses
# ─────────────────────────────────────────────────────────────

class ProfessionalPaymentResponse(BaseModel):
    """Public-facing payment. `provider_response` and `extra_metadata`
    are intentionally excluded — they live on the admin schema."""
    id: UUID
    user_id: UUID
    professional_id: Optional[UUID] = None
    tier_id: UUID
    subscription_id: Optional[UUID] = None

    reference: str
    provider: PaymentProvider
    provider_transaction_id: Optional[str] = None

    amount: Decimal
    currency: str

    status: PaymentStatus
    payment_method: PaymentMethod
    description: Optional[str] = None

    created_at: datetime
    updated_at: datetime
    paid_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ProfessionalPaymentAdminResponse(ProfessionalPaymentResponse):
    """Admin-only — includes raw provider payload."""
    provider_response: Optional[dict] = None
    extra_metadata: Optional[dict] = None


class ProfessionalPaymentListResponse(BaseModel):
    items: List[ProfessionalPaymentResponse]
    total: int
    page: int
    size: int


class ProfessionalPaymentAdminListResponse(BaseModel):
    items: List[ProfessionalPaymentAdminResponse]
    total: int
    page: int
    size: int


# ─────────────────────────────────────────────────────────────
#  Payment — requests
# ─────────────────────────────────────────────────────────────

class PaymentInitiateRequest(BaseModel):
    """Client picks a tier + provider + method + phone. Backend creates
    a payment row with status=PENDING. Success only happens after the
    provider webhook/callback is verified by the backend."""
    tier_id: UUID
    provider: PaymentProvider
    payment_method: PaymentMethod = PaymentMethod.MOBILE_MONEY
    phone_number: str = Field(..., min_length=6, max_length=20)
    description: Optional[str] = Field(None, max_length=500)


class PaymentInitiateResponse(BaseModel):
    payment_id: UUID
    reference: str
    amount: Decimal
    currency: str
    provider: PaymentProvider
    status: PaymentStatus
    # Provider-agnostic hint (e.g. "Dial *126# and confirm the prompt").
    instructions: Optional[str] = None
    # Provider failure reason or informational message.
    message: Optional[str] = None


class PaymentRefundRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500)
    amount: Optional[Decimal] = Field(None, ge=0)


# ─────────────────────────────────────────────────────────────
#  Payment — live status polling (new)
# ─────────────────────────────────────────────────────────────

class PaymentStatusResponse(BaseModel):
    """
    Response for GET /api/v1/professional-payments/status/{reference}.

    Polled by the frontend right after /initiate to know when MTN
    has confirmed (SUCCESSFUL) or rejected (FAILED) the charge.
    """
    status: str
    reason: Optional[str] = None
    financial_transaction_id: Optional[str] = None
    amount: Optional[str] = None
    currency: Optional[str] = None