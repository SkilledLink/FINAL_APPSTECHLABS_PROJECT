from sqlmodel import Session, select
from uuid import UUID
from typing import List
from app.models.conversation import Conversation
from app.models.conversation_participant import ConversationParticipant
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