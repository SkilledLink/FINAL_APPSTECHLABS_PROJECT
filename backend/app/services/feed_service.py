# app/services/feed_service.py

from logging import getLogger
from typing import Optional, List, Dict, Set
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile
from sqlmodel import Session

from app.models.user import User
from app.models.feed import Feed, FeedMedia, FeedComment
from app.repositories.feed_repository import FeedRepository
from app.repositories.moderation_repository import ModerationRepository
from app.schemas.feed import (
    FeedResponse,
    FeedCreate,
    FeedUpdate,
    FeedListResponse,
    FeedMediaResponse,
    FeedLikeResponse,
    FeedCommentCreate,
    FeedCommentResponse,
    HashtagResponse,
    FeedThumbnailResponse,
    FeedThumbnailListResponse,
)
from app.schemas.user import UserResponse
from app.schemas.moderation import ModerationSummary
from app.services.storage_service import StorageService
from app.services.notification_service import NotificationService
from app.services.audit_service import AuditService
from app.enums.moderation import FeedStatus, ModerationDecision

logger = getLogger(__name__)


# ─── Cloudinary thumbnail transforms ───────────────────────
# Inserted between /upload/ and the version segment of the URL.
# 400px square, auto format (WebP/AVIF where supported), auto quality.
# Video adds so_0.1 — capture the frame at 0.1s.
_CLOUDINARY_IMAGE_TRANSFORM = "c_fill,f_auto,h_400,q_auto,w_400"
_CLOUDINARY_VIDEO_TRANSFORM = "c_fill,f_auto,h_400,q_auto,so_0.1,w_400"


class FeedService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = FeedRepository(session)
        self.storage = StorageService()
        self.moderation_repo = ModerationRepository(session)

    # ─── Visibility helpers ──────────────────────────────────
    def _is_moderation_staff(self, user: User) -> bool:
        return bool(user.is_admin or user.is_moderator)

    def _can_view_feed(self, feed: Feed, user: User) -> bool:
        return feed.status == FeedStatus.PUBLISHED.value

    def _ensure_feed_viewable(self, feed: Feed, user: User) -> None:
        if not self._can_view_feed(feed, user):
            raise HTTPException(
                status_code=404,
                detail="Feed not found",
            )

    def _ensure_feed_interactable(self, feed: Feed, user: User) -> None:
        if feed.status != FeedStatus.PUBLISHED.value:
            raise HTTPException(
                status_code=404,
                detail="Feed not found",
            )

    # ─── Create ─────────────────────────────────────────────
    def create_feed(
        self,
        user: User,
        data: FeedCreate,
        media_file: Optional[UploadFile] = None,
    ) -> FeedResponse:
        try:
            feed = self.repo.create(
                user,
                {
                    "title": data.title,
                    "description": data.description,
                    "status": FeedStatus.PENDING_MODERATION.value,
                    "is_public": data.is_public,
                },
            )

            if media_file:
                self._handle_media_upload(feed, media_file, user.id)

            if data.hashtags:
                self.repo.add_hashtags(feed, data.hashtags)

            self.session.commit()
            feed = self.repo.get_by_id(feed.id)

            # ── Moderation ──────────────────────────────────────
            try:
                from app.services.moderation.moderation_service import (
                    ModerationService,
                )

                outcome = ModerationService(self.session).moderate_feed(feed)
            except Exception:
                logger.exception("Moderation crashed for feed %s", feed.id)

                feed.status = FeedStatus.PENDING_REVIEW.value
                self.session.add(feed)
                self.session.commit()
                self.session.refresh(feed)

                outcome = None

            # ── Apply decision ──────────────────────────────────
            if outcome is not None:
                if outcome.decision == ModerationDecision.SAFE.value:
                    feed.status = FeedStatus.PUBLISHED.value
                elif outcome.decision == ModerationDecision.REVIEW.value:
                    feed.status = FeedStatus.PENDING_REVIEW.value
                else:
                    feed.status = FeedStatus.REJECTED.value

                self.session.add(feed)
                self.session.commit()
                self.session.refresh(feed)

                self._log_moderation_outcome(user, feed, outcome)
                self._notify_author(user, feed, outcome)

            feed = self.repo.get_by_id(feed.id)

            return self._build_feed_response(
                feed,
                user,
                with_details=True,
                include_moderation=True,
            )

        except HTTPException:
            self.session.rollback()
            raise

        except Exception as e:
            self.session.rollback()
            logger.error("Feed creation failed: %s", e)
            raise HTTPException(status_code=500, detail=str(e))

    # ─── Moderation helpers ─────────────────────────────────
    def _log_moderation_outcome(
        self,
        user: User,
        feed: Feed,
        outcome,
    ) -> None:
        try:
            action = {
                "safe": "moderation.auto_safe",
                "review": "moderation.auto_review",
                "unsafe": "moderation.auto_unsafe",
            }.get(
                outcome.decision,
                "moderation.auto_safe",
            )

            if outcome.error:
                action = "moderation.failed"

            AuditService(self.session).log(
                actor=user,
                action=action,
                entity_type="feed",
                entity_id=feed.id,
                new_value={
                    "decision": outcome.decision,
                    "severity": outcome.severity,
                    "confidence": outcome.confidence,
                    "provider": outcome.provider,
                },
                reason=outcome.reason,
            )

            self.session.commit()

        except Exception as e:
            logger.warning("Audit log write failed: %s", e)
            self.session.rollback()

    def _notify_author(
        self,
        user: User,
        feed: Feed,
        outcome,
    ) -> None:
        if (
            outcome.decision == ModerationDecision.SAFE.value
            and not outcome.error
        ):
            return

        try:
            if outcome.decision == ModerationDecision.UNSAFE.value:
                ntype = "post_rejected"
                title = "Your post was rejected"

            elif outcome.decision == ModerationDecision.REVIEW.value:
                ntype = "post_pending_review"
                title = "Your post is under review"

            else:
                return

            NotificationService(self.session).create(
                user_id=user.id,
                type=ntype,
                title=title,
                body=(
                    outcome.reason or "See moderation details."
                )[:1000],
                payload={
                    "feed_id": str(feed.id),
                    "record_id": str(outcome.record.id),
                    "severity": outcome.severity,
                    "confidence": outcome.confidence,
                },
            )

        except Exception as e:
            logger.warning(
                "Notification write failed: %s",
                e,
            )
            self.session.rollback()

    def _moderate_feed_after_change(
        self,
        feed: Feed,
        user: User,
    ):
        feed.status = FeedStatus.PENDING_MODERATION.value
        self.session.add(feed)
        self.session.commit()
        self.session.refresh(feed)

        try:
            from app.services.moderation.moderation_service import (
                ModerationService,
            )

            outcome = ModerationService(
                self.session
            ).moderate_feed(feed)

        except Exception:
            logger.exception(
                "Moderation crashed for feed %s",
                feed.id,
            )

            feed.status = FeedStatus.PENDING_REVIEW.value
            self.session.add(feed)
            self.session.commit()
            self.session.refresh(feed)

            return None

        if outcome.decision == ModerationDecision.SAFE.value:
            feed.status = FeedStatus.PUBLISHED.value

        elif outcome.decision == ModerationDecision.REVIEW.value:
            feed.status = FeedStatus.PENDING_REVIEW.value

        else:
            feed.status = FeedStatus.REJECTED.value

        self.session.add(feed)
        self.session.commit()
        self.session.refresh(feed)

        self._log_moderation_outcome(
            user,
            feed,
            outcome,
        )

        self._notify_author(
            user,
            feed,
            outcome,
        )

        return outcome

    # ─── Media upload helper ────────────────────────────────
    def _handle_media_upload(
        self,
        feed: Feed,
        media_file: UploadFile,
        user_id: UUID,
    ) -> FeedMedia:
        content_type = media_file.content_type or ""

        is_video = content_type.startswith("video/")
        is_image = content_type.startswith("image/")

        if not (is_video or is_image):
            raise HTTPException(
                status_code=400,
                detail="Only image or video files are allowed",
            )

        media_type = "video" if is_video else "image"

        url = self.storage.upload_image(
            media_file,
            folder=f"feeds/{feed.id}/{media_type}s",
            public_id=f"{media_type}_{uuid4()}",
            resource_type="auto",
        )

        try:
            media_file.file.seek(0, 2)
            file_size = media_file.file.tell()
            media_file.file.seek(0)

        except Exception:
            file_size = None

        return self.repo.add_media(
            feed=feed,
            media_url=url,
            media_type=media_type,
            file_size=file_size,
        )

    # ─── Read ───────────────────────────────────────────────
    def get_feed(
        self,
        feed_id: UUID,
        current_user: User,
    ) -> FeedResponse:
        feed = self.repo.get_by_id(feed_id)

        if not feed or feed.deleted_at:
            raise HTTPException(
                status_code=404,
                detail="Feed not found",
            )

        self._ensure_feed_viewable(
            feed,
            current_user,
        )

        return self._build_feed_response(
            feed,
            current_user,
            include_moderation=(
                self._is_moderation_staff(current_user)
                or feed.user_id == current_user.id
            ),
        )

    def list_feeds(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 20,
        user_id: Optional[UUID] = None,
        search: Optional[str] = None,
        hashtag: Optional[str] = None,
    ) -> FeedListResponse:
        status_filter = FeedStatus.PUBLISHED.value

        feeds, total = self.repo.list(
            skip=skip,
            limit=limit,
            user_id=user_id,
            search=search,
            hashtag=hashtag,
            status=status_filter,
        )

        maps = self._prefetch_feed_maps(
            feeds,
            current_user,
            include_moderation=False,
        )

        items = [
            self._build_feed_response_from_maps(
                f,
                current_user,
                include_moderation=False,
                **maps,
            )
            for f in feeds
        ]

        return FeedListResponse(
            items=items,
            total=total,
            page=skip // limit + 1 if limit else 1,
            size=limit,
        )

    # ─── Update ─────────────────────────────────────────────
    def update_feed(
        self,
        feed_id: UUID,
        data: FeedUpdate,
        current_user: User,
    ) -> FeedResponse:
        feed = self.repo.get_by_id(feed_id)

        if not feed or feed.deleted_at:
            raise HTTPException(
                status_code=404,
                detail="Feed not found",
            )

        if (
            feed.user_id != current_user.id
            and not current_user.is_admin
        ):
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions",
            )

        try:
            update_data = data.model_dump(
                exclude_unset=True,
                exclude={"hashtags"},
            )

            if update_data:
                self.repo.update(
                    feed,
                    update_data,
                )

            if data.hashtags is not None:
                self.repo.remove_hashtags(feed)

                if data.hashtags:
                    self.repo.add_hashtags(
                        feed,
                        data.hashtags,
                    )

            re_moderate = any(
                key in update_data
                for key in ("title", "description")
            )

            if re_moderate:
                self._moderate_feed_after_change(
                    feed,
                    current_user,
                )

            self.session.commit()

            feed = self.repo.get_by_id(feed.id)

            return self._build_feed_response(
                feed,
                current_user,
                with_details=True,
                include_moderation=True,
            )

        except HTTPException:
            self.session.rollback()
            raise

        except Exception as e:
            self.session.rollback()
            logger.error(
                "Feed update failed: %s",
                e,
            )
            raise

    # ─── Delete ─────────────────────────────────────────────
    def delete_feed(
        self,
        feed_id: UUID,
        current_user: User,
        hard: bool = False,
    ) -> None:
        feed = self.repo.get_by_id(
            feed_id,
            include_deleted=True,
        )

        if not feed:
            raise HTTPException(
                status_code=404,
                detail="Feed not found",
            )

        is_owner = feed.user_id == current_user.id
        is_admin = (
            current_user.is_admin
            or current_user.is_moderator
        )

        if not is_owner and not is_admin:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions",
            )

        if not is_owner:
            hard = False

        try:
            self.repo.delete(
                feed,
                hard=hard,
            )
            self.session.commit()

        except Exception as e:
            self.session.rollback()
            logger.error(
                "Feed deletion failed: %s",
                e,
            )
            raise

    # ─── Admin moderation listing ───────────────────────────
    def list_feeds_for_admin(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        hashtag: Optional[str] = None,
        status_filter: Optional[str] = None,
        include_deleted: bool = True,
    ) -> FeedListResponse:
        if not self._is_moderation_staff(current_user):
            raise HTTPException(
                status_code=403,
                detail="Admin access required",
            )

        feeds, total = self.repo.list(
            skip=skip,
            limit=limit,
            include_deleted=include_deleted,
            search=search,
            hashtag=hashtag,
            status=status_filter,
        )

        maps = self._prefetch_feed_maps(
            feeds,
            current_user,
            include_moderation=True,
        )

        items = [
            self._build_feed_response_from_maps(
                f,
                current_user,
                include_moderation=True,
                **maps,
            )
            for f in feeds
        ]

        return FeedListResponse(
            items=items,
            total=total,
            page=skip // limit + 1 if limit else 1,
            size=limit,
        )

    # ─── Media ──────────────────────────────────────────────
    def upload_feed_media(
        self,
        feed_id: UUID,
        media_file: UploadFile,
        current_user: User,
    ) -> FeedMediaResponse:
        feed = self.repo.get_by_id(feed_id)

        if not feed or feed.deleted_at:
            raise HTTPException(
                status_code=404,
                detail="Feed not found",
            )

        if (
            feed.user_id != current_user.id
            and not current_user.is_admin
        ):
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions",
            )

        try:
            media = self._handle_media_upload(
                feed,
                media_file,
                current_user.id,
            )

            self.session.commit()
            self.session.refresh(feed)

            self._moderate_feed_after_change(
                feed,
                current_user,
            )

            return FeedMediaResponse.model_validate(
                media
            )

        except HTTPException:
            self.session.rollback()
            raise

        except Exception as e:
            self.session.rollback()
            logger.error(
                "Media upload failed: %s",
                e,
            )
            raise

    def delete_feed_media(
        self,
        media_id: UUID,
        current_user: User,
    ) -> None:
        media = self.session.get(
            FeedMedia,
            media_id,
        )

        if not media:
            raise HTTPException(
                status_code=404,
                detail="Media not found",
            )

        feed = self.repo.get_by_id(
            media.feed_id,
        )

        if not feed or feed.deleted_at:
            raise HTTPException(
                status_code=404,
                detail="Feed not found",
            )

        if (
            feed.user_id != current_user.id
            and not current_user.is_admin
        ):
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions",
            )

        try:
            self.repo.delete_media(media_id)
            self.session.commit()

        except Exception as e:
            self.session.rollback()
            logger.error(
                "Media deletion failed: %s",
                e,
            )
            raise

    # ─── Likes ──────────────────────────────────────────────
    def toggle_like(
        self,
        feed_id: UUID,
        current_user: User,
    ) -> FeedLikeResponse:
        feed = self.repo.get_by_id(feed_id)

        if not feed or feed.deleted_at:
            raise HTTPException(
                status_code=404,
                detail="Feed not found",
            )

        self._ensure_feed_interactable(feed, current_user)

        try:
            liked = self.repo.toggle_like(current_user, feed)
            self.session.commit()

            # ─── Notification hook ───
            if feed.user_id != current_user.id:
                try:
                    display = NotificationService.display_name(current_user)
                    service = NotificationService(self.session)
                    if liked:
                        service.notify_like(
                            recipient_id=feed.user_id,
                            actor_id=current_user.id,
                            actor_display=display,
                            target_type="feed",
                            target_id=feed.id,
                            target_label="post",
                        )
                    else:
                        service.notify_unlike(
                            recipient_id=feed.user_id,
                            actor_id=current_user.id,
                            target_type="feed",
                            target_id=feed.id,
                            target_label="post",
                        )
                except Exception:
                    logger.exception("Like notification failed")

            return FeedLikeResponse(feed_id=feed_id, liked=liked)

        except Exception as e:
            self.session.rollback()
            logger.error("Like toggle failed: %s", e)
            raise

    # ─── Comments ───────────────────────────────────────────
    def create_comment(
        self,
        feed_id: UUID,
        data: FeedCommentCreate,
        current_user: User,
    ) -> FeedCommentResponse:
        feed = self.repo.get_by_id(feed_id)

        if not feed or feed.deleted_at:
            raise HTTPException(
                status_code=404,
                detail="Feed not found",
            )

        self._ensure_feed_interactable(feed, current_user)

        if data.parent_id:
            parent = self.session.get(FeedComment, data.parent_id)

            if not parent or parent.feed_id != feed_id:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid parent comment",
                )

        try:
            comment = self.repo.create_comment(
                current_user,
                feed,
                data.content,
                data.parent_id,
            )

            self.session.commit()
            self.session.refresh(comment)

            # ─── Notification hook ───
            try:
                display = NotificationService.display_name(current_user)
                service = NotificationService(self.session)
                if data.parent_id:
                    parent = self.session.get(FeedComment, data.parent_id)
                    if parent and parent.user_id != current_user.id:
                        service.notify_reply(
                            recipient_id=parent.user_id,
                            actor_id=current_user.id,
                            actor_display=display,
                            target_type="feed",
                            target_id=feed.id,
                            comment_id=comment.id,
                            parent_comment_id=parent.id,
                        )
                else:
                    if feed.user_id != current_user.id:
                        service.notify_comment(
                            recipient_id=feed.user_id,
                            actor_id=current_user.id,
                            actor_display=display,
                            target_type="feed",
                            target_id=feed.id,
                            comment_id=comment.id,
                            target_label="post",
                        )
            except Exception:
                logger.exception("Comment notification failed")

            return FeedCommentResponse.model_validate(comment)

        except Exception as e:
            self.session.rollback()
            logger.error("Comment creation failed: %s", e)
            raise

    # ─── Trending hashtags ──────────────────────────────────
    def get_trending_hashtags(
        self,
        limit: int = 20,
    ) -> List[HashtagResponse]:
        hashtags = self.repo.get_trending_hashtags(
            limit
        )

        return [
            HashtagResponse.model_validate(h)
            for h in hashtags
        ]

    # ─── Thumbnails (media-only profile grid) ───────────────
    def _derive_thumbnail_url(self, media: FeedMedia) -> Optional[str]:
        if not media.media_url:
            return None

        if media.thumbnail_url:
            return media.thumbnail_url

        url = media.media_url

        if media.media_type == "image" and "/image/upload/" in url:
            return url.replace(
                "/image/upload/",
                f"/image/upload/{_CLOUDINARY_IMAGE_TRANSFORM}/",
                1,
            )

        if media.media_type == "video" and "/video/upload/" in url:
            transformed = url.replace(
                "/video/upload/",
                f"/video/upload/{_CLOUDINARY_VIDEO_TRANSFORM}/",
                1,
            )
            filename = transformed.rsplit("/", 1)[-1]
            if "." in filename:
                head, _ = transformed.rsplit(".", 1)
                transformed = f"{head}.jpg"
            return transformed

        return url

    def list_feed_thumbnails(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 20,
        user_id: Optional[UUID] = None,
    ) -> FeedThumbnailListResponse:
        target_user_id = user_id or current_user.id

        rows, total = self.repo.list_feeds_with_first_media(
            skip=skip,
            limit=limit,
            user_id=target_user_id,
            status=FeedStatus.PUBLISHED.value,
        )

        items: List[FeedThumbnailResponse] = []
        for feed, media, media_count in rows:
            thumbnail_url = self._derive_thumbnail_url(media)
            if not thumbnail_url:
                continue

            items.append(
                FeedThumbnailResponse(
                    feed_id=feed.id,
                    title=feed.title,
                    thumbnail_url=thumbnail_url,
                    media_type=media.media_type,
                    media_url=media.media_url,
                    media_count=media_count,
                    created_at=feed.created_at,
                )
            )

        return FeedThumbnailListResponse(
            items=items,
            total=total,
            page=skip // limit + 1 if limit else 1,
            size=limit,
        )

    # ─── Bulk pre-fetch (used by list endpoints) ────────────
    def _prefetch_feed_maps(
        self,
        feeds: List[Feed],
        current_user: User,
        include_moderation: bool,
    ) -> Dict[str, object]:
        """
        Fetch, in a constant number of queries, everything the response
        builder needs for the given page of feeds.

        NOTE: `media` is intentionally NOT fetched here. It is eager-loaded
        by FeedRepository.list() via selectinload, so the response builder
        reads `feed.media` directly. Fetching it again would double the
        query count for the same data.
        """
        feed_ids = [f.id for f in feeds]

        if not feed_ids:
            return {
                "like_counts": {},
                "comment_counts": {},
                "liked_feed_ids": set(),
                "hashtag_map": {},
                "moderation_map": {},
            }

        moderation_map: Dict[UUID, object] = {}
        if include_moderation:
            moderation_map = self.moderation_repo.get_active_for_feeds(feed_ids)

        return {
            "like_counts": self.repo.bulk_like_counts(feed_ids),
            "comment_counts": self.repo.bulk_comment_counts(feed_ids),
            "liked_feed_ids": self.repo.bulk_liked_feed_ids(current_user, feed_ids),
            # media is NOT fetched — feed.media was already loaded by list()
            "hashtag_map": self.repo.bulk_hashtags_by_feed(feed_ids),
            "moderation_map": moderation_map,
        }

    # ─── Response builder (bulk path) ───────────────────────
    def _build_feed_response_from_maps(
        self,
        feed: Feed,
        current_user: User,
        *,
        like_counts: Dict[UUID, int],
        comment_counts: Dict[UUID, int],
        liked_feed_ids: Set[UUID],
        hashtag_map: Dict[UUID, List],
        moderation_map: Dict[UUID, object],
        include_moderation: bool = False,
    ) -> FeedResponse:
        """
        Same output as _build_feed_response(), but takes pre-fetched maps
        instead of firing queries.

        `feed.media` is expected to already be loaded by
        FeedRepository.list() via selectinload — no extra query is made
        for media here.
        """
        likes_count = like_counts.get(feed.id, 0)
        comments_count = comment_counts.get(feed.id, 0)
        is_liked = feed.id in liked_feed_ids

        # `feed.media` is already loaded. Sort by created_at so cover
        # selection is deterministic regardless of relationship order.
        media_items = sorted(
            (feed.media or []),
            key=lambda m: m.created_at,
        )
        media = [
            FeedMediaResponse.model_validate(m)
            for m in media_items
        ]

        hashtags = [
            HashtagResponse.model_validate(h)
            for h in hashtag_map.get(feed.id, [])
        ]

        # Comments are NOT eager-loaded by list(), so we don't render them
        # on the list view — the API consumer only needs comments_count.
        # The detail endpoint (get_feed) loads the full comment tree.
        comments = []

        response = FeedResponse(
            id=feed.id,
            title=feed.title,
            description=feed.description,
            status=feed.status,
            is_public=feed.is_public,
            user_id=feed.user_id,
            is_deleted=feed.deleted_at is not None,
            created_at=feed.created_at,
            updated_at=feed.updated_at,
            likes_count=likes_count,
            comments_count=comments_count,
            is_liked=is_liked,
            media=media,
            hashtags=hashtags,
            comments=comments,
            user=(
                UserResponse.model_validate(feed.user)
                if feed.user
                else None
            ),
        )

        if include_moderation:
            active = moderation_map.get(feed.id)
            if active is not None:
                text = active.text_result or {}

                response.moderation = ModerationSummary(
                    record_id=active.id,
                    decision=active.decision,
                    severity=active.combined_severity,
                    confidence=active.combined_confidence,
                    description=text.get("description") or "",
                    reason=text.get("reason") or active.error or "",
                    categories=text.get("categories") or [],
                    provider=active.provider,
                    model=active.model,
                    error=active.error,
                    created_at=active.created_at,
                )

        return response

    # ─── Response builder (single-feed path — unchanged) ───
    def _build_feed_response(
        self,
        feed: Feed,
        current_user: User,
        with_details: bool = True,
        include_moderation: bool = False,
    ) -> FeedResponse:
        likes_count = self.repo.get_like_count(feed)
        comments_count = self.repo.get_comment_count(feed)
        is_liked = self.repo.is_liked_by_user(current_user, feed)

        media = [
            FeedMediaResponse.model_validate(m)
            for m in self.repo.get_media(feed)
        ]

        hashtags = [
            HashtagResponse.model_validate(h)
            for h in self.repo.get_hashtags(feed)
        ]

        comments = [
            FeedCommentResponse.model_validate(c)
            for c in self.repo.get_comments(feed)
        ]

        response = FeedResponse(
            id=feed.id,
            title=feed.title,
            description=feed.description,
            status=feed.status,
            is_public=feed.is_public,
            user_id=feed.user_id,
            is_deleted=feed.deleted_at is not None,
            created_at=feed.created_at,
            updated_at=feed.updated_at,
            likes_count=likes_count,
            comments_count=comments_count,
            is_liked=is_liked,
            media=media,
            hashtags=hashtags,
            comments=comments,
            user=(
                UserResponse.model_validate(feed.user)
                if feed.user
                else None
            ),
        )

        if include_moderation:
            active = self.moderation_repo.get_active_for_feed(feed.id)

            if active is not None:
                text = active.text_result or {}

                response.moderation = ModerationSummary(
                    record_id=active.id,
                    decision=active.decision,
                    severity=active.combined_severity,
                    confidence=active.combined_confidence,
                    description=text.get("description") or "",
                    reason=text.get("reason") or active.error or "",
                    categories=text.get("categories") or [],
                    provider=active.provider,
                    model=active.model,
                    error=active.error,
                    created_at=active.created_at,
                )

        return response