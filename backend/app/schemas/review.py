# app/schemas/review.py

from datetime import datetime
from typing import Optional, List, Dict
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ─── Reviewer snippet ──────────────────────────────────────

class ReviewerPublic(BaseModel):
    """Lightweight reviewer info returned with each review."""
    id: UUID
    first_name: str
    last_name: str
    username: Optional[str] = None
    profile_image_url: Optional[str] = None
    # Loosely typed — accepts str, enum, or None without validation errors
    account_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


# ─── Request bodies ────────────────────────────────────────

class ReviewCreate(BaseModel):
    professional_id: UUID
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=150)
    comment: str = Field(..., min_length=3, max_length=2000)


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, max_length=150)
    comment: Optional[str] = Field(None, min_length=3, max_length=2000)


# ─── Responses ────────────────────────────────────────────

class ReviewResponse(BaseModel):
    id: UUID
    reviewer_id: UUID
    professional_id: UUID
    rating: int
    title: Optional[str] = None
    comment: str
    is_verified_hire: bool
    created_at: datetime
    updated_at: datetime
    reviewer: ReviewerPublic

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class ReviewListResponse(BaseModel):
    items: List[ReviewResponse] 
    total: int


class ReviewStatsResponse(BaseModel):
    average_rating: float
    total_reviews: int
    breakdown: Dict[str, int]