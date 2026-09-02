from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

from app.enums.verification import VerificationType
from app.models.user import User


class VerificationToken(SQLModel, table=True):
    __tablename__ = "verification_tokens"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
    )

    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
    )

    token_hash: str = Field(
        nullable=False,
        index=True,
    )

    type: VerificationType = Field(
        nullable=False,
    )

    expires_at: datetime = Field(
        nullable=False,
    )

    is_used: bool = Field(
        default=False,
        nullable=False,
    )

    used_at: datetime | None = Field(
        default=None,
        nullable=True,
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: User = Relationship(back_populates="verification_tokens")