# app/models/professional_tier_subscription.py

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import Column, String
from sqlmodel import Field, Relationship, SQLModel

from app.enums.professional_tier import ProfessionalSubscriptionStatus

if TYPE_CHECKING:
    from app.models.professional import Professional
    from app.models.professional_payment import ProfessionalPayment
    from app.models.professional_tier import ProfessionalTier


class ProfessionalTierSubscription(SQLModel, table=True):
    __tablename__ = "professional_tier_subscriptions"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)

    professional_id: UUID = Field(
        foreign_key="professionals.id", nullable=False, index=True
    )
    tier_id: UUID = Field(
        foreign_key="professional_tiers.id", nullable=False, index=True
    )

    status: ProfessionalSubscriptionStatus = Field(
        sa_column=Column(
            String(30),
            nullable=False,
            default=ProfessionalSubscriptionStatus.PENDING.value,
            index=True,
        ),
    )

    starts_at: Optional[datetime] = Field(default=None, index=True)
    expires_at: Optional[datetime] = Field(default=None, index=True)
    auto_renew: bool = Field(default=False, nullable=False)
    cancelled_at: Optional[datetime] = Field(default=None)

    # Self-referential chain — preserves upgrade/renewal history.
    previous_subscription_id: Optional[UUID] = Field(
        default=None,
        foreign_key="professional_tier_subscriptions.id",
        nullable=True,
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    professional: "Professional" = Relationship(
        back_populates="tier_subscriptions"
    )
    tier: "ProfessionalTier" = Relationship(back_populates="subscriptions")

    # Financial records — no cascade from this side.
    payments: list["ProfessionalPayment"] = Relationship(
        back_populates="subscription"
    )

    previous_subscription: Optional["ProfessionalTierSubscription"] = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": (
                "[ProfessionalTierSubscription.previous_subscription_id]"
            ),
            "remote_side": "[ProfessionalTierSubscription.id]",
        },
    )