from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

from app.enums.professional import (
    AuditAction,
    DeletionType,
    ExperienceLevel,
    ProfessionalAccountStatus,
    VerificationStatus,
)


# ─────────────────────────────────────────────────────────────
#  Nested user snippet
# ─────────────────────────────────────────────────────────────

class ProfessionalUserPublic(BaseModel):
    id: UUID
    username: Optional[str] = None
    first_name: str
    last_name: str
    profile_image_url: Optional[str] = None
    city: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────────────────────────────────────────
#  Create / Update
# ─────────────────────────────────────────────────────────────

class ProfessionalCreate(BaseModel):
    profession: str = Field(..., min_length=2, max_length=100)
    headline: Optional[str] = Field(None, max_length=150)
    bio: Optional[str] = Field(None, max_length=1500)
    experience_level: ExperienceLevel = ExperienceLevel.INTERMEDIATE
    years_of_experience: Optional[int] = Field(None, ge=0, le=80)

    company_name: Optional[str] = Field(None, max_length=150)
    job_title: Optional[str] = Field(None, max_length=120)
    employment_type: Optional[str] = Field(None, max_length=50)

    website_url: Optional[str] = Field(None, max_length=300)
    linkedin_url: Optional[str] = Field(None, max_length=300)
    portfolio_url: Optional[str] = Field(None, max_length=300)
    facebook_url: Optional[str] = Field(None, max_length=300)
    instagram_url: Optional[str] = Field(None, max_length=300)
    twitter_url: Optional[str] = Field(None, max_length=300)

    skills: Optional[List[str]] = None
    services: Optional[List[str]] = None
    certifications: Optional[List[dict]] = None
    education: Optional[List[dict]] = None
    languages: Optional[List[str]] = None

    hourly_rate: Optional[float] = Field(None, ge=0)
    currency: str = Field("XAF", min_length=3, max_length=3)

    country: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)

    available: bool = True
    availability_notes: Optional[str] = Field(None, max_length=500)
    response_time_hours: Optional[int] = Field(None, ge=0, le=168)


class ProfessionalUpdate(BaseModel):
    profession: Optional[str] = Field(None, min_length=2, max_length=100)
    headline: Optional[str] = Field(None, max_length=150)
    bio: Optional[str] = Field(None, max_length=1500)
    experience_level: Optional[ExperienceLevel] = None
    years_of_experience: Optional[int] = Field(None, ge=0, le=80)

    company_name: Optional[str] = Field(None, max_length=150)
    job_title: Optional[str] = Field(None, max_length=120)
    employment_type: Optional[str] = Field(None, max_length=50)

    website_url: Optional[str] = Field(None, max_length=300)
    linkedin_url: Optional[str] = Field(None, max_length=300)
    portfolio_url: Optional[str] = Field(None, max_length=300)
    facebook_url: Optional[str] = Field(None, max_length=300)
    instagram_url: Optional[str] = Field(None, max_length=300)
    twitter_url: Optional[str] = Field(None, max_length=300)

    skills: Optional[List[str]] = None
    services: Optional[List[str]] = None
    certifications: Optional[List[dict]] = None
    education: Optional[List[dict]] = None
    languages: Optional[List[str]] = None

    hourly_rate: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)

    country: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)

    available: Optional[bool] = None
    availability_notes: Optional[str] = Field(None, max_length=500)
    response_time_hours: Optional[int] = Field(None, ge=0, le=168)


# ─────────────────────────────────────────────────────────────
#  Responses
# ─────────────────────────────────────────────────────────────

class ProfessionalResponse(BaseModel):
    """Used for the owner viewing their own profile and for
    public profile pages. Never includes fraud/snapshot data."""

    id: UUID
    user_id: UUID

    profession: str
    headline: Optional[str] = None
    bio: Optional[str] = None
    experience_level: ExperienceLevel
    years_of_experience: Optional[int] = None

    company_name: Optional[str] = None
    job_title: Optional[str] = None
    employment_type: Optional[str] = None

    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    twitter_url: Optional[str] = None

    skills: Optional[List[str]] = None
    services: Optional[List[str]] = None
    certifications: Optional[List[dict]] = None
    education: Optional[List[dict]] = None
    languages: Optional[List[str]] = None

    hourly_rate: Optional[float] = None
    currency: str

    country: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None

    available: bool
    availability_notes: Optional[str] = None
    response_time_hours: Optional[int] = None

    status: ProfessionalAccountStatus
    is_verified: bool
    verification_status: VerificationStatus
    verified_at: Optional[datetime] = None

    rating: float
    total_reviews: int
    completed_jobs: int
    profile_completeness: int

    created_at: datetime
    updated_at: datetime

    user: ProfessionalUserPublic

    model_config = ConfigDict(from_attributes=True)


class ProfessionalPublicResponse(BaseModel):
    """Stripped-down view for discovery lists — no company/rate/links
    unless you want them. Extend later if needed."""

    id: UUID
    profession: str
    headline: Optional[str] = None
    experience_level: ExperienceLevel
    years_of_experience: Optional[int] = None
    company_name: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    hourly_rate: Optional[float] = None
    currency: str
    available: bool
    is_verified: bool
    rating: float
    total_reviews: int
    completed_jobs: int
    skills: Optional[List[str]] = None
    services: Optional[List[str]] = None
    user: ProfessionalUserPublic

    model_config = ConfigDict(from_attributes=True)


class ProfessionalListResponse(BaseModel):
    items: List[ProfessionalPublicResponse]
    total: int
    page: int
    size: int


# ─────────────────────────────────────────────────────────────
#  Admin
# ─────────────────────────────────────────────────────────────

class ProfessionalAdminResponse(ProfessionalResponse):
    """Everything from ProfessionalResponse + admin-only fields."""

    verification_data: Optional[dict] = None
    verification_attempts: int
    verification_last_attempt_at: Optional[datetime] = None

    admin_override_status: Optional[VerificationStatus] = None
    admin_override_by: Optional[UUID] = None
    admin_override_at: Optional[datetime] = None
    admin_override_reason: Optional[str] = None

    is_flagged: bool
    fraud_notes: Optional[str] = None
    trust_score: int

    deleted_at: Optional[datetime] = None
    deleted_by_user_id: Optional[UUID] = None
    deletion_type: Optional[DeletionType] = None
    deletion_reason: Optional[str] = None
    retention_until: Optional[datetime] = None

    snapshot_email: Optional[str] = None
    snapshot_username: Optional[str] = None
    snapshot_ip: Optional[str] = None
    snapshot_user_agent: Optional[str] = None


class ProfessionalAdminListResponse(BaseModel):
    items: List[ProfessionalAdminResponse]
    total: int
    page: int
    size: int


# ─────────────────────────────────────────────────────────────
#  Admin actions
# ─────────────────────────────────────────────────────────────

class VerificationOverrideRequest(BaseModel):
    new_status: VerificationStatus
    reason: str = Field(..., min_length=5, max_length=500)

    @field_validator("new_status")
    @classmethod
    def _allowed(cls, v: VerificationStatus) -> VerificationStatus:
        allowed = {
            VerificationStatus.MANUAL_APPROVED,
            VerificationStatus.MANUAL_REJECTED,
        }
        if v not in allowed:
            raise ValueError(
                "new_status must be manual_approved or manual_rejected"
            )
        return v


class SuspendProfessionalRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500)


class FlagProfessionalRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500)
    notes: Optional[str] = Field(None, max_length=2000)


class TrustScoreUpdateRequest(BaseModel):
    new_score: int = Field(..., ge=0, le=100)
    reason: str = Field(..., min_length=5, max_length=500)


# ─────────────────────────────────────────────────────────────
#  Audit log
# ─────────────────────────────────────────────────────────────

class ProfessionalAuditLogResponse(BaseModel):
    id: UUID
    professional_id: UUID
    actor_user_id: Optional[UUID] = None
    actor_role: Optional[str] = None
    action: AuditAction
    old_value: Optional[dict] = None
    new_value: Optional[dict] = None
    reason: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfessionalAuditLogListResponse(BaseModel):
    items: List[ProfessionalAuditLogResponse]
    total: int
    page: int
    size: int