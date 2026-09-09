from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.user import UserResponse


class JobImageResponse(BaseModel):
    id: UUID
    image_url: str
    order: int

    class Config:
        from_attributes = True


class JobCommentResponse(BaseModel):
    id: UUID
    user_id: UUID
    job_id: UUID
    content: str
    created_at: datetime
    updated_at: datetime
    replies: List["JobCommentResponse"] = Field(default_factory=list)

    class Config:
        from_attributes = True


class JobResponse(BaseModel):
    id: UUID
    title: str
    description: str
    status: str
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    likes_count: int = 0
    comments_count: int = 0
    is_liked: bool = False

    user: Optional[UserResponse] = None
    images: List[JobImageResponse] = Field(default_factory=list)
    comments: List[JobCommentResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class JobCreate(BaseModel):
    title: str = Field(max_length=200)
    description: str
    status: str = "published"


class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = None


class JobListResponse(BaseModel):
    items: List[JobResponse]
    total: int
    page: int
    size: int


class JobLikeResponse(BaseModel):
    job_id: UUID
    liked: bool


class JobCommentCreate(BaseModel):
    content: str = Field(max_length=1000)
    parent_id: Optional[UUID] = None