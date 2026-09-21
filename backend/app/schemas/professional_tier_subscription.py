# app/schemas/professional_tier_subscription.py

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.enums.payment import PaymentMethod, PaymentProvider
from app.enums.professional_tier import ProfessionalSubscriptionStatus
from app.schemas.professional_tier import ProfessionalTierResponse


# ─────────────────────────────────────────────────────────────
#  Subscription
# ─────────────────────────────────────────────────────────────

class ProfessionalTierSubscriptionResponse(BaseModel):
    id: UUID
    professional_id: UUID
    tier_id: UUID
    status: ProfessionalSubscriptionStatus
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    auto_renew: bool
    cancelled_at: Optional[datetime] = None
    previous_subscription_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfessionalTierSubscriptionWithTierResponse(
    ProfessionalTierSubscriptionResponse
):
    tier: Optional[ProfessionalTierResponse] = None


class ActiveSubscriptionResponse(BaseModel):
    """`subscription` is None when the professional has no active
    subscription. `days_remaining` is derived, not stored."""
    is_active: bool
    days_remaining: Optional[int] = None
    subscription: Optional[ProfessionalTierSubscriptionWithTierResponse] = None


class ProfessionalTierSubscriptionListResponse(BaseModel):
    items: List[ProfessionalTierSubscriptionWithTierResponse]
    total: int
    page: int
    size: int


# ─────────────────────────────────────────────────────────────
#  Actions
# ─────────────────────────────────────────────────────────────

class SubscriptionUpgradeRequest(BaseModel):
    """Starts a tier purchase/upgrade. Backend creates a PENDING payment;
    the subscription is only created after provider confirmation."""
    tier_id: UUID
    provider: PaymentProvider
    payment_method: PaymentMethod = PaymentMethod.MOBILE_MONEY
    phone_number: str = Field(..., min_length=6, max_length=20)
    auto_renew: bool = False


class SubscriptionCancelRequest(BaseModel):
    reason: Optional[str] = Field(None, max_length=500)