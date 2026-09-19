from uuid import UUID
from fastapi import HTTPException, status
from sqlmodel import Session
from app.models.conversation import Conversation
from app.repositories.conversation_repository import ConversationRepository
from app.schemas.conversation import ConversationCreate, ConversationResponse, ParticipantInfo
from app.services.user_service import UserService
from typing import List


class ConversationService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = ConversationRepository(session)
        self.user_service = UserService(session)

    def get_user_conversations(self, user_id: UUID) -> List[ConversationResponse]:
        conversations = self.repo.get_user_conversations(user_id)
        return [self._build_conversation_response(conv, user_id) for conv in conversations]

    def create_conversation(self, user_id: UUID, data: ConversationCreate) -> ConversationResponse:
        if user_id not in data.participant_ids:
            data.participant_ids.append(user_id)
        conv_data = data.model_dump(exclude={"participant_ids"})
        conv_data["created_by"] = user_id
        conv = self.repo.create_conversation(conv_data, data.participant_ids)
        return self._build_conversation_response(conv, user_id)

    def get_or_create_direct_conversation(self, user_id: UUID, other_user_id: UUID) -> ConversationResponse:
        # 1. Check if conversation already exists
        existing = self.repo.find_direct_conversation(user_id, other_user_id)
        if existing:
            return self._build_conversation_response(existing, user_id)

        # 2. Create new direct conversation
        conv = self.repo.create_conversation(
            conv_data={"type": "direct", "created_by": user_id},
            participant_ids=[user_id, other_user_id]
        )
        return self._build_conversation_response(conv, user_id)

    def _build_conversation_response(self, conv: Conversation, current_user_id: UUID) -> ConversationResponse:
        participants = self.repo.get_participants(conv.id)
        other = None
        for p in participants:
            if p.user_id != current_user_id:
                # Use the new method to get a plain User object
                user = self.user_service.get_user_model_by_id(p.user_id)
                other = ParticipantInfo(
                    id=user.id,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    profile_image_url=user.profile_image_url,
                    username=user.username,
                )
                break

        last_msg = self.repo.get_last_message(conv.id)
        unread = self.repo.count_unread(conv.id, current_user_id)

        return ConversationResponse(
            id=conv.id,
            type=conv.type,
            title=conv.title,
            created_by=conv.created_by,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            last_message=last_msg,
            unread_count=unread,
            participant=other,
        )