import logging
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlmodel import Session

from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = NotificationRepository(session)

    def create(
        self,
        user_id: UUID,
        type: str,
        title: str,
        body: str,
        payload: Optional[dict] = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            type=type,
            title=title[:200],
            body=body[:1000],
            payload=payload,
        )
        self.repo.create(notification)
        self.session.commit()
        self.session.refresh(notification)
        return notification

    def list_for_user(
        self,
        user_id: UUID,
        unread_only: bool = False,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Notification], int]:
        return self.repo.list_for_user(
            user_id, unread_only=unread_only, skip=skip, limit=limit
        )

    def unread_count(self, user_id: UUID) -> int:
        return self.repo.unread_count(user_id)

    def mark_read(self, user_id: UUID, notification_id: UUID) -> Notification:
        n = self.repo.get_by_id(notification_id)
        if not n or n.user_id != user_id:
            raise HTTPException(status_code=404, detail="Notification not found")
        self.repo.mark_read(n)
        self.session.commit()
        self.session.refresh(n)
        return n

    def mark_all_read(self, user_id: UUID) -> int:
        count = self.repo.mark_all_read(user_id)
        self.session.commit()
        return count