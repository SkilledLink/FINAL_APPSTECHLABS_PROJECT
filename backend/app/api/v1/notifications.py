from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.current_user import get_current_active_user
from app.models.user import User
from app.schemas.notification import (
    NotificationListResponse,
    NotificationResponse,
)
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/users/me/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse)
def list_notifications(
    unread_only: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    service = NotificationService(session)
    items, total = service.list_for_user(
        current_user.id, unread_only=unread_only, skip=skip, limit=limit
    )
    return NotificationListResponse(
        items=[NotificationResponse.model_validate(n) for n in items],
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
        unread_count=service.unread_count(current_user.id),
    )


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(
    notification_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    return NotificationService(session).mark_read(
        user_id=current_user.id, notification_id=notification_id
    )


@router.post("/read-all")
def mark_all_read(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    count = NotificationService(session).mark_all_read(current_user.id)
    return {"marked_read": count}