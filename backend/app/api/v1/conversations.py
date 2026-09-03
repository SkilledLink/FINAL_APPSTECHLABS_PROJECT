from fastapi import APIRouter, Depends
from sqlmodel import Session
from uuid import UUID
from app.dependencies.current_user import get_current_user
from app.database.session import get_session
from app.services.conversation_service import ConversationService
from app.schemas.conversation import ConversationCreate, ConversationResponse

router = APIRouter(prefix="/conversations", tags=["conversations"])

@router.get("", response_model=list[ConversationResponse])
def list_conversations(
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ConversationService(session)
    return service.get_user_conversations(current_user["id"])   # <-- fixed

@router.post("", response_model=ConversationResponse)
def create_conversation(
    data: ConversationCreate,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ConversationService(session)
    return service.create_conversation(current_user["id"], data)   # <-- fixed (added closing )