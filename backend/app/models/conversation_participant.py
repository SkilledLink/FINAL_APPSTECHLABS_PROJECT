from sqlmodel import SQLModel, Field
from uuid import UUID
from datetime import datetime

class ConversationParticipant(SQLModel, table=True):
    __tablename__ = "conversation_participants"

    conversation_id: UUID = Field(foreign_key="conversations.id", primary_key=True)  # keep FK to conversations
    user_id: UUID = Field(nullable=False, primary_key=True)  # no FK to auth.users
    joined_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    last_read_at: datetime | None = Field(default=None, nullable=True)
    muted: bool = Field(default=False, nullable=False)