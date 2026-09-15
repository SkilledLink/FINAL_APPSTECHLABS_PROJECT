# app/schemas/ai_search.py
from typing import List, Optional
from pydantic import BaseModel, Field

from app.ai.schemas import ProfessionalCard, SearchMetadata, ImageAnalysis


class AISearchRequest(BaseModel):
    query: Optional[str] = Field(default=None, max_length=500)
    city: Optional[str] = Field(default=None, max_length=100)
    region: Optional[str] = Field(default=None, max_length=100)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    radius_km: Optional[float] = Field(default=None, ge=0.5, le=200)
    verified_only: bool = False
    available_only: bool = False
    min_rating: Optional[float] = Field(default=None, ge=0, le=5)
    limit: int = Field(default=10, ge=1, le=50)


class AISearchResponse(BaseModel):
    query: Optional[str] = None
    intent: str
    total: int
    results: List[ProfessionalCard] = Field(default_factory=list)
    explanation: Optional[str] = None
    image_analysis: Optional[ImageAnalysis] = None
    search_metadata: Optional[SearchMetadata] = None