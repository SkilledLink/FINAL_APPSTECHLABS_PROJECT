# app/models/conversation.py
from sqlmodel import SQLModel, Field, Index
from uuid import UUID, uuid4
from datetime import datetime


class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    type: str = Field(default="direct", nullable=False)
    title: str | None = Field(default=None, nullable=True)
    created_by: UUID = Field(nullable=False)  # no foreign key

    # "active"    → normal, both sides can chat
    # "pending"   → a direct request waiting for the recipient
    # "rejected"  → recipient declined
    status: str = Field(default="active", nullable=False, index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    __table_args__ = (Index("idx_conversations_updated", "updated_at"),)