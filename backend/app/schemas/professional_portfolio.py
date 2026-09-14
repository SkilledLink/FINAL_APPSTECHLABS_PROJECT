from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, EmailStr, HttpUrl, field_validator

from app.enums.professional import (
    DurationUnit,
    ClientType,
    PricingType,
    AvailabilityDay,
)
from app.schemas.user import UserResponse


# ─────────────────────────────────────────────────────────
#  Category & Specialty
# ─────────────────────────────────────────────────────────

class SpecialtyResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class CategoryResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    specialties: List[SpecialtyResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────
#  Availability
# ─────────────────────────────────────────────────────────

class AvailabilityCreate(BaseModel):
    day_of_week: AvailabilityDay
    start_time: Optional[str] = Field(default=None, max_length=10)
    end_time: Optional[str] = Field(default=None, max_length=10)
    is_available: bool = True
    break_start: Optional[str] = Field(default=None, max_length=10)
    break_end: Optional[str] = Field(default=None, max_length=10)
    timezone: Optional[str] = Field(default=None, max_length=50)
    notes: Optional[str] = Field(default=None, max_length=300)


class AvailabilityUpdate(BaseModel):
    day_of_week: Optional[AvailabilityDay] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_available: Optional[bool] = None
    break_start: Optional[str] = None
    break_end: Optional[str] = None
    timezone: Optional[str] = None
    notes: Optional[str] = None


class AvailabilityResponse(BaseModel):
    id: UUID
    day_of_week: AvailabilityDay
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_available: bool
    break_start: Optional[str] = None
    break_end: Optional[str] = None
    timezone: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────
#  Services
# ─────────────────────────────────────────────────────────

class ServiceFAQ(BaseModel):
    question: str = Field(min_length=2, max_length=300)
    answer: str = Field(min_length=2, max_length=1000)


class ServiceCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    category: Optional[str] = Field(default=None, max_length=100)
    starting_price: Optional[float] = Field(default=None, ge=0)
    pricing_type: Optional[PricingType] = None
    estimated_duration: Optional[str] = Field(default=None, max_length=50)
    service_area: Optional[str] = Field(default=None, max_length=200)
    is_active: bool = True
    is_emergency_service: bool = False

    # New
    banner_image_url: Optional[str] = Field(default=None, max_length=500)
    gallery: Optional[List[str]] = None
    whats_included: Optional[List[str]] = None
    whats_excluded: Optional[List[str]] = None
    warranty_days: Optional[int] = Field(default=None, ge=0)
    lead_time_days: Optional[int] = Field(default=None, ge=0)
    promo_price: Optional[float] = Field(default=None, ge=0)
    promo_until: Optional[datetime] = None
    faqs: Optional[List[ServiceFAQ]] = None


class ServiceUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    starting_price: Optional[float] = Field(default=None, ge=0)
    pricing_type: Optional[PricingType] = None
    estimated_duration: Optional[str] = None
    service_area: Optional[str] = None
    is_active: Optional[bool] = None
    is_emergency_service: Optional[bool] = None

    banner_image_url: Optional[str] = None
    gallery: Optional[List[str]] = None
    whats_included: Optional[List[str]] = None
    whats_excluded: Optional[List[str]] = None
    warranty_days: Optional[int] = Field(default=None, ge=0)
    lead_time_days: Optional[int] = Field(default=None, ge=0)
    promo_price: Optional[float] = Field(default=None, ge=0)
    promo_until: Optional[datetime] = None
    faqs: Optional[List[ServiceFAQ]] = None


class ServiceResponse(BaseModel):
    id: UUID
    portfolio_id: UUID
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    starting_price: Optional[float] = None
    pricing_type: Optional[PricingType] = None
    estimated_duration: Optional[str] = None
    service_area: Optional[str] = None
    is_active: bool
    is_emergency_service: bool

    banner_image_url: Optional[str] = None
    gallery: Optional[List[str]] = None
    whats_included: Optional[List[str]] = None
    whats_excluded: Optional[List[str]] = None
    warranty_days: Optional[int] = None
    lead_time_days: Optional[int] = None
    promo_price: Optional[float] = None
    promo_until: Optional[datetime] = None
    faqs: Optional[List[ServiceFAQ]] = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────
#  Works
# ─────────────────────────────────────────────────────────

class WorkCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    service_category: Optional[str] = Field(default=None, max_length=100)
    location: Optional[str] = Field(default=None, max_length=200)
    completed_at: Optional[datetime] = None
    duration_value: Optional[int] = Field(default=None, ge=0)
    duration_unit: Optional[DurationUnit] = None
    team_size: Optional[int] = Field(default=None, ge=1)
    client_type: Optional[ClientType] = None

    # New
    gallery: Optional[List[str]] = None
    cost: Optional[float] = Field(default=None, ge=0)
    client_name: Optional[str] = Field(default=None, max_length=150)
    client_testimonial: Optional[str] = Field(default=None, max_length=1500)
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    service_id: Optional[UUID] = None


class WorkUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    service_category: Optional[str] = None
    location: Optional[str] = None
    completed_at: Optional[datetime] = None
    duration_value: Optional[int] = None
    duration_unit: Optional[DurationUnit] = None
    team_size: Optional[int] = None
    client_type: Optional[ClientType] = None

    gallery: Optional[List[str]] = None
    cost: Optional[float] = Field(default=None, ge=0)
    client_name: Optional[str] = None
    client_testimonial: Optional[str] = None
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    service_id: Optional[UUID] = None


class WorkResponse(BaseModel):
    id: UUID
    portfolio_id: UUID
    title: str
    description: Optional[str] = None
    service_category: Optional[str] = None
    location: Optional[str] = None
    completed_at: Optional[datetime] = None
    duration_value: Optional[int] = None
    duration_unit: Optional[DurationUnit] = None
    team_size: Optional[int] = None
    client_type: Optional[ClientType] = None

    gallery: Optional[List[str]] = None
    cost: Optional[float] = None
    client_name: Optional[str] = None
    client_testimonial: Optional[str] = None
    rating: Optional[int] = None
    service_id: Optional[UUID] = None

    before_image_url: Optional[str] = None
    after_image_url: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────
#  Portfolio (main)
# ─────────────────────────────────────────────────────────

class PortfolioCreate(BaseModel):
    # Core
    headline: Optional[str] = Field(default=None, max_length=200)
    tagline: Optional[str] = Field(default=None, max_length=160)
    bio: Optional[str] = Field(default=None, max_length=2000)
    mission_statement: Optional[str] = Field(default=None, max_length=1000)

    # Business
    business_name: Optional[str] = Field(default=None, max_length=100)
    business_description: Optional[str] = Field(default=None, max_length=1000)
    years_experience: Optional[int] = Field(default=None, ge=0)
    years_in_business: Optional[int] = Field(default=None, ge=0)
    team_size: Optional[int] = Field(default=None, ge=1)

    # Media
    cover_image_url: Optional[str] = Field(default=None, max_length=500)
    intro_video_url: Optional[str] = Field(default=None, max_length=500)

    # Contact
    phone: Optional[str] = Field(default=None, max_length=20)
    whatsapp: Optional[str] = Field(default=None, max_length=30)
    email: Optional[EmailStr] = None

    # Social
    website_url: Optional[str] = Field(default=None, max_length=300)
    linkedin_url: Optional[str] = Field(default=None, max_length=300)
    facebook_url: Optional[str] = Field(default=None, max_length=300)
    instagram_url: Optional[str] = Field(default=None, max_length=300)
    tiktok_url: Optional[str] = Field(default=None, max_length=300)

    # Coverage
    country: Optional[str] = Field(default=None, max_length=100)
    region: Optional[str] = Field(default=None, max_length=100)
    city: Optional[str] = Field(default=None, max_length=100)
    service_area: Optional[str] = Field(default=None, max_length=200)
    service_radius_km: Optional[float] = Field(default=None, ge=0, le=500)
    travels_to_client: bool = True
    works_remotely: bool = False

    # Trust
    license_number: Optional[str] = Field(default=None, max_length=100)
    license_authority: Optional[str] = Field(default=None, max_length=150)
    insurance_provider: Optional[str] = Field(default=None, max_length=150)

    # Pricing
    currency: str = Field(default="XAF", min_length=3, max_length=3)
    payment_methods: Optional[List[str]] = None
    accepts_negotiation: bool = True

    # Discovery
    tags: Optional[List[str]] = None
    languages: Optional[List[str]] = None

    # Privacy
    is_public: bool = True

    # Relations
    specialty_ids: List[UUID] = Field(default_factory=list)


class PortfolioUpdate(BaseModel):
    headline: Optional[str] = Field(default=None, max_length=200)
    tagline: Optional[str] = Field(default=None, max_length=160)
    bio: Optional[str] = Field(default=None, max_length=2000)
    mission_statement: Optional[str] = Field(default=None, max_length=1000)

    business_name: Optional[str] = Field(default=None, max_length=100)
    business_description: Optional[str] = Field(default=None, max_length=1000)
    years_experience: Optional[int] = Field(default=None, ge=0)
    years_in_business: Optional[int] = Field(default=None, ge=0)
    team_size: Optional[int] = Field(default=None, ge=1)

    cover_image_url: Optional[str] = None
    intro_video_url: Optional[str] = None

    phone: Optional[str] = Field(default=None, max_length=20)
    whatsapp: Optional[str] = Field(default=None, max_length=30)
    email: Optional[EmailStr] = None

    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    tiktok_url: Optional[str] = None

    country: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    service_area: Optional[str] = None
    service_radius_km: Optional[float] = Field(default=None, ge=0, le=500)
    travels_to_client: Optional[bool] = None
    works_remotely: Optional[bool] = None

    license_number: Optional[str] = None
    license_authority: Optional[str] = None
    insurance_provider: Optional[str] = None

    currency: Optional[str] = Field(default=None, min_length=3, max_length=3)
    payment_methods: Optional[List[str]] = None
    accepts_negotiation: Optional[bool] = None

    tags: Optional[List[str]] = None
    languages: Optional[List[str]] = None

    is_public: Optional[bool] = None

    specialty_ids: Optional[List[UUID]] = None


class PortfolioResponse(BaseModel):
    id: UUID
    user_id: UUID

    headline: Optional[str] = None
    tagline: Optional[str] = None
    bio: Optional[str] = None
    mission_statement: Optional[str] = None

    business_name: Optional[str] = None
    business_description: Optional[str] = None
    years_experience: Optional[int] = None
    years_in_business: Optional[int] = None
    team_size: Optional[int] = None

    cover_image_url: Optional[str] = None
    intro_video_url: Optional[str] = None

    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None

    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    tiktok_url: Optional[str] = None

    country: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    service_area: Optional[str] = None
    service_radius_km: Optional[float] = None
    travels_to_client: bool
    works_remotely: bool

    license_number: Optional[str] = None
    license_authority: Optional[str] = None
    insurance_provider: Optional[str] = None

    currency: str
    payment_methods: Optional[List[str]] = None
    accepts_negotiation: bool

    tags: Optional[List[str]] = None
    languages: Optional[List[str]] = None

    average_rating: Optional[float] = None
    total_reviews: int

    is_verified: bool
    is_public: bool
    is_featured: bool
    featured_until: Optional[datetime] = None

    created_at: datetime
    updated_at: datetime

    # Nested (optional)
    user: Optional[UserResponse] = None
    specialties: List[SpecialtyResponse] = Field(default_factory=list)
    services: List[ServiceResponse] = Field(default_factory=list)
    works: List[WorkResponse] = Field(default_factory=list)
    availabilities: List[AvailabilityResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class PublicPortfolioResponse(BaseModel):
    professional: UserResponse
    portfolio: PortfolioResponse
    services: List[ServiceResponse]
    works: List[WorkResponse]
    availability: List[AvailabilityResponse]
    average_rating: Optional[float] = None
    total_reviews: int = 0