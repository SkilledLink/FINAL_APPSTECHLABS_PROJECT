from typing import Optional, List
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


# Minimal user data for nested response
class ProfessionalUserPublic(BaseModel):
    id: UUID
    first_name: str
    last_name: str

    model_config = ConfigDict(from_attributes=True)


class ProfessionalCreate(BaseModel):
    profession: str = Field(..., max_length=100)
    bio: Optional[str] = Field(None, max_length=1000)
    skills: Optional[List[str]] = None
    years_of_experience: Optional[int] = Field(None, ge=0)
    services: Optional[List[str]] = None
    hourly_rate: Optional[float] = Field(None, ge=0)
    country: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    available: bool = True


from typing import List, Optional
from pydantic import BaseModel, Field


class ProfessionalUpdate(BaseModel):
    profession: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    bio: Optional[str] = Field(
        default=None,
        max_length=1000
    )

    skills: Optional[List[str]] = None

    years_of_experience: Optional[int] = Field(
        default=None,
        ge=0
    )

    services: Optional[List[str]] = None

    hourly_rate: Optional[float] = Field(
        default=None,
        ge=0
    )

    country: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    region: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    city: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    available: Optional[bool] = None

class ProfessionalResponse(BaseModel):
    id: UUID
    user_id: UUID
    profession: str
    bio: Optional[str]
    skills: Optional[List[str]]
    years_of_experience: Optional[int]
    services: Optional[List[str]]
    hourly_rate: Optional[float]
    country: Optional[str]
    region: Optional[str]
    city: Optional[str]
    available: bool
    is_verified: bool
    rating: float
    total_reviews: int
    completed_jobs: int
    created_at: datetime
    updated_at: datetime

    # Nested user data
    user: ProfessionalUserPublic

    model_config = ConfigDict(from_attributes=True)