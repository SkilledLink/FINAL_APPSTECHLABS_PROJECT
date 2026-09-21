# app/schemas/professional_tier.py

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.enums.professional_tier import TierFeatureType


# ─────────────────────────────────────────────────────────────
#  Tier features
# ─────────────────────────────────────────────────────────────

class TierFeatureResponse(BaseModel):
    id: UUID
    tier_id: UUID
    feature_key: str
    feature_name: str
    feature_description: Optional[str] = None
    feature_type: TierFeatureType
    feature_value: Optional[dict] = None
    is_enabled: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TierFeatureCreate(BaseModel):
    feature_key: str = Field(..., min_length=2, max_length=100)
    feature_name: str = Field(..., min_length=2, max_length=150)
    feature_description: Optional[str] = Field(None, max_length=1000)
    feature_type: TierFeatureType = TierFeatureType.BOOLEAN
    feature_value: Optional[dict] = None
    is_enabled: bool = True


class TierFeatureUpdate(BaseModel):
    feature_name: Optional[str] = Field(None, min_length=2, max_length=150)
    feature_description: Optional[str] = Field(None, max_length=1000)
    feature_type: Optional[TierFeatureType] = None
    feature_value: Optional[dict] = None
    is_enabled: Optional[bool] = None


# ─────────────────────────────────────────────────────────────
#  Tier
# ─────────────────────────────────────────────────────────────

class ProfessionalTierResponse(BaseModel):
    id: UUID
    name: str
    level: int
    description: Optional[str] = None

    price: Decimal
    currency: str
    duration_days: int

    is_active: bool
    is_public: bool
    display_order: int

    badge_name: Optional[str] = None
    badge_code: Optional[str] = None
    badge_icon: Optional[str] = None
    badge_color: Optional[str] = None
    badge_secondary_color: Optional[str] = None
    badge_shape: Optional[str] = None
    badge_description: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfessionalTierDetailResponse(ProfessionalTierResponse):
    features: List[TierFeatureResponse] = Field(default_factory=list)


class ProfessionalTierCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    level: int = Field(..., ge=1, le=100)
    description: Optional[str] = Field(None, max_length=1000)

    price: Decimal = Field(..., ge=0)
    currency: str = Field("XAF", min_length=3, max_length=3)
    duration_days: int = Field(30, ge=1)

    is_active: bool = True
    is_public: bool = True
    display_order: int = 0

    badge_name: Optional[str] = Field(None, max_length=100)
    badge_code: Optional[str] = Field(None, max_length=50)
    badge_icon: Optional[str] = Field(None, max_length=255)
    badge_color: Optional[str] = Field(None, max_length=20)
    badge_secondary_color: Optional[str] = Field(None, max_length=20)
    badge_shape: Optional[str] = Field(None, max_length=50)
    badge_description: Optional[str] = Field(None, max_length=500)


class ProfessionalTierUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    price: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    duration_days: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None
    display_order: Optional[int] = None

    badge_name: Optional[str] = Field(None, max_length=100)
    badge_code: Optional[str] = Field(None, max_length=50)
    badge_icon: Optional[str] = Field(None, max_length=255)
    badge_color: Optional[str] = Field(None, max_length=20)
    badge_secondary_color: Optional[str] = Field(None, max_length=20)
    badge_shape: Optional[str] = Field(None, max_length=50)
    badge_description: Optional[str] = Field(None, max_length=500)


class ProfessionalTierListResponse(BaseModel):
    items: List[ProfessionalTierDetailResponse]
    total: int


# ─────────────────────────────────────────────────────────────
#  Badge (embedded in Professional responses)
# ─────────────────────────────────────────────────────────────

class ProfessionalTierBadge(BaseModel):
    """Minimal tier info rendered next to a professional. Populated by
    the service layer from the professional's active subscription."""
    tier_id: UUID
    level: int
    name: str
    badge_name: Optional[str] = None
    badge_code: Optional[str] = None
    badge_icon: Optional[str] = None
    badge_color: Optional[str] = None
    badge_secondary_color: Optional[str] = None
    badge_shape: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)