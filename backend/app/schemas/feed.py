from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.user import UserResponse


# ─────────────────────────────────────────────────────────────
# MEDIA
# ─────────────────────────────────────────────────────────────
class FeedMediaResponse(BaseModel):
    id: UUID
    media_url: str
    media_type: str
    thumbnail_url: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    duration_seconds: Optional[float] = None
    file_size: Optional[int] = None

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# HASHTAG
# ─────────────────────────────────────────────────────────────
class HashtagResponse(BaseModel):
    id: UUID
    name: str
    usage_count: int = 0

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# COMMENT
# ─────────────────────────────────────────────────────────────
class FeedCommentResponse(BaseModel):
    id: UUID
    user_id: UUID
    feed_id: UUID
    content: str
    created_at: datetime
    updated_at: datetime
    replies: List["FeedCommentResponse"] = Field(default_factory=list)
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# FEED
# ─────────────────────────────────────────────────────────────
class FeedResponse(BaseModel):
    id: UUID
    title: str
    description: str
    status: str
    is_public: bool
    user_id: UUID
    is_deleted: bool = False   # ✅ NEW

    created_at: datetime
    updated_at: datetime

    likes_count: int = 0
    comments_count: int = 0
    is_liked: bool = False

    user: Optional[UserResponse] = None
    media: List[FeedMediaResponse] = Field(default_factory=list)
    hashtags: List[HashtagResponse] = Field(default_factory=list)
    comments: List[FeedCommentResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class FeedListResponse(BaseModel):
    items: List[FeedResponse]
    total: int
    page: int
    size: int


# ─────────────────────────────────────────────────────────────
# REQUESTS
# ─────────────────────────────────────────────────────────────
class FeedCreate(BaseModel):
    title: str = Field(max_length=200)
    description: str
    status: str = "published"
    is_public: bool = True
    hashtags: List[str] = Field(default_factory=list)


class FeedUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = None
    is_public: Optional[bool] = None
    hashtags: Optional[List[str]] = None


class FeedLikeResponse(BaseModel):
    feed_id: UUID
    liked: bool


class FeedCommentCreate(BaseModel):
    content: str = Field(max_length=1000)
    parent_id: Optional[UUID] = None