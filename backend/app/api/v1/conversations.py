from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from uuid import UUID
from pydantic import BaseModel
from app.dependencies.current_user import get_current_user
from app.database.session import get_session
from app.services.conversation_service import ConversationService
from app.schemas.conversation import ConversationCreate, ConversationResponse

router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)

class DirectConversationRequest(BaseModel):
    user_id: UUID

@router.get("", response_model=list[ConversationResponse])
def list_conversations(
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = ConversationService(session)
    return service.get_user_conversations(current_user.id)

@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    data: ConversationCreate,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = ConversationService(session)
    return service.create_conversation(current_user.id, data)

@router.post("/direct", response_model=ConversationResponse, status_code=status.HTTP_200_OK)
def get_or_create_direct_conversation(
    data: DirectConversationRequest,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = ConversationService(session)
    return service.get_or_create_direct_conversation(current_user.id, data.user_id)