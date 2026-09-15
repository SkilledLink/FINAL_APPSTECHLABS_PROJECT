import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Session

from app.enums.moderation import (
    CANONICAL_CATEGORIES,
    ModerationDecision,
)
from app.models.feed import Feed, FeedMedia
from app.models.moderation_record import ModerationRecord
from app.repositories.moderation_repository import ModerationRepository
from app.services.moderation import decision as decision_engine
from app.services.moderation.image_moderator import ImageModerator
from app.services.moderation.providers.factory import (
    build_image_provider,
    build_text_provider,
)
from app.services.moderation.provider import ProviderResult
from app.services.moderation.text_moderator import TextModerator
from app.services.moderation.video_moderator import VideoModerator

logger = logging.getLogger(__name__)


@dataclass
class ModerationOutcome:
    decision: str
    severity: int
    confidence: int
    description: str
    reason: str
    categories: list[str]
    provider: str
    model: str
    error: Optional[str]
    record: ModerationRecord


class ModerationService:
    def __init__(
        self,
        session: Session,
        text_provider=None,
        image_provider=None,
    ):
        self.session = session
        self.repo = ModerationRepository(session)

        self.text_provider = text_provider or build_text_provider()
        self.image_provider = image_provider or build_image_provider()

        self.text_moderator = TextModerator(self.text_provider)
        self.image_moderator = ImageModerator(self.image_provider)
        self.video_moderator = VideoModerator()

    # ─── Public API ─────────────────────────────────────────
    def moderate_feed(self, feed: Feed) -> ModerationOutcome:
        """Run moderation for a feed, persist a ModerationRecord,
        supersede any prior active record, and return the outcome."""

        # Supersede previous record (edit-triggered re-moderation)
        self.repo.supersede_for_feed(feed.id)

        text_result = self.text_moderator.moderate(
            title=feed.title, description=feed.description
        )

        image_results: list[ProviderResult] = []
        for media in self._image_media(feed):
            image_results.append(self.image_moderator.moderate(media.media_url))

        # VideoModerator is a no-op stub for now.
        for media in self._video_media(feed):
            self.video_moderator.moderate(
                media_url=media.media_url,
                duration_seconds=media.duration_seconds,
            )

        combined = decision_engine.combine([text_result, *image_results])
        decision = decision_engine.decide(combined.severity)

        record = ModerationRecord(
            feed_id=feed.id,
            decision=decision,
            combined_severity=combined.severity,
            combined_confidence=combined.confidence,
            text_result=self._serialise(text_result),
            image_results=[self._serialise(r) for r in image_results],
            provider=combined.provider or self.text_provider.name,
            model=combined.model or "",
            error=combined.error,
        )
        self.repo.create(record)
        self.session.commit()
        self.session.refresh(record)

        logger.info(
            "Moderation for feed %s: %s (severity=%s, confidence=%s)",
            feed.id, decision, combined.severity, combined.confidence,
        )

        return ModerationOutcome(
            decision=decision,
            severity=combined.severity,
            confidence=combined.confidence,
            description=combined.description,
            reason=combined.reason,
            categories=self._filter_categories(combined.categories),
            provider=record.provider,
            model=record.model,
            error=record.error,
            record=record,
        )

    def review(
        self,
        record_id,
        reviewer,
        action: str,
        reason: str,
        request=None,
    ) -> ModerationRecord:
        from app.models.user import User
        from app.services.audit_service import AuditService
        from app.services.notification_service import NotificationService

        record = self.repo.get_by_id(record_id)
        if not record:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Moderation record not found")

        if record.reviewed_at is not None or record.superseded_at is not None:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=409,
                detail="Record already reviewed or superseded",
            )

        now = datetime.now(timezone.utc)
        record.reviewed_by_user_id = reviewer.id
        record.reviewed_at = now
        record.review_action = action
        record.review_notes = reason
        self.session.add(record)

        feed = self.session.get(Feed, record.feed_id)
        if feed is not None:
            feed.status = (
                "published" if action == "approve" else "rejected"
            )
            feed.updated_at = now
            self.session.add(feed)

        self.session.flush()

        # Notify author + audit
        if feed is not None:
            try:
                NotificationService(self.session).create(
                    user_id=feed.user_id,
                    type=("post_approved" if action == "approve" else "post_rejected"),
                    title=("Your post has been approved"
                           if action == "approve"
                           else "Your post has been rejected"),
                    body=reason[:1000],
                    payload={
                        "feed_id": str(feed.id),
                        "record_id": str(record.id),
                    },
                )
            except Exception as e:
                logger.warning("Notification creation failed: %s", e)

            try:
                AuditService(self.session).log(
                    actor=reviewer,
                    action=f"moderation.{action}",
                    entity_type="feed",
                    entity_id=feed.id,
                    new_value={"decision": feed.status, "reason": reason},
                    reason=reason,
                    request=request,
                )
            except Exception as e:
                logger.warning("Audit log failed: %s", e)

        self.session.commit()
        self.session.refresh(record)
        return record

    # ─── Internals ──────────────────────────────────────────
    def _image_media(self, feed: Feed) -> list[FeedMedia]:
        from sqlmodel import select
        return list(self.session.exec(
            select(FeedMedia).where(
                FeedMedia.feed_id == feed.id,
                FeedMedia.media_type == "image",
            )
        ).all())

    def _video_media(self, feed: Feed) -> list[FeedMedia]:
        from sqlmodel import select
        return list(self.session.exec(
            select(FeedMedia).where(
                FeedMedia.feed_id == feed.id,
                FeedMedia.media_type == "video",
            )
        ).all())

    def _serialise(self, r: ProviderResult) -> dict:
        return {
            "severity": r.severity,
            "confidence": r.confidence,
            "description": r.description,
            "reason": r.reason,
            "categories": r.categories,
            "provider": r.provider,
            "model": r.model,
            "error": r.error,
            "raw": r.raw,
            # Fallback metadata
            "fallback_used": r.fallback_used,
            "primary_provider": r.primary_provider,
            "primary_model": r.primary_model,
            "primary_error": r.primary_error,
        }

    def _filter_categories(self, categories: list[str]) -> list[str]:
        return [c for c in categories if c in CANONICAL_CATEGORIES]
