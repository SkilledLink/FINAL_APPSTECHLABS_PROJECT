# app/schemas/ai_features.py

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ─── PORTFOLIO SUGGESTIONS (advisory) ────────────────────────────

class PortfolioSuggestion(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    reason: str = Field("", max_length=500)


class PortfolioSuggestionsResponse(BaseModel):
    suggestions: List[PortfolioSuggestion]
    provider: str
    model: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None


# ─── IMAGE ANALYSIS (Level 3 exclusive) ──────────────────────────

class AnalyzeImageRequest(BaseModel):
    """Provide exactly one image source:
        - image_base64 + image_mime_type → analyze this image
        - image_url                      → download and analyze
        - work_id                        → analyze the work's attached image
    """
    image_base64: Optional[str] = None
    image_mime_type: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=1000)
    work_id: Optional[UUID] = None

    # Optional grounding context for the AI
    context: Optional[dict] = None


class ImageAnalysisResponse(BaseModel):
    description: str
    quality_score: int = Field(..., ge=1, le=10)
    suggested_caption: str
    suggestions: List[str]
    provider: str
    model: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None


# ─── DEEP ANALYSIS (Level 3 exclusive) ───────────────────────────

class DeepAnalysisSectionScore(BaseModel):
    score: int = Field(..., ge=0, le=100)
    weight: float
    notes: str = ""


class DeepAnalysisGap(BaseModel):
    severity: str
    area: str
    message: str


class DeepAnalysisRecommendation(BaseModel):
    priority: str
    action: str


class DeepAnalysisRequest(BaseModel):
    """No parameters required. Kept for future extensions."""
    pass


class DeepAnalysisResponse(BaseModel):
    summary: str
    overall_score: int = Field(..., ge=0, le=100)
    grade: str
    section_scores: dict[str, DeepAnalysisSectionScore]
    gaps: List[DeepAnalysisGap]
    recommendations: List[DeepAnalysisRecommendation]
    suggested_next_actions: List[str]
    provider: str
    model: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None


# ─── AI USAGE (per-feature quota status) ─────────────────────────

class AIUsageItem(BaseModel):
    feature_key: str
    feature_name: str
    usage_count: int
    usage_limit: int
    remaining: int
    period_start: datetime
    period_end: datetime


class AIUsageResponse(BaseModel):
    items: List[AIUsageItem]
    total: int