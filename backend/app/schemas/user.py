from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.enums.user import AccountStatus, AccountType


class UserResponse(BaseModel):
    # ============================================================
    # BASIC INFORMATION
    # ============================================================

    id: UUID
    email: EmailStr

    username: Optional[str] = None

    first_name: str
    last_name: str

    bio: Optional[str] = None
    location: Optional[str] = None

    # ============================================================
    # ACCOUNT
    # ============================================================

    account_type: AccountType
    status: AccountStatus

    is_email_verified: bool
    is_admin: bool
    is_moderator: bool

    # ============================================================
    # TIMESTAMPS
    # ============================================================

    created_at: datetime
    updated_at: datetime

    last_login_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    # ============================================================
    # PROFILE IMAGES
    # ============================================================

    profile_image_url: Optional[str] = None
    banner_image_url: Optional[str] = None

    # ============================================================
    # FOLLOW STATS
    # ============================================================

    followers_count: int = 0
    following_count: int = 0
    is_following: bool = False

    model_config = {
        "from_attributes": True
    }


class UserUpdate(BaseModel):
    username: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=50,
        pattern=r"^[a-zA-Z0-9_]+$",
    )

    first_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    last_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    email: Optional[EmailStr] = None

    bio: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    location: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    is_admin: Optional[bool] = None
    is_moderator: Optional[bool] = None


class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    size: int