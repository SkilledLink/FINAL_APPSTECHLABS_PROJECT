import logging
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from fastapi import HTTPException, status
from sqlmodel import Session, select
from sqlalchemy import text

from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.schemas.message import MessageCreate
from app.models.message import Message
from app.models.user import User
from app.models.conversation_participant import ConversationParticipant
from app.enums.message import MessageType
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)


class MessageService:
    def __init__(self, session: Session):
        self.session = session
        self.conv_repo = ConversationRepository(session)
        self.msg_repo = MessageRepository(session)

    def create_message(
        self, conversation_id: UUID, sender_id: UUID, data: MessageCreate
    ) -> Message:
        if not self.conv_repo.is_participant(conversation_id, sender_id):
            raise HTTPException(status_code=403, detail="Not a participant")

        msg_dict = data.model_dump()
        msg_dict["conversation_id"] = conversation_id
        msg_dict["sender_id"] = sender_id

        if isinstance(msg_dict.get("type"), MessageType):
            msg_dict["type"] = msg_dict["type"].value
        elif msg_dict.get("type") is None:
            msg_dict["type"] = MessageType.TEXT.value

        if msg_dict.get("duration_seconds") is not None:
            msg_dict["duration_seconds"] = Decimal(
                str(msg_dict["duration_seconds"])
            )

        message, was_inserted = self.msg_repo.insert_message(msg_dict)

        self.session.execute(
            text("UPDATE conversations SET updated_at = now() WHERE id = :id"),
            {"id": conversation_id},
        )
        self.session.commit()

        # Notification hook — only on a genuine first insert.
        if was_inserted and message.type != MessageType.SYSTEM.value:
            self._notify_message_recipients(
                conversation_id, sender_id, message
            )

        return message

    def _notify_message_recipients(
        self,
        conversation_id: UUID,
        sender_id: UUID,
        message: Message,
    ) -> None:
        try:
            sender = self.session.get(User, sender_id)
            if sender is None:
                return
            sender_display = NotificationService.display_name(sender)

            stmt = select(ConversationParticipant).where(
                ConversationParticipant.conversation_id == conversation_id,
                ConversationParticipant.user_id != sender_id,
                ConversationParticipant.muted.is_(False),
            )
            participants = self.session.exec(stmt).all()
            if not participants:
                return

            service = NotificationService(self.session)
            for p in participants:
                service.notify_message(
                    recipient_id=p.user_id,
                    sender_id=sender_id,
                    sender_display=sender_display,
                    conversation_id=conversation_id,
                    message_id=message.id,
                    message_type=message.type,
                    content=message.content,
                    attachment_name=message.attachment_name,
                )
        except Exception:
            logger.exception("Message notification fan-out failed")

    def get_messages(
        self,
        conversation_id: UUID,
        user_id: UUID,
        before: datetime = None,
        limit: int = 50,
    ):
        if not self.conv_repo.is_participant(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Forbidden")
        return self.msg_repo.get_messages(conversation_id, before, limit)

    def mark_read(self, conversation_id: UUID, user_id: UUID) -> None:
        if not self.conv_repo.is_participant(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Forbidden")
        self.conv_repo.update_last_read(conversation_id, user_id)

        try:
            NotificationService(self.session).mark_conversation_read(
                user_id, conversation_id
            )
        except Exception:
            logger.exception("Failed to mark conversation notifications read")