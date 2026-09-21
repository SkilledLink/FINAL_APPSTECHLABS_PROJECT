# app/models/professional_payment.py

from datetime import datetime, timezone
from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import Column, DECIMAL, JSON, String
from sqlmodel import Field, Relationship, SQLModel

from app.enums.payment import PaymentMethod, PaymentProvider, PaymentStatus

if TYPE_CHECKING:
    from app.models.professional import Professional
    from app.models.professional_tier import ProfessionalTier
    from app.models.professional_tier_subscription import (
        ProfessionalTierSubscription,
    )
    from app.models.user import User


class ProfessionalPayment(SQLModel, table=True):
    __tablename__ = "professional_payments"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)

    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    professional_id: Optional[UUID] = Field(
        default=None, foreign_key="professionals.id", nullable=True, index=True
    )
    tier_id: UUID = Field(
        foreign_key="professional_tiers.id", nullable=False, index=True
    )
    subscription_id: Optional[UUID] = Field(
        default=None,
        foreign_key="professional_tier_subscriptions.id",
        nullable=True,
        index=True,
    )

    # Internal reference (e.g. "SKL-A1B2C3D4"). Always unique.
    reference: str = Field(unique=True, index=True, nullable=False, max_length=50)

    provider: PaymentProvider = Field(
        sa_column=Column(String(30), nullable=False, index=True),
    )

    # Provider-side identifier. NULL until provider confirms.
    provider_transaction_id: Optional[str] = Field(
        default=None, unique=True, index=True, max_length=150
    )

    # Money — DECIMAL, never float.
    amount: Decimal = Field(sa_column=Column(DECIMAL(12, 2), nullable=False))
    currency: str = Field(default="XAF", max_length=3, nullable=False)

    status: PaymentStatus = Field(
        sa_column=Column(
            String(30),
            nullable=False,
            default=PaymentStatus.PENDING.value,
            index=True,
        ),
    )
    payment_method: PaymentMethod = Field(
        sa_column=Column(
            String(30),
            nullable=False,
            default=PaymentMethod.MOBILE_MONEY.value,
        ),
    )

    description: Optional[str] = Field(default=None, max_length=500)

    # Provider raw payload → JSON.
    provider_response: Optional[dict] = Field(
        default=None, sa_column=Column(JSON)
    )

    # Free-form extras. Named `extra_metadata` to avoid clashing with
    # SQLAlchemy's reserved `metadata` attribute.
    extra_metadata: Optional[dict] = Field(
        default=None, sa_column=Column(JSON)
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    paid_at: Optional[datetime] = Field(default=None)
    failed_at: Optional[datetime] = Field(default=None)

    user: "User" = Relationship()
    professional: Optional["Professional"] = Relationship(
        back_populates="payments"
    )
    tier: "ProfessionalTier" = Relationship()
    subscription: Optional["ProfessionalTierSubscription"] = Relationship(
        back_populates="payments"
    )