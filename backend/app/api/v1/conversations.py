# app/api/v1/conversations.py
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
    tags=["Conversations"],
)


class DirectConversationRequest(BaseModel):
    user_id: UUID


# ── active conversations ───────────────────────────────────
@router.get("", response_model=list[ConversationResponse])
def list_conversations(
    current_user=Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Only active conversations. Pending requests are excluded."""
    service = ConversationService(session)
    return service.get_user_conversations(current_user.id)


# ── pending requests received ──────────────────────────────
@router.get("/requests", response_model=list[ConversationResponse])
def list_incoming_requests(
    current_user=Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Direct-conversation requests that were sent to me and are awaiting my response."""
    service = ConversationService(session)
    return service.get_incoming_requests(current_user.id)


# ── group create (and legacy generic create) ───────────────
@router.post(
    "",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_conversation(
    data: ConversationCreate,
    current_user=Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = ConversationService(session)
    return service.create_conversation(current_user.id, data)


# ── direct: send request / auto-return / auto-accept ───────
@router.post(
    "/direct",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
def get_or_create_direct_conversation(
    data: DirectConversationRequest,
    current_user=Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Behavior:
      • An active direct conversation already exists → returns it.
      • The other user already sent *you* a pending request → auto-accepts it.
      • You already sent a pending request → returns the same pending one.
      • Otherwise → creates a PENDING request and notifies the recipient.
    """
    service = ConversationService(session)
    return service.get_or_create_direct_conversation(
        current_user.id, data.user_id
    )


# ── accept / reject ────────────────────────────────────────
@router.post("/{conversation_id}/accept", response_model=ConversationResponse)
def accept_request(
    conversation_id: UUID,
    current_user=Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = ConversationService(session)
    return service.accept_request(conversation_id, current_user.id)


@router.post("/{conversation_id}/reject", status_code=status.HTTP_204_NO_CONTENT)
def reject_request(
    conversation_id: UUID,
    current_user=Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = ConversationService(session)
    service.reject_request(conversation_id, current_user.id)
    return None