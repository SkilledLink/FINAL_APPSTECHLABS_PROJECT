# app/schemas/professional_ai_usage.py

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProfessionalAIUsageResponse(BaseModel):
    id: UUID
    professional_id: UUID
    subscription_id: Optional[UUID] = None
    feature_key: str
    usage_count: int
    usage_limit: int
    period_start: datetime
    period_end: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AIUsageCheckRequest(BaseModel):
    feature_key: str = Field(..., min_length=2, max_length=100)


class AIUsageCheckResponse(BaseModel):
    """Returned before any AI call. `allowed=False` means the caller
    must not invoke the AI provider."""
    feature_key: str
    allowed: bool
    usage_count: int
    usage_limit: int
    remaining: int
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None


class AIUsageIncrementRequest(BaseModel):
    feature_key: str = Field(..., min_length=2, max_length=100)
    amount: int = Field(1, ge=1)


class ProfessionalAIUsageListResponse(BaseModel):
    items: List[ProfessionalAIUsageResponse]
    total: int