# app/api/v1/admin_notifications.py
"""Admin-only notification endpoints: broadcast and stats."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database.session import get_session
from app.dependencies.current_user import get_current_active_user
from app.enums.user import AccountStatus
from app.models.user import User
from app.services.notification_service import NotificationService

router = APIRouter(
    prefix="/admin/notifications", tags=["admin-notifications"]
)


def _require_admin(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


@router.post("/broadcast", status_code=status.HTTP_201_CREATED)
def broadcast(
    payload: dict,
    session: Session = Depends(get_session),
    _admin: User = Depends(_require_admin),
):
    """Send an announcement to a filtered set of users.

    Body:
      {
        "type": "system.announcement",
        "title": "Scheduled maintenance",
        "body": "Service will pause at 22:00",
        "payload": {...},
        "user_ids": ["<uuid>", ...]   # optional; if absent, all active
      }
    """
    type_ = str(payload.get("type") or "system.announcement")[:50]
    title = str(payload.get("title") or "Announcement")[:200]
    body = str(payload.get("body") or "")[:1000]
    extra = payload.get("payload")
    user_ids_raw = payload.get("user_ids")

    if user_ids_raw:
        if not isinstance(user_ids_raw, list):
            raise HTTPException(status_code=400, detail="user_ids must be a list")
        try:
            user_ids = [UUID(str(x)) for x in user_ids_raw]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user_ids")
        recipients = session.exec(
            select(User).where(
                User.id.in_(user_ids),
                User.deleted_at.is_(None),
            )
        ).all()
    else:
        recipients = session.exec(
            select(User).where(
                User.deleted_at.is_(None),
                User.status == AccountStatus.ACTIVE,
            )
        ).all()

    service = NotificationService(session)
    sent = 0
    for r in recipients:
        n = service.notify(
            user_id=r.id,
            type_=type_,
            title=title,
            body=body,
            payload=extra,
        )
        if n is not None:
            sent += 1
    return {"sent": sent}


@router.get("/stats")
def stats(
    session: Session = Depends(get_session),
    _admin: User = Depends(_require_admin),
):
    return NotificationService(session).admin_stats()