from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from uuid import UUID
from app.dependencies.current_user import get_current_user
from app.database.session import get_session
from app.services.conversation_service import ConversationService
from app.schemas.conversation import ConversationCreate, ConversationResponse

router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)


@router.get(
    "",
    response_model=list[ConversationResponse],
    summary="Get all conversations for the current user",
    description=(
        "Returns a list of all conversations the authenticated user is a participant in. "
        "Includes the other participant's details, the last message, and unread count."
    ),
    responses={
        200: {"description": "List of conversations retrieved"},
        401: {"description": "Unauthorized – missing or invalid token"},
    },
)
def list_conversations(
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = ConversationService(session)
    return service.get_user_conversations(current_user.id)


@router.post(
    "",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new conversation",
    description=(
        "Creates a new direct or group conversation. "
        "The creator is automatically added as a participant. "
        "Provide a list of `participant_ids` to include other users."
    ),
    responses={
        201: {"description": "Conversation created successfully"},
        400: {"description": "Invalid input (e.g., no participants)"},
        401: {"description": "Unauthorized"},
        404: {"description": "One or more participant users not found"},
    },
)
def create_conversation(
    data: ConversationCreate,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = ConversationService(session)
    return service.create_conversation(current_user.id, data)