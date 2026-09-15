# app/ai/schemas.py
"""
Typed contracts for the AI search + multimodal layer.

Nothing in this file imports a model or a repository — it is pure
data shape. Safe to import from any layer.
"""

from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ════════════════════════════════════════════════════════════
#  SEARCH PARAMETERS
# ════════════════════════════════════════════════════════════

class ProfessionalSearchParams(BaseModel):
    """Structured search request. All fields optional."""
    query: Optional[str] = None
    profession: Optional[str] = None
    service: Optional[str] = None
    skills: Optional[List[str]] = None

    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None

    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    radius_km: Optional[float] = Field(default=None, ge=0.5, le=200)

    verified_only: bool = False
    available_only: bool = False
    min_rating: Optional[float] = Field(default=None, ge=0, le=5)

    sort: str = "rating_desc"
    limit: int = Field(default=10, ge=1, le=50)


# ════════════════════════════════════════════════════════════
#  SEARCH RESULT
# ════════════════════════════════════════════════════════════

class ProfessionalCard(BaseModel):
    """
    Public, safe professional representation.

    Every field here is either already public on the platform
    (headline, city, rating) or derived by backend logic (distance).
    No private field (email, phone, snapshot_*, fraud_notes,
    verification_data) is ever included.
    """
    id: UUID
    user_id: UUID
    name: str
    profession: str
    headline: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    years_of_experience: Optional[int] = None
    rating: Optional[float] = None
    total_reviews: int = 0
    is_verified: bool = False
    available: bool = True
    profile_image_url: Optional[str] = None
    distance_km: Optional[float] = None
    profile_url: str = ""


class SearchMetadata(BaseModel):
    total: int
    returned: int
    strategy: str = Field(
        description="one of: nearby, hybrid, keyword, filtered"
    )
    had_location: bool = False
    filters_applied: List[str] = Field(default_factory=list)


class ProfessionalSearchResult(BaseModel):
    professionals: List[ProfessionalCard] = Field(default_factory=list)
    metadata: SearchMetadata


# ════════════════════════════════════════════════════════════
#  IMAGE ANALYSIS
# ════════════════════════════════════════════════════════════

class ImageAnalysis(BaseModel):
    """
    Structured output from Gemini image understanding.

    Every field is a *hypothesis* — never presented to the user
    as certainty. The response generator always frames these as
    suggestions.
    """
    description: str = ""
    possible_profession: Optional[str] = None
    possible_services: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    work_category: Optional[str] = None
    search_terms: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    language: str = "en"


# ════════════════════════════════════════════════════════════
#  ENDPOINT REQUEST / RESPONSE
# ════════════════════════════════════════════════════════════

class AISearchResponse(BaseModel):
    query: Optional[str] = None
    intent: str
    total: int
    results: List[ProfessionalCard] = Field(default_factory=list)
    explanation: Optional[str] = None
    image_analysis: Optional[ImageAnalysis] = None
    search_metadata: Optional[SearchMetadata] = None