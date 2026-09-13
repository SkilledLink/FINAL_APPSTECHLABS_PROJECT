from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import JSON
from sqlmodel import Column, Field, SQLModel


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: UUID = Field(
        foreign_key="users.id", index=True, nullable=False
    )

    type: str = Field(nullable=False, max_length=50, index=True)
    title: str = Field(nullable=False, max_length=200)
    body: str = Field(nullable=False, max_length=1000)
    payload: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    read_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )