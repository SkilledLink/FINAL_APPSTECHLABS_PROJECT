from uuid import UUID
from datetime import datetime
from decimal import Decimal
from fastapi import HTTPException, status
from sqlmodel import Session
from sqlalchemy import text

from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.schemas.message import MessageCreate
from app.models.message import Message
from app.enums.message import MessageType  # ✅ missing import added

class MessageService:
    def __init__(self, session: Session):
        self.session = session
        self.conv_repo = ConversationRepository(session)
        self.msg_repo = MessageRepository(session)

    def create_message(self, conversation_id: UUID, sender_id: UUID, data: MessageCreate) -> Message:
        if not self.conv_repo.is_participant(conversation_id, sender_id):
            raise HTTPException(status_code=403, detail="Not a participant")

        # Convert to dict
        msg_dict = data.model_dump()
        msg_dict["conversation_id"] = conversation_id
        msg_dict["sender_id"] = sender_id

        # Ensure type is stored as string value (if it's an enum, get its value)
        if isinstance(msg_dict.get("type"), MessageType):
            msg_dict["type"] = msg_dict["type"].value
        elif msg_dict.get("type") is None:
            msg_dict["type"] = MessageType.TEXT.value

        # Convert duration_seconds to Decimal if present
        if msg_dict.get("duration_seconds") is not None:
            msg_dict["duration_seconds"] = Decimal(str(msg_dict["duration_seconds"]))

        # Insert message
        message = self.msg_repo.insert_message(msg_dict)

        # Update conversation's updated_at
        self.session.execute(
            text("UPDATE conversations SET updated_at = now() WHERE id = :id"),
            {"id": conversation_id}
        )
        self.session.commit()
        return message

    def get_messages(self, conversation_id: UUID, user_id: UUID, before: datetime = None, limit: int = 50):
        if not self.conv_repo.is_participant(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Forbidden")
        return self.msg_repo.get_messages(conversation_id, before, limit)

    def mark_read(self, conversation_id: UUID, user_id: UUID) -> None:
        if not self.conv_repo.is_participant(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Forbidden")
        self.conv_repo.update_last_read(conversation_id, user_id)