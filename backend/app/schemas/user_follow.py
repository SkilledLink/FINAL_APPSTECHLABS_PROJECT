from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

from app.schemas.user import UserResponse  # for returning follower/followed info if needed


class FollowCreate(BaseModel):
    """Request body for following a user."""
    followed_user_id: UUID


class FollowUnfollow(BaseModel):
    """Request body for unfollowing a user."""
    followed_user_id: UUID


class FollowResponse(BaseModel):
    """Response for a follow relationship."""
    follower_id: UUID
    followed_id: UUID
    created_at: datetime

    # Optional: include user details for convenience
    # follower: Optional[UserResponse]
    # followed: Optional[UserResponse]

    model_config = {"from_attributes": True}


class FollowersListResponse(BaseModel):
    """List of users who follow a given user."""
    items: list[UserResponse]  # or just list[UUID]
    total: int


class FollowingListResponse(BaseModel):
    """List of users that a given user follows."""
    items: list[UserResponse]
    total: int


class FollowStatusResponse(BaseModel):
    """Check if a user is following another."""
    is_following: bool