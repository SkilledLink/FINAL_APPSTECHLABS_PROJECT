# app/schemas/user.py

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, computed_field

from app.enums.user import AccountStatus, AccountType


class UserResponse(BaseModel):
    # ============================================================
    # BASIC INFORMATION
    # ============================================================

    id: UUID
    email: EmailStr

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

    # ============================================================
    # COMPUTED / DERIVED
    # ============================================================
    # `username` is no longer stored on the User model.
    # It's derived from first_name + last_name (falling back to email)
    # so existing frontend code that reads `response.username` keeps
    # working without changes.

    @computed_field  # type: ignore[misc]
    @property
    def username(self) -> str:
        full = f"{self.first_name} {self.last_name}".strip()
        return full or self.email

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    # `username` removed — the model no longer has that column.
    # Pydantic ignores extra fields in the incoming payload by default,
    # so the frontend can still send `username` and it will be dropped.

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


class UserCreate(BaseModel):
    email: EmailStr
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=8)
    account_type: str = "user"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class VerificationRequest(BaseModel):
    email: EmailStr
    code: str


class VerificationResponse(BaseModel):
    message: str
    verified: bool


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    code: str
    new_password: str = Field(min_length=8)