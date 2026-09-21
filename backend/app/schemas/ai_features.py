# app/schemas/ai_features.py

from typing import List, Optional

from pydantic import BaseModel, Field


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