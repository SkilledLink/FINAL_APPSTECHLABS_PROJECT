from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.dependencies.current_user import get_current_user
from app.database.session import get_session
from app.services.message_service import MessageService
from app.schemas.message import MessageCreate, MessageResponse

router = APIRouter(prefix="/conversations/{conversation_id}/messages", tags=["messages"])

@router.get("", response_model=list[MessageResponse])
def get_messages(
    conversation_id: UUID,
    before: Optional[datetime] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = MessageService(session)
    return service.get_messages(conversation_id, current_user["id"], before, limit)   # <-- fixed

@router.post("", response_model=MessageResponse)
def send_message(
    conversation_id: UUID,
    data: MessageCreate,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = MessageService(session)
    return service.create_message(conversation_id, current_user["id"], data)   # <-- fixed

@router.post("/read")
def mark_read(
    conversation_id: UUID,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = MessageService(session)
    service.mark_read(conversation_id, current_user["id"])   # <-- fixed
    return {"status": "ok"}