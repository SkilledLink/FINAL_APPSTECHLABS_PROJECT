# app/api/v1/notifications_ext.py
"""Additive notification endpoints.

Mounted on the same prefix as app/api/v1/notifications.py. Static
paths (unread-count, summary, read, test) MUST be declared before
/{notification_id} or FastAPI will parse them as UUIDs and 422.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.current_user import get_current_active_user
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter(
    prefix="/users/me/notifications",
    tags=["notifications"],
)

# ═══════════════════════════════════════════════════════════
# STATIC ROUTES — must come first
# ═══════════════════════════════════════════════════════════


@router.get("/unread-count")
def unread_count(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    """Badge polling — lightweight, no list returned."""
    return {
        "unread": NotificationService(session).unread_count(current_user.id)
    }


@router.get("/summary")
def notification_summary(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    """Unread counts grouped by type prefix (e.g. social, verification)."""
    counts = NotificationService(session).summary(current_user.id)
    return {"counts": counts}


@router.post("/read")
def bulk_mark_read(
    payload: dict,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    """Bulk mark-as-read by explicit notification IDs.

    Body: {"ids": ["<uuid>", "<uuid>", ...]}
    """
    raw = payload.get("ids") or []
    if not isinstance(raw, list):
        raise HTTPException(status_code=400, detail="ids must be a list")
    try:
        ids = [UUID(str(x)) for x in raw]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id format")

    count = NotificationService(session).mark_many_read(
        current_user.id, ids
    )
    return {"marked_read": count}


@router.post("/test", status_code=status.HTTP_201_CREATED)
def create_test_notification(
    payload: dict,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    """Dev-only self-directed notification.

    Lets the frontend build the inbox UI before any real producer is
    wired up. Creates a row owned by the caller only.
    """
    n = NotificationService(session).create(
        user_id=current_user.id,
        type=str(payload.get("type") or "test.notification")[:50],
        title=str(payload.get("title") or "Test notification")[:200],
        body=str(
            payload.get("body") or "This is a test notification."
        )[:1000],
        payload=payload.get("payload"),
    )
    return NotificationResponse.model_validate(n)


@router.delete("")
def delete_all_read(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    """Delete every already-read notification for the caller."""
    count = NotificationService(session).delete_all_read(current_user.id)
    return {"deleted": count}


# ═══════════════════════════════════════════════════════════
# DYNAMIC ROUTES
# ═══════════════════════════════════════════════════════════


@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(
    notification_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    return NotificationService(session).get_one(
        user_id=current_user.id,
        notification_id=notification_id,
    )


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    NotificationService(session).delete_one(
        user_id=current_user.id,
        notification_id=notification_id,
    )
    return None


@router.post(
    "/{notification_id}/unread", response_model=NotificationResponse
)
def mark_notification_unread(
    notification_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    return NotificationService(session).mark_unread(
        user_id=current_user.id,
        notification_id=notification_id,
    )