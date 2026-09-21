# app/models/professional.py

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4

from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, DECIMAL, Column, String
from sqlmodel import Field, Relationship, SQLModel

from app.enums.professional import (
    DeletionType,
    ExperienceLevel,
    ProfessionalAccountStatus,
    VerificationStatus,
)

if TYPE_CHECKING:
    from app.models.professional_ai_usage import ProfessionalAIUsage
    from app.models.professional_audit_log import ProfessionalAuditLog
    from app.models.professional_location import ProfessionalLocation
    from app.models.professional_payment import ProfessionalPayment
    from app.models.professional_service_area import ProfessionalServiceArea
    from app.models.professional_tier_subscription import (
        ProfessionalTierSubscription,
    )
    from app.models.user import User


class Professional(SQLModel, table=True):
    __tablename__ = "professionals"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: UUID = Field(
        foreign_key="users.id", unique=True, nullable=False, index=True
    )

    # ── Core identity ─────────────────────────────────────────
    profession: str = Field(nullable=False, max_length=100)
    headline: Optional[str] = Field(default=None, max_length=150)
    bio: Optional[str] = Field(default=None, max_length=1500)

    experience_level: ExperienceLevel = Field(
        sa_column=Column(
            String(30),
            nullable=False,
            default=ExperienceLevel.INTERMEDIATE.value,
        ),
    )
    years_of_experience: Optional[int] = Field(default=None, ge=0, le=80)

    # ── Employment ────────────────────────────────────────────
    company_name: Optional[str] = Field(default=None, max_length=150)
    job_title: Optional[str] = Field(default=None, max_length=120)
    employment_type: Optional[str] = Field(default=None, max_length=50)

    # ── Public links ──────────────────────────────────────────
    website_url: Optional[str] = Field(default=None, max_length=300)
    linkedin_url: Optional[str] = Field(default=None, max_length=300)
    portfolio_url: Optional[str] = Field(default=None, max_length=300)
    facebook_url: Optional[str] = Field(default=None, max_length=300)
    instagram_url: Optional[str] = Field(default=None, max_length=300)
    twitter_url: Optional[str] = Field(default=None, max_length=300)

    # ── Skills / services / credentials ───────────────────────
    skills: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    services: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    certifications: Optional[List[dict]] = Field(
        default=None, sa_column=Column(JSON)
    )
    education: Optional[List[dict]] = Field(default=None, sa_column=Column(JSON))
    languages: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))

    # ── Pricing ───────────────────────────────────────────────
    hourly_rate: Optional[float] = Field(
        default=None, sa_column=Column(DECIMAL(10, 2))
    )
    currency: str = Field(default="XAF", max_length=3, nullable=False)

    # ── Location ──────────────────────────────────────────────
    country: Optional[str] = Field(default=None, max_length=100)
    region: Optional[str] = Field(default=None, max_length=100)
    city: Optional[str] = Field(default=None, max_length=100)

    # ── Availability ──────────────────────────────────────────
    available: bool = Field(default=True, nullable=False)
    availability_notes: Optional[str] = Field(default=None, max_length=500)
    response_time_hours: Optional[int] = Field(default=None, ge=0)

    # ── Contact preferences (not duplicated in Portfolio) ─────
    preferred_contact_method: Optional[str] = Field(default=None, max_length=30)
    public_contact_enabled: bool = Field(default=True, nullable=False)

    # ── Service flags ─────────────────────────────────────────
    is_emergency_available: bool = Field(
        default=False, nullable=False, index=True
    )

    # ── Status & reputation ───────────────────────────────────
    status: ProfessionalAccountStatus = Field(
        sa_column=Column(
            String(30),
            nullable=False,
            default=ProfessionalAccountStatus.PENDING.value,
            index=True,
        ),
    )
    is_verified: bool = Field(default=False, nullable=False)
    rating: float = Field(default=0.0, sa_column=Column(DECIMAL(3, 2)))
    total_reviews: int = Field(default=0, nullable=False)
    completed_jobs: int = Field(default=0, nullable=False)
    profile_completeness: int = Field(default=0, ge=0, le=100, nullable=False)

    # ── Digital verification (separate from paid tier) ────────
    verification_status: VerificationStatus = Field(
        sa_column=Column(
            String(30),
            nullable=False,
            default=VerificationStatus.NOT_STARTED.value,
            index=True,
        ),
    )
    verification_data: Optional[dict] = Field(
        default=None, sa_column=Column(JSON)
    )
    verification_attempts: int = Field(default=0, nullable=False)
    verification_last_attempt_at: Optional[datetime] = Field(default=None)
    verified_at: Optional[datetime] = Field(default=None)

    # ── Admin override ────────────────────────────────────────
    admin_override_status: Optional[VerificationStatus] = Field(
        default=None,
        sa_column=Column(String(30), nullable=True),
    )
    admin_override_by: Optional[UUID] = Field(
        default=None, foreign_key="users.id", nullable=True
    )
    admin_override_at: Optional[datetime] = Field(default=None)
    admin_override_reason: Optional[str] = Field(default=None, max_length=500)

    # ── Fraud / safety ────────────────────────────────────────
    is_flagged: bool = Field(default=False, nullable=False, index=True)
    fraud_notes: Optional[str] = Field(default=None, max_length=2000)
    trust_score: int = Field(default=50, ge=0, le=100, nullable=False)

    # ── Soft delete + retention ───────────────────────────────
    deleted_at: Optional[datetime] = Field(default=None, index=True)
    deleted_by_user_id: Optional[UUID] = Field(
        default=None, foreign_key="users.id"
    )
    deletion_type: Optional[DeletionType] = Field(
        default=None, sa_column=Column(String(30), nullable=True)
    )
    deletion_reason: Optional[str] = Field(default=None, max_length=500)
    retention_until: Optional[datetime] = Field(default=None)

    # ── Admin snapshot ────────────────────────────────────────
    snapshot_email: Optional[str] = Field(default=None, max_length=255)
    snapshot_username: Optional[str] = Field(default=None, max_length=50)
    snapshot_ip: Optional[str] = Field(default=None, max_length=45)
    snapshot_user_agent: Optional[str] = Field(default=None, max_length=500)

    # ── AI embedding ──────────────────────────────────────────
    embedding: Optional[List[float]] = Field(
        default=None, sa_column=Column(Vector(768))
    )
    embedding_stale: bool = Field(default=False, nullable=False)

    # ── Timestamps ────────────────────────────────────────────
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    # ── Relationships ─────────────────────────────────────────
    user: "User" = Relationship(
        back_populates="professional",
        sa_relationship_kwargs={"foreign_keys": "[Professional.user_id]"},
    )

    locations: list["ProfessionalLocation"] = Relationship(
        back_populates="professional",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    service_areas: list["ProfessionalServiceArea"] = Relationship(
        back_populates="professional",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    audit_logs: list["ProfessionalAuditLog"] = Relationship(
        back_populates="professional",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    # Financial / history relationships — no cascade.
    tier_subscriptions: list["ProfessionalTierSubscription"] = Relationship(
        back_populates="professional",
    )
    payments: list["ProfessionalPayment"] = Relationship(
        back_populates="professional",
    )

    # Operational data — cascade is safe.
    ai_usages: list["ProfessionalAIUsage"] = Relationship(
        back_populates="professional",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )