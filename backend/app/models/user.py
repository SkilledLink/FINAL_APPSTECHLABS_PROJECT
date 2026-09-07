# app/models/user.py
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

from app.enums.user import AccountStatus, AccountType
from app.models.professional import Professional


class RefreshToken:
    user: "User"


class VerificationToken:
    user: "User"


class User(SQLModel, table=True):
    __tablename__ = "users"

    # ============================================================
    # BASIC INFORMATION
    # ============================================================

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
    )

    email: str = Field(
        unique=True,
        index=True,
        nullable=False,
    )

    username: str = Field(
        unique=True,
        index=True,
        nullable=False,
        max_length=50,
    )

    first_name: str = Field(
        index=True,
        nullable=False,
    )

    last_name: str = Field(
        index=True,
        nullable=False,
    )

    bio: Optional[str] = Field(
        default=None,
        nullable=True,
        max_length=500,
    )

    location: Optional[str] = Field(
        default=None,
        nullable=True,
        max_length=100,
    )

    # ============================================================
    # AUTHENTICATION
    # ============================================================

    hashed_password: str = Field(
        nullable=False,
    )

    account_type: AccountType = Field(
        nullable=False,
    )

    status: AccountStatus = Field(
        default=AccountStatus.PENDING_VERIFICATION,
        nullable=False,
    )

    is_email_verified: bool = Field(
        default=False,
        nullable=False,
    )

    is_admin: bool = Field(
        default=False,
        nullable=False,
    )

    is_moderator: bool = Field(
        default=False,
        nullable=False,
    )

    password_changed_at: datetime | None = Field(
        default=None,
        nullable=True,
    )

    last_login_at: datetime | None = Field(
        default=None,
        nullable=True,
    )

    # ============================================================
    # SOFT DELETE
    # ============================================================

    deleted_at: datetime | None = Field(
        default=None,
        nullable=True,
    )

    # ============================================================
    # PROFILE IMAGES
    # ============================================================

    profile_image_url: Optional[str] = Field(
        default=None,
        nullable=True,
    )

    banner_image_url: Optional[str] = Field(
        default=None,
        nullable=True,
    )

    # ============================================================
    # TIMESTAMPS
    # ============================================================

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ============================================================
    # RELATIONSHIPS
    # ============================================================

    professional: Optional["Professional"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"uselist": False},
    )

    refresh_tokens: list["RefreshToken"] = Relationship(
        back_populates="user",
    )

    verification_tokens: list["VerificationToken"] = Relationship(
        back_populates="user",
    )