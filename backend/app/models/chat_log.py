from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel, Column
from sqlalchemy import JSON


class ChatLog(SQLModel, table=True):
    __tablename__ = "chat_logs"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    message: str = Field(nullable=False)
    response: str = Field(nullable=False)
    sources: Optional[List[str]] = Field(
        default=None,
        sa_column=Column(JSON)
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )