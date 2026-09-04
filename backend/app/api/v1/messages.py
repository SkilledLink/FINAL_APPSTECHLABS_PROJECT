from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlmodel import Session
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.dependencies.current_user import get_current_user
from app.database.session import get_session
from app.services.message_service import MessageService
from app.schemas.message import MessageCreate, MessageResponse

router = APIRouter(
    prefix="/conversations/{conversation_id}/messages",
    tags=["Messages"]
)


@router.get(
    "",
    response_model=list[MessageResponse],
    summary="Get paginated messages from a conversation",
    description=(
        "Retrieves the most recent messages from a conversation. "
        "The user must be a participant of the conversation. "
        "Messages are returned in descending order (newest first). "
        "Supports cursor-based pagination using the `before` parameter."
    ),
    responses={
        200: {"description": "List of messages retrieved"},
        403: {"description": "Forbidden – user is not a participant"},
        404: {"description": "Conversation not found"},
    },
)
def get_messages(
    conversation_id: UUID,
    before: Optional[datetime] = Query(
        None,
        description="Get messages created before this timestamp (cursor for pagination)",
    ),
    limit: int = Query(
        50,
        ge=1,
        le=100,
        description="Number of messages to return (max 100)",
    ),
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = MessageService(session)
    return service.get_messages(conversation_id, current_user.id, before, limit)


@router.post(
    "",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send a message to a conversation",
    description=(
        "Creates a new message in the specified conversation. "
        "The user must be a participant. "
        "Supports idempotency via `client_message_id` – if the same ID is sent twice, "
        "the second request returns the original message without duplication."
    ),
    responses={
        201: {"description": "Message sent successfully"},
        400: {"description": "Invalid request data (e.g., missing fields)"},
        403: {"description": "Forbidden – user is not a participant"},
        404: {"description": "Conversation not found"},
    },
)
def send_message(
    conversation_id: UUID,
    data: MessageCreate,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = MessageService(session)
    return service.create_message(conversation_id, current_user.id, data)


@router.post(
    "/read",
    summary="Mark conversation as read for the current user",
    description=(
        "Updates the `last_read_at` timestamp for the authenticated user in this conversation. "
        "This is used to compute unread counts. The user must be a participant."
    ),
    responses={
        200: {"description": "Conversation marked as read"},
        403: {"description": "Forbidden – user is not a participant"},
        404: {"description": "Conversation not found"},
    },
)
def mark_read(
    conversation_id: UUID,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = MessageService(session)
    service.mark_read(conversation_id, current_user.id)
    return {"status": "ok"}