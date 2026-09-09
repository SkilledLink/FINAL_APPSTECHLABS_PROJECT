from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field

from app.enums.professional import DurationUnit, ClientType, PricingType, AvailabilityDay
from app.schemas.user import UserResponse  # reuse


# ---------- Category & Specialty (for responses) ----------
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


# ---------- Availability ----------
class AvailabilityCreate(BaseModel):
    day_of_week: AvailabilityDay
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_available: bool = True


class AvailabilityUpdate(BaseModel):
    day_of_week: Optional[AvailabilityDay] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_available: Optional[bool] = None


class AvailabilityResponse(BaseModel):
    id: UUID
    day_of_week: AvailabilityDay
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_available: bool

    class Config:
        from_attributes = True


# ---------- Services ----------
class ServiceCreate(BaseModel):
    title: str = Field(max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    starting_price: Optional[float] = None
    pricing_type: Optional[PricingType] = None
    estimated_duration: Optional[str] = None
    service_area: Optional[str] = None
    is_active: bool = True
    is_emergency_service: bool = False


class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    starting_price: Optional[float] = None
    pricing_type: Optional[PricingType] = None
    estimated_duration: Optional[str] = None
    service_area: Optional[str] = None
    is_active: Optional[bool] = None
    is_emergency_service: Optional[bool] = None


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
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Works ----------
class WorkCreate(BaseModel):
    title: str = Field(max_length=200)
    description: Optional[str] = None
    service_category: Optional[str] = None
    location: Optional[str] = None
    completed_at: Optional[datetime] = None
    duration_value: Optional[int] = Field(None, ge=0)
    duration_unit: Optional[DurationUnit] = None
    team_size: Optional[int] = Field(None, ge=1)
    client_type: Optional[ClientType] = None


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
    before_image_url: Optional[str] = None
    after_image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Portfolio (main) ----------
class PortfolioCreate(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    years_experience: Optional[int] = Field(None, ge=0)
    business_name: Optional[str] = None
    business_description: Optional[str] = None
    service_area: Optional[str] = None
    phone: Optional[str] = None
    is_public: bool = True
    specialty_ids: List[UUID] = Field(default_factory=list)  # pre-selected specialties


class PortfolioUpdate(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    years_experience: Optional[int] = Field(None, ge=0)
    business_name: Optional[str] = None
    business_description: Optional[str] = None
    service_area: Optional[str] = None
    phone: Optional[str] = None
    is_public: Optional[bool] = None
    specialty_ids: Optional[List[UUID]] = None


class PortfolioResponse(BaseModel):
    id: UUID
    user_id: UUID
    headline: Optional[str] = None
    bio: Optional[str] = None
    years_experience: Optional[int] = None
    business_name: Optional[str] = None
    business_description: Optional[str] = None
    service_area: Optional[str] = None
    phone: Optional[str] = None
    is_verified: bool
    is_public: bool
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


# ---------- Public Portfolio (for discovery) ----------
class PublicPortfolioResponse(BaseModel):
    professional: UserResponse
    portfolio: PortfolioResponse
    services: List[ServiceResponse]
    works: List[WorkResponse]
    availability: List[AvailabilityResponse]
    # reviews placeholder
    average_rating: Optional[float] = None
    total_reviews: int = 0