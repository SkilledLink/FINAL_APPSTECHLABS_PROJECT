# app/repositories/conversation_repository.py
from sqlmodel import Session, select, func
from uuid import UUID
from typing import List, Optional
from datetime import datetime

from app.models.conversation import Conversation
from app.models.conversation_participant import ConversationParticipant
from app.models.message import Message


class ConversationRepository:
    def __init__(self, session: Session):
        self.session = session

    # ── basic lookups ──────────────────────────────────────
    def get_by_id(self, conversation_id: UUID) -> Optional[Conversation]:
        return self.session.get(Conversation, conversation_id)

    def is_participant(self, conversation_id: UUID, user_id: UUID) -> bool:
        stmt = select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == user_id,
        )
        return self.session.exec(stmt).first() is not None

    def is_active_participant(self, conversation_id: UUID, user_id: UUID) -> bool:
        conv = self.session.get(Conversation, conversation_id)
        if not conv or conv.status != "active":
            return False
        return self.is_participant(conversation_id, user_id)

    # ── lists ──────────────────────────────────────────────
    def get_user_conversations(
        self, user_id: UUID, statuses: tuple[str, ...] = ("active",)
    ) -> List[Conversation]:
        subq = (
            select(ConversationParticipant.conversation_id)
            .where(ConversationParticipant.user_id == user_id)
            .subquery()
        )
        stmt = (
            select(Conversation)
            .where(Conversation.id.in_(subq))
            .where(Conversation.status.in_(statuses))
            .order_by(Conversation.updated_at.desc())
        )
        return self.session.exec(stmt).all()

    def get_incoming_requests(self, user_id: UUID) -> List[Conversation]:
        """Direct conversations where I'm a participant, status pending,
        and I did NOT create it (so it's a request to *me*)."""
        subq = (
            select(ConversationParticipant.conversation_id)
            .where(ConversationParticipant.user_id == user_id)
            .subquery()
        )
        stmt = (
            select(Conversation)
            .where(Conversation.id.in_(subq))
            .where(Conversation.status == "pending")
            .where(Conversation.created_by != user_id)
            .order_by(Conversation.created_at.desc())
        )
        return self.session.exec(stmt).all()

    # ── writes ─────────────────────────────────────────────
    def create_conversation(
        self, conv_data: dict, participant_ids: List[UUID]
    ) -> Conversation:
        conv = Conversation(**conv_data)
        self.session.add(conv)
        self.session.flush()

        for uid in participant_ids:
            self.session.add(
                ConversationParticipant(
                    conversation_id=conv.id,
                    user_id=uid,
                    last_read_at=None,
                )
            )
        self.session.commit()
        self.session.refresh(conv)
        return conv

    def update_status(
        self, conversation_id: UUID, status: str
    ) -> Optional[Conversation]:
        conv = self.session.get(Conversation, conversation_id)
        if not conv:
            return None
        conv.status = status
        conv.updated_at = datetime.utcnow()
        self.session.add(conv)
        self.session.commit()
        self.session.refresh(conv)
        return conv

    def update_last_read(self, conversation_id: UUID, user_id: UUID) -> None:
        stmt = select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == user_id,
        )
        participant = self.session.exec(stmt).first()
        if participant:
            participant.last_read_at = datetime.utcnow()
            self.session.commit()

    # ── direct-conversation helpers ────────────────────────
    def find_direct_conversation(
        self,
        user_id1: UUID,
        user_id2: UUID,
        statuses: tuple[str, ...] = ("active",),
    ) -> Optional[Conversation]:
        """Find a direct conversation between exactly these two users,
        restricted to the given statuses."""
        stmt = (
            select(ConversationParticipant.conversation_id)
            .where(ConversationParticipant.user_id.in_([user_id1, user_id2]))
            .group_by(ConversationParticipant.conversation_id)
            .having(func.count() == 2)
        )
        conv_ids = self.session.exec(stmt).all()
        for conv_id in conv_ids:
            conv = self.session.get(Conversation, conv_id)
            if conv and conv.type == "direct" and conv.status in statuses:
                return conv
        return None

    def find_pending_between(
        self, user_id1: UUID, user_id2: UUID
    ) -> Optional[Conversation]:
        return self.find_direct_conversation(
            user_id1, user_id2, statuses=("pending",)
        )

    # ── aggregates ─────────────────────────────────────────
    def get_participants(
        self, conversation_id: UUID
    ) -> List[ConversationParticipant]:
        stmt = select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conversation_id
        )
        return self.session.exec(stmt).all()

    def get_last_message(self, conversation_id: UUID) -> Optional[dict]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
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
        participant = self.session.exec(
            select(ConversationParticipant).where(
                ConversationParticipant.conversation_id == conversation_id,
                ConversationParticipant.user_id == user_id,
            )
        ).first()

        if not participant:
            return 0

        baseline = participant.last_read_at or participant.joined_at

        stmt = select(func.count()).where(
            Message.conversation_id == conversation_id,
            Message.sender_id != user_id,
            Message.created_at > baseline,
        )
        return self.session.exec(stmt).first() or 0