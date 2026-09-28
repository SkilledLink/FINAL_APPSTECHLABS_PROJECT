# app/services/moderation/moderation_service.py
import hashlib
import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Session

from app.ai.cache import TTLCache
from app.core.config import settings
from app.enums.moderation import (
    CANONICAL_CATEGORIES,
    ModerationDecision,
)
from app.models.feed import Feed, FeedMedia
from app.models.moderation_record import ModerationRecord
from app.repositories.moderation_repository import ModerationRepository
from app.services.moderation import decision as decision_engine
from app.services.moderation.image_fetcher import (
    CloudinaryImageFetcher,
    ImageFetchError,
)
from app.services.moderation.multimodal_moderator import MultimodalModerator
from app.services.moderation.providers.factory import (
    build_image_provider,
    build_text_provider,
)
from app.services.moderation.provider import ProviderResult
from app.services.moderation.rate_limiter import SlidingWindowLimiter
from app.services.moderation.text_moderator import TextModerator
from app.services.moderation.video_moderator import VideoModerator

logger = logging.getLogger(__name__)


# ── Module-level caches / limiters ──────────────────────────
_content_cache = TTLCache(
    ttl_seconds=settings.MODERATION_TEXT_CACHE_TTL_SECONDS,
    max_size=settings.MODERATION_TEXT_CACHE_MAX_SIZE,
)
_provider_limiter = SlidingWindowLimiter(
    max_per_minute=settings.MODERATION_MAX_CALLS_PER_MINUTE,
)


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
        multimodal_provider=None,
    ):
        self.session = session
        self.repo = ModerationRepository(session)
        self.fetcher = CloudinaryImageFetcher()

        self.text_provider = text_provider or build_text_provider()
        self.image_provider = image_provider or build_image_provider()
        self.multimodal_provider = multimodal_provider or self.image_provider

        self.text_moderator = TextModerator(self.text_provider)
        self.image_moderator = None
        self.multimodal_moderator = MultimodalModerator(self.multimodal_provider)
        self.video_moderator = VideoModerator()

    # ─── Public API ─────────────────────────────────────────
    def moderate_feed(self, feed: Feed) -> ModerationOutcome:
        """Run moderation for a feed, persist a ModerationRecord,
        supersede any prior active record, and return the outcome."""

        self.repo.supersede_for_feed(feed.id)

        # ── FAST PATH: any video → auto-approve, skip the LLM ──
        # Video moderation is not implemented (see video_moderator.py).
        # For the demo we auto-publish videos rather than routing them
        # to manual review. Calling Gemini anyway costs 2–5 seconds of
        # latency for zero change in outcome. Short-circuit here.
        #
        # ⚠️ FOR PRODUCTION: revert to REVIEW — auto-publishing
        # unmoderated video is a policy risk.
        video_media = self._video_media(feed)
        if video_media:
            logger.info(
                "Feed %s has %d video(s) — auto-approving without LLM call",
                feed.id,
                len(video_media),
            )
            return self._persist_video_auto_approved(feed, video_media)

        # ── Fetch images once, keep bytes for hashing + multimodal call ──
        images_bytes: list[tuple[bytes, str]] = []
        image_meta: list[dict] = []
        for media in self._image_media(feed):
            try:
                img_bytes, mime = self.fetcher.fetch_and_resize(media.media_url)
                images_bytes.append((img_bytes, mime))
                image_meta.append({
                    "media_type": "image",
                    "url": media.media_url,
                    "hash": hashlib.sha256(img_bytes).hexdigest(),
                })
            except ImageFetchError as e:
                logger.warning("Image fetch failed for %s: %s", media.media_url, e)
                image_meta.append({
                    "media_type": "image",
                    "url": media.media_url,
                    "hash": None,
                    "fetch_error": str(e),
                })

        # ── Cache lookup ─────────────────────────────────────
        cache_key = self._content_key(
            feed.title, feed.description,
            [m.get("hash") for m in image_meta],
        )
        cached = _content_cache.get(cache_key)
        if cached is not None:
            logger.info("moderation cache hit feed=%s", feed.id)
            return self._persist_from_cached(feed, cached, image_meta)

        # ── Rate limit guard ─────────────────────────────────
        if not _provider_limiter.allow():
            logger.warning(
                "moderation rate limit hit — routing feed %s to review", feed.id
            )
            return self._persist_review_due_to_rate_limit(feed, image_meta)

        # ── Single call: text + images together ──────────────
        result = self.multimodal_moderator.moderate(
            title=feed.title,
            description=feed.description,
            images=images_bytes,
        )

        # ── Combine (single multimodal result) ───────────────
        combined = decision_engine.combine([result])
        decision = decision_engine.decide(combined.severity)

        # ── Persist ──────────────────────────────────────────
        record = ModerationRecord(
            feed_id=feed.id,
            decision=decision,
            combined_severity=combined.severity,
            combined_confidence=combined.confidence,
            text_result=self._serialise(result),
            image_results=image_meta,
            provider=combined.provider or self.multimodal_provider.name,
            model=combined.model or "",
            error=combined.error,
        )
        self.repo.create(record)
        self.session.commit()
        self.session.refresh(record)

        if not result.error:
            _content_cache.set(
                cache_key,
                {
                    "decision": decision,
                    "severity": combined.severity,
                    "confidence": combined.confidence,
                    "description": combined.description,
                    "reason": combined.reason,
                    "categories": self._filter_categories(combined.categories),
                    "provider": record.provider,
                    "model": record.model,
                },
            )

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

    def review(self, record_id, reviewer, action: str, reason: str, request=None) -> ModerationRecord:
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
            feed.status = ("published" if action == "approve" else "rejected")
            feed.updated_at = now
            self.session.add(feed)

        self.session.flush()

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
    def _content_key(
        self, title: str, description: str, image_hashes: list[Optional[str]],
    ) -> str:
        h = hashlib.sha256()
        h.update((title or "").strip().encode("utf-8"))
        h.update(b"\x00")
        h.update((description or "").strip().encode("utf-8"))
        for ih in image_hashes:
            h.update(b"\x00")
            h.update((ih or "none").encode("ascii"))
        return h.hexdigest()

    def _persist_from_cached(
        self, feed: Feed, cached: dict, image_meta: list[dict],
    ) -> ModerationOutcome:
        record = ModerationRecord(
            feed_id=feed.id,
            decision=cached["decision"],
            combined_severity=cached["severity"],
            combined_confidence=cached["confidence"],
            text_result={
                "description": cached["description"],
                "reason": cached["reason"],
                "categories": cached["categories"],
                "provider": cached["provider"],
                "model": cached["model"],
                "cached": True,
            },
            image_results=image_meta,
            provider=cached["provider"],
            model=cached["model"],
            error=None,
        )
        self.repo.create(record)
        self.session.commit()
        self.session.refresh(record)

        return ModerationOutcome(
            decision=cached["decision"],
            severity=cached["severity"],
            confidence=cached["confidence"],
            description=cached["description"],
            reason=cached["reason"],
            categories=cached["categories"],
            provider=cached["provider"],
            model=cached["model"],
            error=None,
            record=record,
        )

    def _persist_video_auto_approved(
        self, feed: Feed, video_media: list[FeedMedia],
    ) -> ModerationOutcome:
        """
        Video posts skip moderation entirely and go live immediately.

        Rationale for the demo: video moderation isn't implemented, and
        routing every video to review makes publishing feel slow. Videos
        are auto-published.

        ⚠️ FOR PRODUCTION: revert this to REVIEW — auto-publishing
        unmoderated video is a policy risk.
        """
        image_meta = [
            {
                "media_type": "video",
                "url": m.media_url,
                "duration_seconds": m.duration_seconds,
            }
            for m in video_media
        ]

        record = ModerationRecord(
            feed_id=feed.id,
            decision=ModerationDecision.SAFE.value,
            combined_severity=1,
            combined_confidence=100,
            text_result={
                "description": "Video auto-approved",
                "reason": "Video moderation disabled for demo",
                "categories": [],
                "provider": "internal",
                "model": "video_auto_publish",
            },
            image_results=image_meta,
            provider="internal",
            model="video_auto_publish",
            error=None,
        )
        self.repo.create(record)
        self.session.commit()
        self.session.refresh(record)

        return ModerationOutcome(
            decision=ModerationDecision.SAFE.value,
            severity=1,
            confidence=100,
            description="Video auto-approved",
            reason="Video moderation disabled for demo",
            categories=[],
            provider="internal",
            model="video_auto_publish",
            error=None,
            record=record,
        )

    def _persist_review_due_to_rate_limit(
        self, feed: Feed, image_meta: list[dict],
    ) -> ModerationOutcome:
        record = ModerationRecord(
            feed_id=feed.id,
            decision=ModerationDecision.REVIEW.value,
            combined_severity=6,
            combined_confidence=0,
            text_result={
                "description": "Moderation deferred due to provider rate limit",
                "reason": "Rate limit hit — post queued for review",
                "categories": [],
                "provider": "internal",
                "model": "rate_limit",
                "error": "rate_limit_hit",
            },
            image_results=image_meta,
            provider="internal",
            model="rate_limit",
            error="rate_limit_hit",
        )
        self.repo.create(record)
        self.session.commit()
        self.session.refresh(record)

        return ModerationOutcome(
            decision=ModerationDecision.REVIEW.value,
            severity=6,
            confidence=0,
            description="Moderation deferred due to provider rate limit",
            reason="Rate limit hit — post queued for review",
            categories=[],
            provider="internal",
            model="rate_limit",
            error="rate_limit_hit",
            record=record,
        )

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
            "fallback_used": r.fallback_used,
            "primary_provider": r.primary_provider, 
            "primary_model": r.primary_model,
            "primary_error": r.primary_error,
        }

    def _filter_categories(self, categories: list[str]) -> list[str]:
        return [c for c in categories if c in CANONICAL_CATEGORIES]