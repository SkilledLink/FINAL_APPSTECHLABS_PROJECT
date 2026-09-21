from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.professional_tier import ProfessionalTierBadge


class SearchResultResponse(BaseModel):
    # Professional fields
    id: UUID
    user_id: UUID
    profession: str
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    years_of_experience: Optional[int] = None
    services: Optional[List[str]] = None
    hourly_rate: Optional[float] = None
    country: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    available: bool
    is_verified: bool
    rating: float
    total_reviews: int
    completed_jobs: int
    created_at: datetime
    updated_at: datetime

    # Flattened user fields
    first_name: str
    last_name: str
    profile_image_url: Optional[str] = None

    # Active paid tier badge, if any. None for free-tier professionals.
    tier_badge: Optional[ProfessionalTierBadge] = None

    # Score — clamped to [0, 1] in SQL.
    relevance_score: float = Field(..., ge=0.0)

    model_config = ConfigDict(from_attributes=True)