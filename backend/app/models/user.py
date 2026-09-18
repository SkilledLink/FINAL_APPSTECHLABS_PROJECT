# app/models/user.py

from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import Column, String
from sqlmodel import Field, Relationship, SQLModel

from app.enums.user import AccountStatus, AccountType

if TYPE_CHECKING:
    from app.models.professional import Professional
    from app.models.job import Job
    from app.models.professional_portfolio import ProfessionalPortfolio
    from app.models.feed import Feed


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
    # ⚠️ These are VARCHAR columns, NOT Postgres enum columns.
    #    The Python enum provides the allowed values, but the DB
    #    stores plain strings so values can't be truncated by
    #    a too-short enum definition.

    hashed_password: str = Field(
        nullable=False,
    )

    account_type: AccountType = Field(
        sa_column=Column(String(30), nullable=False, index=True),
    )

    status: AccountStatus = Field(
        sa_column=Column(
            String(30),
            nullable=False,
            default=AccountStatus.PENDING_VERIFICATION.value,
            index=True,
        ),
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
        sa_relationship_kwargs={
            "uselist": False,
            "foreign_keys": "[Professional.user_id]",
        },
    )

    refresh_tokens: list["RefreshToken"] = Relationship(
        back_populates="user",
    )

    verification_tokens: list["VerificationToken"] = Relationship(
        back_populates="user",
    )

    jobs: list["Job"] = Relationship(back_populates="user")

    portfolio: Optional["ProfessionalPortfolio"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"uselist": False},
    )

    feeds: list["Feed"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )