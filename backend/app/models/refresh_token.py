# refresh_token.py
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel
from app.models.user import User

class RefreshToken(SQLModel, table=True):
    __tablename__ = "refresh_tokens"
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    token_hash: str = Field(unique=True, nullable=False, index=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    expires_at: datetime = Field(nullable=False)
    revoked_at: datetime | None = Field(default=None, nullable=True)
    is_revoked: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    user: User = Relationship(back_populates="refresh_tokens")