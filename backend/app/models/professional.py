from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import JSON, DECIMAL
from sqlmodel import Column, Field, Relationship, SQLModel
from pgvector.sqlalchemy import Vector

from app.enums.professional import (
    DeletionType,
    ExperienceLevel,
    ProfessionalAccountStatus,
    VerificationStatus,
)

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.professional_location import ProfessionalLocation
    from app.models.professional_service_area import ProfessionalServiceArea
    from app.models.professional_audit_log import ProfessionalAuditLog


class Professional(SQLModel, table=True):
    __tablename__ = "professionals"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: UUID = Field(
        foreign_key="users.id", unique=True, nullable=False, index=True
    )

    # ─── Core identity ───────────────────────────────────────
    profession: str = Field(nullable=False, max_length=100)
    headline: Optional[str] = Field(default=None, max_length=150)
    bio: Optional[str] = Field(default=None, max_length=1500)
    experience_level: ExperienceLevel = Field(
        default=ExperienceLevel.INTERMEDIATE, nullable=False
    )
    years_of_experience: Optional[int] = Field(default=None, ge=0, le=80)

    # ─── Employment / business ───────────────────────────────
    company_name: Optional[str] = Field(default=None, max_length=150)
    job_title: Optional[str] = Field(default=None, max_length=120)
    employment_type: Optional[str] = Field(default=None, max_length=50)

    # ─── Public links ────────────────────────────────────────
    website_url: Optional[str] = Field(default=None, max_length=300)
    linkedin_url: Optional[str] = Field(default=None, max_length=300)
    portfolio_url: Optional[str] = Field(default=None, max_length=300)
    facebook_url: Optional[str] = Field(default=None, max_length=300)
    instagram_url: Optional[str] = Field(default=None, max_length=300)
    twitter_url: Optional[str] = Field(default=None, max_length=300)

    # ─── Skills / services / credentials ─────────────────────
    skills: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    services: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    certifications: Optional[List[dict]] = Field(default=None, sa_column=Column(JSON))
    education: Optional[List[dict]] = Field(default=None, sa_column=Column(JSON))
    languages: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))

    # ─── Pricing ─────────────────────────────────────────────
    hourly_rate: Optional[float] = Field(
        default=None, sa_column=Column(DECIMAL(10, 2))
    )
    currency: str = Field(default="XAF", max_length=3, nullable=False)

    # ─── Location summary (kept for compat; geographic data lives in dedicated tables) ──
    country: Optional[str] = Field(default=None, max_length=100)
    region: Optional[str] = Field(default=None, max_length=100)
    city: Optional[str] = Field(default=None, max_length=100)

    # ─── Availability ────────────────────────────────────────
    available: bool = Field(default=True, nullable=False)
    availability_notes: Optional[str] = Field(default=None, max_length=500)
    response_time_hours: Optional[int] = Field(default=None, ge=0)

    # ─── Status & reputation ─────────────────────────────────
    status: ProfessionalAccountStatus = Field(
        default=ProfessionalAccountStatus.PENDING, nullable=False, index=True
    )
    is_verified: bool = Field(default=False, nullable=False)
    rating: float = Field(default=0.0, sa_column=Column(DECIMAL(3, 2)))
    total_reviews: int = Field(default=0, nullable=False)
    completed_jobs: int = Field(default=0, nullable=False)
    profile_completeness: int = Field(default=0, ge=0, le=100, nullable=False)

    # ─── Verification ────────────────────────────────────────
    verification_status: VerificationStatus = Field(
        default=VerificationStatus.NOT_STARTED, nullable=False, index=True
    )
    verification_data: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    verification_attempts: int = Field(default=0, nullable=False)
    verification_last_attempt_at: Optional[datetime] = Field(default=None)
    verified_at: Optional[datetime] = Field(default=None)

    # ─── Admin override (fallback when Didit fails) ──────────
    admin_override_status: Optional[VerificationStatus] = Field(default=None)
    admin_override_by: Optional[UUID] = Field(
        default=None, foreign_key="users.id", nullable=True
    )
    admin_override_at: Optional[datetime] = Field(default=None)
    admin_override_reason: Optional[str] = Field(default=None, max_length=500)

    # ─── Fraud / safety (admin-only) ─────────────────────────
    is_flagged: bool = Field(default=False, nullable=False, index=True)
    fraud_notes: Optional[str] = Field(default=None, max_length=2000)
    trust_score: int = Field(default=50, ge=0, le=100, nullable=False)

    # ─── Soft delete + retention ─────────────────────────────
    deleted_at: Optional[datetime] = Field(default=None, index=True)
    deleted_by_user_id: Optional[UUID] = Field(
        default=None, foreign_key="users.id"
    )
    deletion_type: Optional[DeletionType] = Field(default=None)
    deletion_reason: Optional[str] = Field(default=None, max_length=500)
    retention_until: Optional[datetime] = Field(default=None)

    # ─── Admin snapshot (preserved after user deletion) ──────
    snapshot_email: Optional[str] = Field(default=None, max_length=255)
    snapshot_username: Optional[str] = Field(default=None, max_length=50)
    snapshot_ip: Optional[str] = Field(default=None, max_length=45)
    snapshot_user_agent: Optional[str] = Field(default=None, max_length=500)

    # ─── AI embedding ────────────────────────────────────────
    embedding: Optional[List[float]] = Field(
        default=None, sa_column=Column(Vector(768))
    )
    embedding_stale: bool = Field(default=False, nullable=False)

    # ─── Timestamps ──────────────────────────────────────────
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    # ─── Relationships ───────────────────────────────────────
    # `foreign_keys` is REQUIRED because we have 3 FKs pointing at users.id.
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