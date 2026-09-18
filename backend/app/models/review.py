# app/models/review.py

from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import UniqueConstraint          # 👈 FIXED — was sqlmodel
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.professional import Professional


class Review(SQLModel, table=True):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint(
            "reviewer_id",
            "professional_id",
            name="uq_review_reviewer_professional",
        ),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)

    # Author of the review (any authenticated user)
    reviewer_id: UUID = Field(
        foreign_key="users.id", nullable=False, index=True
    )

    # Target of the review (professional only)
    professional_id: UUID = Field(
        foreign_key="professionals.id", nullable=False, index=True
    )

    rating: int = Field(ge=1, le=5, nullable=False)
    title: Optional[str] = Field(default=None, max_length=150)
    comment: str = Field(nullable=False, max_length=2000)
    is_verified_hire: bool = Field(default=False, nullable=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    # ── Relationships ────────────────────────────────────────
    # `foreign_keys` is REQUIRED here because User has many FKs pointing
    # at it across the schema — SQLAlchemy needs a hint to know which
    # FK column to use for the join.
    reviewer: "User" = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "[Review.reviewer_id]",
            "lazy": "joined",
        },
    )

    professional: "Professional" = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "[Review.professional_id]",
        },
    )