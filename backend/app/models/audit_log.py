from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import JSON
from sqlmodel import Column, Field, SQLModel


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)

    actor_user_id: Optional[UUID] = Field(
        default=None, foreign_key="users.id", index=True
    )
    actor_role: Optional[str] = Field(default=None, max_length=20)

    action: str = Field(nullable=False, max_length=100, index=True)
    entity_type: str = Field(nullable=False, max_length=50, index=True)
    entity_id: Optional[UUID] = Field(default=None, index=True)

    old_value: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    new_value: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    reason: Optional[str] = Field(default=None, max_length=500)

    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=500)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )