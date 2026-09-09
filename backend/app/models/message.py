from sqlmodel import SQLModel, Field, Index, UniqueConstraint
from uuid import UUID, uuid4
from datetime import datetime
from decimal import Decimal
from app.enums.message import MessageType

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", nullable=False)
    sender_id: UUID = Field(nullable=False)
    client_message_id: UUID = Field(nullable=False)
    type: str = Field(default=MessageType.TEXT.value, nullable=False)
    content: str | None = Field(default=None, nullable=True)

    # ─── Attachment fields ──────────────────────────────────────
    attachment_path: str | None = Field(default=None, nullable=True)
    attachment_name: str | None = Field(default=None, nullable=True)   # ✅ added
    attachment_size: int | None = Field(default=None, nullable=True)   # ✅ added
    attachment_type: str | None = Field(default=None, nullable=True)   # ✅ added (MIME type)

    duration_seconds: Decimal | None = Field(default=None, nullable=True)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    edited_at: datetime | None = Field(default=None, nullable=True)
    deleted_at: datetime | None = Field(default=None, nullable=True)

    __table_args__ = (
        UniqueConstraint("sender_id", "client_message_id", name="uq_message_client_id"),
        Index("idx_messages_conversation_created", "conversation_id", "created_at"),
    )