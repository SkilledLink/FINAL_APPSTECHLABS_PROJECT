from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

from app.enums.user import AccountStatus, AccountType
from app.models.professional import Professional


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    email: str = Field(unique=True, index=True, nullable=False)
    
    # NEW FIELDS - replaced username
    first_name: str = Field(index=True, nullable=False)
    last_name: str = Field(index=True, nullable=False)

    hashed_password: str = Field(nullable=False)

    account_type: AccountType = Field(nullable=False)
    status: AccountStatus = Field(default=AccountStatus.PENDING_VERIFICATION, nullable=False)
    is_email_verified: bool = Field(default=False, nullable=False)

    is_admin: bool = Field(default=False, nullable=False)
    is_moderator: bool = Field(default=False, nullable=False)

    password_changed_at: datetime | None = Field(default=None, nullable=True)
    last_login_at: datetime | None = Field(default=None, nullable=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

    is_email_verified: bool = Field(
        default=False,
        nullable=False,
    )

    last_login_at: datetime | None = Field(
        default=None,
        nullable=True,
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    professional: Optional["Professional"] = Relationship(
    back_populates="user",
    sa_relationship_kwargs={"uselist": False}
)

    # Relationships
    refresh_tokens: list["RefreshToken"] = Relationship(back_populates="user")
    verification_tokens: list["VerificationToken"] = Relationship(back_populates="user")