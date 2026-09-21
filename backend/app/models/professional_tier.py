# app/models/professional_tier.py

from datetime import datetime, timezone
from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import Column, DECIMAL, JSON, String, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

from app.enums.professional_tier import TierFeatureType

if TYPE_CHECKING:
    from app.models.professional_tier_subscription import (
        ProfessionalTierSubscription,
    )


class ProfessionalTier(SQLModel, table=True):
    __tablename__ = "professional_tiers"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)

    name: str = Field(nullable=False, max_length=100, unique=True)
    level: int = Field(nullable=False, unique=True, ge=1, le=100, index=True)
    description: Optional[str] = Field(default=None, max_length=1000)

    # Money — DECIMAL, never float.
    price: Decimal = Field(sa_column=Column(DECIMAL(12, 2), nullable=False))
    currency: str = Field(default="XAF", max_length=3, nullable=False)
    duration_days: int = Field(default=30, nullable=False, ge=1)

    is_active: bool = Field(default=True, nullable=False, index=True)
    is_public: bool = Field(default=True, nullable=False)
    display_order: int = Field(default=0, nullable=False)
 
    # Badge config — final visual design deferred to frontend.
    badge_name: Optional[str] = Field(default=None, max_length=100)
    badge_code: Optional[str] = Field(default=None, max_length=50, unique=True)
    badge_icon: Optional[str] = Field(default=None, max_length=255)
    badge_color: Optional[str] = Field(default=None, max_length=20)
    badge_secondary_color: Optional[str] = Field(default=None, max_length=20)
    badge_shape: Optional[str] = Field(default=None, max_length=50)
    badge_description: Optional[str] = Field(default=None, max_length=500)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    features: list["ProfessionalTierFeature"] = Relationship(
        back_populates="tier",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    subscriptions: list["ProfessionalTierSubscription"] = Relationship(
        back_populates="tier",
    )


class ProfessionalTierFeature(SQLModel, table=True):
    __tablename__ = "professional_tier_features"
    __table_args__ = (
        UniqueConstraint("tier_id", "feature_key", name="uq_tier_feature_key"),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    tier_id: UUID = Field(
        foreign_key="professional_tiers.id", nullable=False, index=True
    )

    # Plain VARCHAR — new features require no migration.
    feature_key: str = Field(nullable=False, max_length=100, index=True)
    feature_name: str = Field(nullable=False, max_length=150)
    feature_description: Optional[str] = Field(default=None, max_length=1000)

    feature_type: TierFeatureType = Field(
        sa_column=Column(
            String(30), nullable=False, default=TierFeatureType.BOOLEAN.value
        ),
    )

    # Always a JSON object. Examples:
    #   {"enabled": true}
    #   {"monthly_credits": 500, "daily_requests": 50}
    feature_value: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    is_enabled: bool = Field(default=True, nullable=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    tier: "ProfessionalTier" = Relationship(back_populates="features")