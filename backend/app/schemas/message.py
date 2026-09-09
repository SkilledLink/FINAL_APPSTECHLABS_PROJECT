from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.enums.message import MessageType

class MessageCreate(BaseModel):
    client_message_id: UUID = Field(..., description="UUID generated on client for idempotency")
    type: MessageType = MessageType.TEXT
    content: Optional[str] = None

    # ─── Attachment fields (now part of creation) ──────────────
    attachment_path: Optional[str] = None
    attachment_name: Optional[str] = None
    attachment_size: Optional[int] = None
    attachment_type: Optional[str] = None    # MIME type, e.g. "image/jpeg"
    duration_seconds: Optional[float] = None  # for voice notes

class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    client_message_id: UUID
    type: MessageType
    content: Optional[str]
    attachment_path: Optional[str]
    attachment_name: Optional[str]          # ✅ added
    attachment_size: Optional[int]          # ✅ added
    attachment_type: Optional[str]          # ✅ added
    duration_seconds: Optional[float]       # returned as float for convenience
    created_at: datetime
    edited_at: Optional[datetime]
    deleted_at: Optional[datetime]

    model_config = {"from_attributes": True}