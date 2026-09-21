# app/models/professional_ai_usage.py

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.professional import Professional


class ProfessionalAIUsage(SQLModel, table=True):
    __tablename__ = "professional_ai_usage"
    __table_args__ = (
        UniqueConstraint(
            "professional_id",
            "feature_key",
            "period_start",
            name="uq_ai_usage_professional_feature_period",
        ),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)

    professional_id: UUID = Field(
        foreign_key="professionals.id", nullable=False, index=True
    )
    subscription_id: Optional[UUID] = Field(
        default=None,
        foreign_key="professional_tier_subscriptions.id",
        nullable=True,
        index=True,
    )

    feature_key: str = Field(nullable=False, max_length=100, index=True)
    usage_count: int = Field(default=0, nullable=False, ge=0)
    usage_limit: int = Field(nullable=False, ge=0)

    period_start: datetime = Field(nullable=False, index=True)
    period_end: datetime = Field(nullable=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    professional: "Professional" = Relationship(back_populates="ai_usages")