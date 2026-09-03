from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ConversationCreate(BaseModel):
    type: str = "direct"
    title: Optional[str] = None
    participant_ids: list[UUID]  # user IDs to add

class ConversationResponse(BaseModel):
    id: UUID
    type: str
    title: Optional[str]
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    last_message: Optional[dict] = None
    unread_count: int = 0
    participant: Optional[dict] = None  # for direct chats

    model_config = {"from_attributes": True}