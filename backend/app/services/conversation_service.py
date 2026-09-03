from uuid import UUID
from fastapi import HTTPException, status
from sqlmodel import Session
from app.repositories.conversation_repository import ConversationRepository
from app.schemas.conversation import ConversationCreate

class ConversationService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = ConversationRepository(session)

    def get_user_conversations(self, user_id: UUID):
        return self.repo.get_user_conversations(user_id)

    def create_conversation(self, user_id: UUID, data: ConversationCreate):
        if user_id not in data.participant_ids:
            data.participant_ids.append(user_id)
        conv_data = data.model_dump(exclude={"participant_ids"})
        conv_data["created_by"] = user_id
        return self.repo.create_conversation(conv_data, data.participant_ids)