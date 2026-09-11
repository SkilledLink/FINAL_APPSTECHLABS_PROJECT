from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.enums.location import LocationType, ServiceAreaStatus


# ────────────────────────────────────────────────────────────
#  Geocoding
# ────────────────────────────────────────────────────────────

class LocationSearchResult(BaseModel):
    display_name: str
    latitude: float
    longitude: float
    country: Optional[str] = None
    country_code: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    postcode: Optional[str] = None
    osm_type: Optional[str] = None
    osm_id: Optional[str] = None
    place_type: Optional[str] = None


class LocationSearchResponse(BaseModel):
    results: List[LocationSearchResult]


class ReverseGeocodeResponse(BaseModel):
    display_name: str
    latitude: float
    longitude: float
    country: Optional[str] = None
    country_code: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    postcode: Optional[str] = None


# ────────────────────────────────────────────────────────────
#  Professional locations
# ────────────────────────────────────────────────────────────

class ProfessionalLocationCreate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    location_name: str = Field(..., min_length=2, max_length=255)
    location_type: LocationType = LocationType.HOME
    is_primary: bool = True
    country: Optional[str] = Field(None, max_length=100)
    country_code: Optional[str] = Field(None, min_length=2, max_length=2)
    region: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    area: Optional[str] = Field(None, max_length=150)
    postcode: Optional[str] = Field(None, max_length=20)


class ProfessionalLocationUpdate(BaseModel):
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    location_name: Optional[str] = Field(None, min_length=2, max_length=255)
    location_type: Optional[LocationType] = None
    country: Optional[str] = Field(None, max_length=100)
    country_code: Optional[str] = Field(None, min_length=2, max_length=2)
    region: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    area: Optional[str] = Field(None, max_length=150)
    postcode: Optional[str] = Field(None, max_length=20)


class ProfessionalLocationResponse(BaseModel):
    """Owner view — exact coordinates."""
    id: UUID
    professional_id: UUID
    latitude: float
    longitude: float
    location_name: str
    location_type: LocationType
    is_primary: bool
    country: Optional[str] = None
    country_code: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    postcode: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PublicLocationResponse(BaseModel):
    """Public view — rounded coordinates + display string only."""
    display_name: str
    latitude: float      # fuzzed
    longitude: float     # fuzzed
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None


# ────────────────────────────────────────────────────────────
#  Service areas
# ────────────────────────────────────────────────────────────

class ServiceAreaCreate(BaseModel):
    center_latitude: float = Field(..., ge=-90, le=90)
    center_longitude: float = Field(..., ge=-180, le=180)
    radius_km: float = Field(..., ge=0.5, le=500)
    area_name: str = Field(..., min_length=2, max_length=255)


class ServiceAreaUpdate(BaseModel):
    center_latitude: Optional[float] = Field(None, ge=-90, le=90)
    center_longitude: Optional[float] = Field(None, ge=-180, le=180)
    radius_km: Optional[float] = Field(None, ge=0.5, le=500)
    area_name: Optional[str] = Field(None, min_length=2, max_length=255)
    status: Optional[ServiceAreaStatus] = None


class ServiceAreaResponse(BaseModel):
    id: UUID
    professional_id: UUID
    center_latitude: float
    center_longitude: float
    radius_km: float
    area_name: str
    status: ServiceAreaStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ServiceAreaListResponse(BaseModel):
    items: List[ServiceAreaResponse]
    total: int


# ────────────────────────────────────────────────────────────
#  Nearby professionals
# ────────────────────────────────────────────────────────────

class NearbyProfessionalUser(BaseModel):
    id: UUID
    username: Optional[str] = None
    first_name: str
    last_name: str
    profile_image_url: Optional[str] = None


class NearbyProfessional(BaseModel):
    id: UUID
    profession: str
    headline: Optional[str] = None
    company_name: Optional[str] = None
    years_of_experience: Optional[int] = None
    skills: Optional[List[str]] = None
    services: Optional[List[str]] = None
    hourly_rate: Optional[float] = None
    currency: str = "XAF"
    available: bool
    is_verified: bool
    rating: float
    total_reviews: int
    completed_jobs: int
    profile_completeness: int
    user: NearbyProfessionalUser
    public_location: PublicLocationResponse
    distance_km: float


class NearbyProfessionalListResponse(BaseModel):
    items: List[NearbyProfessional]
    total: int
    page: int
    size: int
    search_center: PublicLocationResponse


# ────────────────────────────────────────────────────────────
#  Query validators
# ────────────────────────────────────────────────────────────

class LocationSearchQuery(BaseModel):
    q: str = Field(..., min_length=2, max_length=200)
    limit: int = Field(8, ge=1, le=20)
    country: Optional[str] = Field(None, min_length=2, max_length=2)

    @field_validator("q")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()