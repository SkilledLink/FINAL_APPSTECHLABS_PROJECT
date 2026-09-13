from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlmodel import Session, func, select

from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, notification: Notification) -> Notification:
        self.session.add(notification)
        self.session.flush()
        return notification

    def get_by_id(self, notification_id: UUID) -> Optional[Notification]:
        return self.session.get(Notification, notification_id)

    def list_for_user(
        self,
        user_id: UUID,
        unread_only: bool = False,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Notification], int]:
        conditions = [Notification.user_id == user_id]
        if unread_only:
            conditions.append(Notification.read_at.is_(None))

        total = self.session.exec(
            select(func.count())
            .select_from(Notification)
            .where(*conditions)
        ).first() or 0

        items = self.session.exec(
            select(Notification)
            .where(*conditions)
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return list(items), total

    def unread_count(self, user_id: UUID) -> int:
        return self.session.exec(
            select(func.count())
            .select_from(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.read_at.is_(None),
            )
        ).first() or 0

    def mark_read(self, notification: Notification) -> Notification:
        if notification.read_at is None:
            notification.read_at = datetime.now(timezone.utc)
            self.session.add(notification)
            self.session.flush()
        return notification

    def mark_all_read(self, user_id: UUID) -> int:
        now = datetime.now(timezone.utc)
        stmt = select(Notification).where(
            Notification.user_id == user_id,
            Notification.read_at.is_(None),
        )
        unread = self.session.exec(stmt).all()
        for n in unread:
            n.read_at = now
            self.session.add(n)
        self.session.flush()
        return len(unread)