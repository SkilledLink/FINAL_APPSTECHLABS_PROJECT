from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional


# ─────────────────────────────────────────────────────────────
# Request bodies
# ─────────────────────────────────────────────────────────────

class FollowCreate(BaseModel):
    """Request body for following a user."""
    followed_user_id: UUID


class FollowUnfollow(BaseModel):
    """Request body for unfollowing a user."""
    followed_user_id: UUID


# ─────────────────────────────────────────────────────────────
# Follow relationship response
# ─────────────────────────────────────────────────────────────

class FollowResponse(BaseModel):
    """Response for a follow relationship."""
    follower_id: UUID
    followed_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────────────────────────────────────────
# Lightweight user info for follower/following lists
# ─────────────────────────────────────────────────────────────

class FollowerUserResponse(BaseModel):
    """
    Minimal user info returned inside follower / following lists.

    Includes `profile_image_url` explicitly so FastAPI does not
    strip it during response serialization.
    """
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    profile_image_url: Optional[str] = None   # 👈 CRITICAL
    account_type: Optional[str] = None
    is_email_verified: Optional[bool] = None


# ─────────────────────────────────────────────────────────────
# List responses
# ─────────────────────────────────────────────────────────────

class FollowersListResponse(BaseModel):
    """List of users who follow a given user."""
    items: list[FollowerUserResponse]
    total: int


class FollowingListResponse(BaseModel):
    """List of users that a given user follows."""
    items: list[FollowerUserResponse]
    total: int


class FollowStatusResponse(BaseModel):
    """Check if a user is following another."""
    is_following: bool