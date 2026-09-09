from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel, Column
from sqlalchemy import JSON, DECIMAL
from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, DECIMAL, Column

if TYPE_CHECKING:
    from app.models.user import User


class Professional(SQLModel, table=True):
    __tablename__ = "professionals"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
    )

    user_id: UUID = Field(
        foreign_key="users.id",
        unique=True,
        nullable=False,
        index=True,
    )

    profession: str = Field(nullable=False, max_length=100)
    bio: Optional[str] = Field(default=None, max_length=1000)
    skills: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    years_of_experience: Optional[int] = Field(default=None, ge=0)
    services: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    hourly_rate: Optional[float] = Field(default=None, sa_column=Column(DECIMAL(10, 2)))
    country: Optional[str] = Field(default=None, max_length=100)
    region: Optional[str] = Field(default=None, max_length=100)
    city: Optional[str] = Field(default=None, max_length=100)
    available: bool = Field(default=True)

    # System-controlled fields
    is_verified: bool = Field(default=False)          # kept for legacy
    rating: float = Field(default=0.0, sa_column=Column(DECIMAL(3, 2)))
    total_reviews: int = Field(default=0)
    completed_jobs: int = Field(default=0)

        # ─── AI Embedding for Semantic Search ──────────────
    embedding: Optional[List[float]] = Field(
        default=None,
        sa_column=Column(Vector(1536))  # 1536 dimensions for text-embedding-3-small
    )
    embedding_stale: bool = Field(default=False)

    # ─── Didit KYC fields ────────────────────────────
    verification_status: str = Field(
        default="not_started",
        max_length=50,
    )
    verification_data: Optional[dict] = Field(
        default=None,
        sa_column=Column(JSON),
    )
    verified_at: Optional[datetime] = Field(default=None)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationship back to User
    user: "User" = Relationship(back_populates="professional")