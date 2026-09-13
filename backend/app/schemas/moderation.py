from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ModerationSummary(BaseModel):
    record_id: UUID
    decision: str
    severity: int
    confidence: int
    description: str
    reason: str
    categories: list[str]
    provider: str
    model: str
    error: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ModerationFull(ModerationSummary):
    text_result: Optional[dict] = None
    image_results: Optional[list] = None


class ModerationQueueItem(BaseModel):
    record_id: UUID
    feed_id: UUID
    feed_title: str
    feed_description: str
    feed_author_id: UUID
    feed_media: list[dict]
    summary: ModerationSummary


class ModerationQueueResponse(BaseModel):
    items: list[ModerationQueueItem]
    total: int
    page: int
    size: int


class ModerationReviewRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500)