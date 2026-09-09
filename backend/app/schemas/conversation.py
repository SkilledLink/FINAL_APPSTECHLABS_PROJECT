from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ParticipantInfo(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    profile_image_url: Optional[str] = None
    username: Optional[str] = None

class ConversationCreate(BaseModel):
    type: str = "direct"
    title: Optional[str] = None
    participant_ids: list[UUID]

class ConversationResponse(BaseModel):
    id: UUID
    type: str
    title: Optional[str]
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    last_message: Optional[dict] = None
    unread_count: int = 0
    participant: Optional[ParticipantInfo] = None

    model_config = {"from_attributes": True}