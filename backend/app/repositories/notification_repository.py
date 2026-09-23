from datetime import datetime, timezone
from typing import Optional, Callable
from uuid import UUID

from sqlalchemy import func, text
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, session: Session):
        self.session = session

    # ─── Existing methods (unchanged) ──────────────────────────

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

    # ─── Aggregation lookups ───────────────────────────────────

    def find_live_aggregate(
        self, user_id: UUID, type_: str, aggregation_key: str
    ) -> Optional[Notification]:
        """The unread aggregate row for this target, if any."""
        stmt = (
            select(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.type == type_,
                Notification.aggregation_key == aggregation_key,
                Notification.read_at.is_(None),
            )
            .limit(1)
        )
        return self.session.exec(stmt).first()

    def exists_by_key(
        self, user_id: UUID, type_: str, aggregation_key: str
    ) -> bool:
        """Any row (read or unread) with this key."""
        stmt = (
            select(Notification.id)
            .where(
                Notification.user_id == user_id,
                Notification.type == type_,
                Notification.aggregation_key == aggregation_key,
            )
            .limit(1)
        )
        return self.session.exec(stmt).first() is not None

    def delete(self, notification: Notification) -> None:
        self.session.delete(notification)
        self.session.flush()

    def update(self, notification: Notification) -> Notification:
        self.session.add(notification)
        self.session.flush()
        return notification

    # ─── Endpoint-facing helpers ───────────────────────────────

    def delete_by_id_for_user(
        self, user_id: UUID, notification_id: UUID
    ) -> bool:
        n = self.session.get(Notification, notification_id)
        if not n or n.user_id != user_id:
            return False
        self.session.delete(n)
        self.session.flush()
        return True

    def delete_all_read(self, user_id: UUID) -> int:
        stmt = select(Notification).where(
            Notification.user_id == user_id,
            Notification.read_at.is_not(None),
        )
        rows = self.session.exec(stmt).all()
        for n in rows:
            self.session.delete(n)
        self.session.flush()
        return len(rows)

    def mark_many_read(self, user_id: UUID, ids: list[UUID]) -> int:
        if not ids:
            return 0
        now = datetime.now(timezone.utc)
        stmt = select(Notification).where(
            Notification.user_id == user_id,
            Notification.id.in_(ids),
            Notification.read_at.is_(None),
        )
        rows = self.session.exec(stmt).all()
        for n in rows:
            n.read_at = now
            self.session.add(n)
        self.session.flush()
        return len(rows)

    def mark_unread(
        self, user_id: UUID, notification_id: UUID
    ) -> Optional[Notification]:
        n = self.session.get(Notification, notification_id)
        if not n or n.user_id != user_id:
            return None
        if n.read_at is not None:
            n.read_at = None
            self.session.add(n)
            self.session.flush()
        return n

    def count_by_type_prefix(self, user_id: UUID) -> dict[str, int]:
        """GROUP BY the namespace prefix (text before the first dot)."""
        stmt = (
            select(
                func.split_part(Notification.type, ".", 1).label("prefix"),
                func.count().label("n"),
            )
            .where(
                Notification.user_id == user_id,
                Notification.read_at.is_(None),
            )
            .group_by("prefix")
        )
        result: dict[str, int] = {}
        for prefix, n in self.session.exec(stmt).all():
            result[prefix] = int(n)
        return result

    def mark_by_conversation(
        self, user_id: UUID, conversation_id: UUID
    ) -> int:
        """Mark all unread social.message rows for this conversation as read."""
        now = datetime.now(timezone.utc)
        stmt = select(Notification).where(
            Notification.user_id == user_id,
            Notification.type == "social.message",
            Notification.read_at.is_(None),
            text("payload->>'conversation_id' = :cid").bindparams(
                cid=str(conversation_id)
            ),
        )
        rows = self.session.exec(stmt).all()
        for n in rows:
            n.read_at = now
            self.session.add(n)
        self.session.flush()
        return len(rows)

    # ─── Aggregation writers ───────────────────────────────────

    def upsert_aggregate(
        self,
        *,
        user_id: UUID,
        type_: str,
        aggregation_key: str,
        actor_id: UUID,
        actor_display: str,
        title: str,
        body_builder: Callable[[list[str]], str],
        extra_payload: Optional[dict] = None,
    ) -> Notification:
        """Find-or-create a live unread aggregate.

        Race-safe via the partial unique index. Mirrors the
        insert-and-catch-IntegrityError pattern used by
        WebhookEventRepository.try_claim.
        """
        existing = self.find_live_aggregate(user_id, type_, aggregation_key)
        if existing is not None:
            return self._merge_aggregate(
                existing, actor_id, actor_display, title,
                body_builder, extra_payload,
            )

        actor_ids = [str(actor_id)]
        actor_displays = [actor_display]
        new_payload = {
            "actor_ids": actor_ids,
            "actor_displays": actor_displays,
            "count": 1,
        }
        if extra_payload:
            new_payload.update(extra_payload)

        notification = Notification(
            user_id=user_id,
            type=type_,
            title=title[:200],
            body=body_builder(actor_displays)[:1000],
            payload=new_payload,
            aggregation_key=aggregation_key,
        )
        self.session.add(notification)
        try:
            self.session.flush()
        except IntegrityError:
            # Concurrent insert won the race — merge into their row.
            self.session.rollback()
            existing = self.find_live_aggregate(
                user_id, type_, aggregation_key
            )
            if existing is None:
                raise
            return self._merge_aggregate(
                existing, actor_id, actor_display, title,
                body_builder, extra_payload,
            )
        return notification

    def _merge_aggregate(
        self,
        existing: Notification,
        actor_id: UUID,
        actor_display: str,
        title: str,
        body_builder: Callable[[list[str]], str],
        extra_payload: Optional[dict],
    ) -> Notification:
        p = dict(existing.payload or {})
        actor_ids = list(p.get("actor_ids") or [])
        actor_displays = list(p.get("actor_displays") or [])

        aid = str(actor_id)
        if aid not in actor_ids:
            actor_ids.append(aid)
            actor_displays.append(actor_display)

        p["actor_ids"] = actor_ids
        p["actor_displays"] = actor_displays
        p["count"] = len(actor_ids)
        if extra_payload:
            p.update(extra_payload)

        existing.payload = p
        existing.title = title[:200]
        existing.body = body_builder(actor_displays)[:1000]
        self.session.add(existing)
        self.session.flush()
        return existing

    def decrement_aggregate(
        self,
        *,
        user_id: UUID,
        type_: str,
        aggregation_key: str,
        actor_id: UUID,
        body_builder: Optional[Callable[[list[str]], str]] = None,
    ) -> bool:
        """Reverse of upsert_aggregate.

        Removes the actor from the aggregate, deletes the row if the
        count hits zero AND the row is still unread. Never touches a
        read row (history is preserved).
        """
        existing = self.find_live_aggregate(user_id, type_, aggregation_key)
        if existing is None:
            return False

        p = dict(existing.payload or {})
        actor_ids = list(p.get("actor_ids") or [])
        actor_displays = list(p.get("actor_displays") or [])

        aid = str(actor_id)
        if aid in actor_ids:
            idx = actor_ids.index(aid)
            actor_ids.pop(idx)
            if idx < len(actor_displays):
                actor_displays.pop(idx)

        if not actor_ids:
            self.session.delete(existing)
            self.session.flush()
            return True

        p["actor_ids"] = actor_ids
        p["actor_displays"] = actor_displays
        p["count"] = len(actor_ids)
        existing.payload = p
        if body_builder is not None:
            existing.body = body_builder(actor_displays)[:1000]
        self.session.add(existing)
        self.session.flush()
        return True