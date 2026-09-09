from sqlmodel import Session, select, func
from uuid import UUID
from typing import List, Optional
from app.models.conversation import Conversation
from app.models.conversation_participant import ConversationParticipant
from app.models.message import Message
from datetime import datetime

class ConversationRepository:
    def __init__(self, session: Session):
        self.session = session

    def is_participant(self, conversation_id: UUID, user_id: UUID) -> bool:
        stmt = select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == user_id
        )
        return self.session.exec(stmt).first() is not None

    def get_user_conversations(self, user_id: UUID) -> List[Conversation]:
        subq = select(ConversationParticipant.conversation_id).where(
            ConversationParticipant.user_id == user_id
        ).subquery()
        stmt = select(Conversation).where(Conversation.id.in_(subq)).order_by(Conversation.updated_at.desc())
        return self.session.exec(stmt).all()

    def create_conversation(self, conv_data: dict, participant_ids: List[UUID]) -> Conversation:
        conv = Conversation(**conv_data)
        self.session.add(conv)
        self.session.flush()

        for uid in participant_ids:
            participant = ConversationParticipant(
                conversation_id=conv.id,
                user_id=uid,
                last_read_at=None
            )
            self.session.add(participant)
        self.session.commit()
        self.session.refresh(conv)
        return conv

    def update_last_read(self, conversation_id: UUID, user_id: UUID) -> None:
        stmt = select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == user_id
        )
        participant = self.session.exec(stmt).first()
        if participant:
            participant.last_read_at = datetime.utcnow()
            self.session.commit()

    # ---------- NEW METHODS ----------
    def find_direct_conversation(self, user_id1: UUID, user_id2: UUID) -> Optional[Conversation]:
        """
        Find a direct conversation (type='direct') between exactly these two users.
        """
        # Get conversation IDs where both are participants
        stmt = (
            select(ConversationParticipant.conversation_id)
            .where(ConversationParticipant.user_id.in_([user_id1, user_id2]))
            .group_by(ConversationParticipant.conversation_id)
            .having(func.count() == 2)
        )
        conv_ids = self.session.exec(stmt).all()
        if not conv_ids:
            return None
        conv_id = conv_ids[0]
        # Ensure it's a direct conversation (optional but safe)
        conv = self.session.get(Conversation, conv_id)
        if conv and conv.type == "direct":
            return conv
        return None

    def get_participants(self, conversation_id: UUID) -> List[ConversationParticipant]:
        stmt = select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conversation_id
        )
        return self.session.exec(stmt).all()

    def get_last_message(self, conversation_id: UUID) -> Optional[dict]:
        stmt = select(Message).where(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.desc()).limit(1)
        msg = self.session.exec(stmt).first()
        if msg:
            return {
                "id": msg.id,
                "sender_id": msg.sender_id,
                "content": msg.content,
                "type": msg.type,
                "created_at": msg.created_at,
            }
        return None

    def count_unread(self, conversation_id: UUID, user_id: UUID) -> int:
        # Find user's last_read_at
        participant = self.session.exec(
            select(ConversationParticipant).where(
                ConversationParticipant.conversation_id == conversation_id,
                ConversationParticipant.user_id == user_id
            )
        ).first()
        if not participant or participant.last_read_at is None:
            # Count all messages in conversation
            stmt = select(func.count()).where(Message.conversation_id == conversation_id)
        else:
            stmt = select(func.count()).where(
                Message.conversation_id == conversation_id,
                Message.created_at > participant.last_read_at
            )
        return self.session.exec(stmt).first() or 0