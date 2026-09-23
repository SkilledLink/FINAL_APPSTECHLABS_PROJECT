import logging
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlmodel import Session, func, select

from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = NotificationRepository(session)

    # ═══════════════════════════════════════════════════════════
    # EXISTING PUBLIC API (unchanged contract)
    # ═══════════════════════════════════════════════════════════

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
            raise HTTPException(
                status_code=404, detail="Notification not found"
            )
        self.repo.mark_read(n)
        self.session.commit()
        self.session.refresh(n)
        return n

    def mark_all_read(self, user_id: UUID) -> int:
        count = self.repo.mark_all_read(user_id)
        self.session.commit()
        return count

    # ═══════════════════════════════════════════════════════════
    # ENDPOINT-FACING WRAPPERS
    # ═══════════════════════════════════════════════════════════

    def get_one(
        self, user_id: UUID, notification_id: UUID
    ) -> Notification:
        n = self.repo.get_by_id(notification_id)
        if not n or n.user_id != user_id:
            raise HTTPException(
                status_code=404, detail="Notification not found"
            )
        return n

    def delete_one(self, user_id: UUID, notification_id: UUID) -> None:
        ok = self.repo.delete_by_id_for_user(user_id, notification_id)
        if not ok:
            raise HTTPException(
                status_code=404, detail="Notification not found"
            )
        self.session.commit()

    def delete_all_read(self, user_id: UUID) -> int:
        count = self.repo.delete_all_read(user_id)
        self.session.commit()
        return count

    def mark_many_read(self, user_id: UUID, ids: list[UUID]) -> int:
        count = self.repo.mark_many_read(user_id, ids)
        self.session.commit()
        return count

    def mark_unread(
        self, user_id: UUID, notification_id: UUID
    ) -> Notification:
        n = self.repo.mark_unread(user_id, notification_id)
        if n is None:
            raise HTTPException(
                status_code=404, detail="Notification not found"
            )
        self.session.commit()
        self.session.refresh(n)
        return n

    def summary(self, user_id: UUID) -> dict[str, int]:
        return self.repo.count_by_type_prefix(user_id)

    def mark_conversation_read(
        self, user_id: UUID, conversation_id: UUID
    ) -> int:
        count = self.repo.mark_by_conversation(user_id, conversation_id)
        self.session.commit()
        return count

    def admin_stats(self) -> dict:
        total = self.session.exec(
            select(func.count()).select_from(Notification)
        ).first() or 0
        unread = self.session.exec(
            select(func.count())
            .select_from(Notification)
            .where(Notification.read_at.is_(None))
        ).first() or 0
        by_type = self.session.exec(
            select(
                Notification.type, func.count().label("n")
            ).group_by(Notification.type)
        ).all()
        return {
            "total": int(total),
            "unread": int(unread),
            "by_type": {t: int(n) for t, n in by_type},
        }

    # ═══════════════════════════════════════════════════════════
    # QUIET WRITE HELPERS
    # ═══════════════════════════════════════════════════════════

    @staticmethod
    def display_name(user) -> str:
        username = getattr(user, "username", None)
        if username:
            return username
        first = getattr(user, "first_name", "") or ""
        last = getattr(user, "last_name", "") or ""
        full = f"{first} {last}".strip()
        return full or "Someone"

    def notify(
        self,
        *,
        user_id: UUID,
        type_: str,
        title: str,
        body: str,
        payload: Optional[dict] = None,
        aggregation_key: Optional[str] = None,
    ) -> Optional[Notification]:
        """Quiet-create. Never raises; logs and swallows on failure."""
        try:
            notification = Notification(
                user_id=user_id,
                type=type_,
                title=title[:200],
                body=body[:1000],
                payload=payload,
                aggregation_key=aggregation_key,
            )
            self.repo.create(notification)
            self.session.commit()
            self.session.refresh(notification)
            return notification
        except Exception:
            logger.exception(
                "Notification write failed: type=%s user=%s", type_, user_id
            )
            self._safe_rollback()
            return None

    def _safe_rollback(self) -> None:
        try:
            self.session.rollback()
        except Exception:
            pass

    # ═══════════════════════════════════════════════════════════
    # EVENT-SPECIFIC HELPERS
    # ═══════════════════════════════════════════════════════════

    @staticmethod
    def _message_preview(
        message_type: str,
        content: Optional[str],
        attachment_name: Optional[str],
    ) -> str:
        mt = (message_type or "").lower()
        if mt == "text":
            text = (content or "").strip()
            if len(text) > 120:
                text = text[:120] + "…"
            return text or "Sent you a message"
        if mt == "voice":
            return "Sent you a voice message"
        if mt == "image":
            return "Sent you a photo"
        if mt == "file":
            if attachment_name:
                return f"Sent you a file: {attachment_name}"[:500]
            return "Sent you a file"
        return "Sent you a message"

    def notify_message(
        self,
        *,
        recipient_id: UUID,
        sender_id: UUID,
        sender_display: str,
        conversation_id: UUID,
        message_id: UUID,
        message_type: str,
        content: Optional[str] = None,
        attachment_name: Optional[str] = None,
    ) -> Optional[Notification]:
        preview = self._message_preview(
            message_type, content, attachment_name
        )
        return self.notify(
            user_id=recipient_id,
            type_="social.message",
            title=f"New message from {sender_display}"[:200],
            body=preview,
            payload={
                "conversation_id": str(conversation_id),
                "message_id": str(message_id),
                "sender_id": str(sender_id),
            },
            aggregation_key=f"msg:{message_id}",
        )

    def notify_like(
        self,
        *,
        recipient_id: UUID,
        actor_id: UUID,
        actor_display: str,
        target_type: str,
        target_id: UUID,
        target_label: str = "post",
    ) -> Optional[Notification]:
        def build_body(displays: list[str]) -> str:
            n = len(displays)
            if n == 1:
                return f"{displays[0]} liked your {target_label}"
            return f"{displays[0]} and {n - 1} others liked your {target_label}"

        try:
            n = self.repo.upsert_aggregate(
                user_id=recipient_id,
                type_="social.like",
                aggregation_key=f"like:{target_type}:{target_id}",
                actor_id=actor_id,
                actor_display=actor_display,
                title=f"New like on your {target_label}",
                body_builder=build_body,
                extra_payload={
                    "target_type": target_type,
                    "target_id": str(target_id),
                },
            )
            self.session.commit()
            self.session.refresh(n)
            return n
        except Exception:
            logger.exception("notify_like failed")
            self._safe_rollback()
            return None

    def notify_unlike(
        self,
        *,
        recipient_id: UUID,
        actor_id: UUID,
        target_type: str,
        target_id: UUID,
        target_label: str = "post",
    ) -> None:
        def build_body(displays: list[str]) -> str:
            n = len(displays)
            if n == 1:
                return f"{displays[0]} liked your {target_label}"
            return f"{displays[0]} and {n - 1} others liked your {target_label}"

        try:
            self.repo.decrement_aggregate(
                user_id=recipient_id,
                type_="social.like",
                aggregation_key=f"like:{target_type}:{target_id}",
                actor_id=actor_id,
                body_builder=build_body,
            )
            self.session.commit()
        except Exception:
            logger.exception("notify_unlike failed")
            self._safe_rollback()

    def notify_follow(
        self,
        *,
        recipient_id: UUID,
        actor_id: UUID,
        actor_display: str,
    ) -> Optional[Notification]:
        def build_body(displays: list[str]) -> str:
            n = len(displays)
            if n == 1:
                return f"{displays[0]} started following you"
            return f"{displays[0]} and {n - 1} others started following you"

        try:
            n = self.repo.upsert_aggregate(
                user_id=recipient_id,
                type_="social.follow",
                aggregation_key=f"follow:{recipient_id}",
                actor_id=actor_id,
                actor_display=actor_display,
                title="New follower",
                body_builder=build_body,
            )
            self.session.commit()
            self.session.refresh(n)
            return n
        except Exception:
            logger.exception("notify_follow failed")
            self._safe_rollback()
            return None

    def notify_unfollow(
        self,
        *,
        recipient_id: UUID,
        actor_id: UUID,
    ) -> None:
        def build_body(displays: list[str]) -> str:
            n = len(displays)
            if n == 1:
                return f"{displays[0]} started following you"
            return f"{displays[0]} and {n - 1} others started following you"

        try:
            self.repo.decrement_aggregate(
                user_id=recipient_id,
                type_="social.follow",
                aggregation_key=f"follow:{recipient_id}",
                actor_id=actor_id,
                body_builder=build_body,
            )
            self.session.commit()
        except Exception:
            logger.exception("notify_unfollow failed")
            self._safe_rollback()

    def notify_comment(
        self,
        *,
        recipient_id: UUID,
        actor_id: UUID,
        actor_display: str,
        target_type: str,
        target_id: UUID,
        comment_id: UUID,
        target_label: str = "post",
    ) -> Optional[Notification]:
        return self.notify(
            user_id=recipient_id,
            type_="social.comment",
            title=f"New comment on your {target_label}"[:200],
            body=f"{actor_display} commented on your {target_label}",
            payload={
                "target_type": target_type,
                "target_id": str(target_id),
                "comment_id": str(comment_id),
                "actor_id": str(actor_id),
            },
        )

    def notify_reply(
        self,
        *,
        recipient_id: UUID,
        actor_id: UUID,
        actor_display: str,
        target_type: str,
        target_id: UUID,
        comment_id: UUID,
        parent_comment_id: UUID,
    ) -> Optional[Notification]:
        return self.notify(
            user_id=recipient_id,
            type_="social.reply",
            title="New reply to your comment",
            body=f"{actor_display} replied to your comment",
            payload={
                "target_type": target_type,
                "target_id": str(target_id),
                "comment_id": str(comment_id),
                "parent_comment_id": str(parent_comment_id),
                "actor_id": str(actor_id),
            },
        )

    def notify_verification(
        self,
        *,
        recipient_id: UUID,
        status: str,
        professional_id: UUID,
        source: str = "didit",
        reason: Optional[str] = None,
    ) -> Optional[Notification]:
        titles = {
            "verification.approved": "Your verification was approved",
            "verification.rejected": "Your verification was rejected",
            "verification.manual_review": "Your verification is under review",
            "verification.expired": "Your verification expired",
            "verification.failed": "Your verification attempt failed",
        }
        return self.notify(
            user_id=recipient_id,
            type_=status,
            title=titles.get(status, "Verification update")[:200],
            body=(reason or titles.get(status, "Verification update"))[:1000],
            payload={
                "professional_id": str(professional_id),
                "source": source,
                "status": status,
            },
        )

    def notify_professional_admin(
        self,
        *,
        recipient_id: UUID,
        type_: str,
        title: str,
        reason: Optional[str] = None,
        professional_id: Optional[UUID] = None,
    ) -> Optional[Notification]:
        return self.notify(
            user_id=recipient_id,
            type_=type_,
            title=title[:200],
            body=(reason or title)[:1000],
            payload={
                "professional_id": str(professional_id)
                if professional_id
                else None,
            },
        )

    def notify_review(
        self,
        *,
        recipient_id: UUID,
        actor_id: UUID,
        actor_display: str,
        rating: int,
        review_id: UUID,
        professional_id: UUID,
    ) -> Optional[Notification]:
        return self.notify(
            user_id=recipient_id,
            type_="review.received",
            title=f"New {rating}-star review"[:200],
            body=f"{actor_display} left you a {rating}-star review",
            payload={
                "review_id": str(review_id),
                "professional_id": str(professional_id),
                "rating": int(rating),
                "actor_id": str(actor_id),
            },
        )

    def notify_payment(
        self,
        *,
        recipient_id: UUID,
        status: str,
        reference: str,
        amount: Optional[float] = None,
        currency: str = "XAF",
    ) -> Optional[Notification]:
        titles = {
            "succeeded": "Payment successful",
            "failed": "Payment failed",
            "refunded": "Payment refunded",
        }
        amount_str = ""
        if amount is not None:
            amount_str = f" ({amount} {currency})"
        return self.notify(
            user_id=recipient_id,
            type_=f"payment.{status}",
            title=titles.get(status, "Payment update")[:200],
            body=f"{titles.get(status, 'Payment update')}{amount_str}",
            payload={
                "reference": reference,
                "amount": amount,
                "currency": currency,
                "status": status,
            },
        )