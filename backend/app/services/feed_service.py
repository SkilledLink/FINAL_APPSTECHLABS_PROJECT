import logging
from typing import Optional, List
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile
from sqlmodel import Session

from app.models.user import User
from app.models.feed import Feed, FeedMedia, FeedComment
from app.repositories.feed_repository import FeedRepository
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
)
from app.schemas.user import UserResponse
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)


class FeedService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = FeedRepository(session)
        self.storage = StorageService()

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
                    "status": data.status,
                    "is_public": data.is_public,
                },
            )

            if media_file:
                self._handle_media_upload(feed, media_file, user.id)

            if data.hashtags:
                self.repo.add_hashtags(feed, data.hashtags)

            self.session.commit()
            # Refresh feed with eager loading so relationships are available
            feed = self.repo.get_by_id(feed.id)
            return self._build_feed_response(feed, user)

        except HTTPException:
            self.session.rollback()
            raise
        except Exception as e:
            self.session.rollback()
            logger.error(f"Feed creation failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

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
    def get_feed(self, feed_id: UUID, current_user: User) -> FeedResponse:
        feed = self.repo.get_by_id(feed_id)
        if not feed or feed.deleted_at:
            raise HTTPException(status_code=404, detail="Feed not found")
        return self._build_feed_response(feed, current_user)

    def list_feeds(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 20,
        user_id: Optional[UUID] = None,
        search: Optional[str] = None,
        hashtag: Optional[str] = None,
    ) -> FeedListResponse:
        feeds, total = self.repo.list(
            skip=skip,
            limit=limit,
            user_id=user_id,
            search=search,
            hashtag=hashtag,
        )
        # ✅ Always include user + comments in list responses
        items = [
            self._build_feed_response(f, current_user, with_details=True)
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
            raise HTTPException(status_code=404, detail="Feed not found")
        if feed.user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not enough permissions")

        try:
            update_data = data.model_dump(exclude_unset=True, exclude={"hashtags"})
            if update_data:
                self.repo.update(feed, update_data)

            if data.hashtags is not None:
                self.repo.remove_hashtags(feed)
                if data.hashtags:
                    self.repo.add_hashtags(feed, data.hashtags)

            self.session.commit()
            feed = self.repo.get_by_id(feed.id)
            return self._build_feed_response(feed, current_user)

        except Exception as e:
            self.session.rollback()
            logger.error(f"Feed update failed: {e}")
            raise

    # ─── Delete ─────────────────────────────────────────────
    def delete_feed(
        self,
        feed_id: UUID,
        current_user: User,
        hard: bool = False,
    ) -> None:
        feed = self.repo.get_by_id(feed_id, include_deleted=True)
        if not feed:
            raise HTTPException(status_code=404, detail="Feed not found")

        is_owner = feed.user_id == current_user.id
        is_admin = current_user.is_admin or current_user.is_moderator

        if not is_owner and not is_admin:
            raise HTTPException(status_code=403, detail="Not enough permissions")

        if not is_owner:
            hard = False

        try:
            self.repo.delete(feed, hard=hard)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            logger.error(f"Feed deletion failed: {e}")
            raise

    # ─── Admin moderation ───────────────────────────────────
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
        if not (current_user.is_admin or current_user.is_moderator):
            raise HTTPException(status_code=403, detail="Admin access required")

        feeds, total = self.repo.list(
            skip=skip,
            limit=limit,
            include_deleted=include_deleted,
            search=search,
            hashtag=hashtag,
            status=status_filter,
        )

        items = [
            self._build_feed_response(f, current_user, with_details=True)
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
            raise HTTPException(status_code=404, detail="Feed not found")
        if feed.user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not enough permissions")

        try:
            media = self._handle_media_upload(feed, media_file, current_user.id)
            self.session.commit()
            return FeedMediaResponse.model_validate(media)
        except Exception as e:
            self.session.rollback()
            logger.error(f"Media upload failed: {e}")
            raise

    def delete_feed_media(self, media_id: UUID, current_user: User) -> None:
        media = self.session.get(FeedMedia, media_id)
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        feed = self.repo.get_by_id(media.feed_id)
        if not feed or feed.deleted_at:
            raise HTTPException(status_code=404, detail="Feed not found")
        if feed.user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        try:
            self.repo.delete_media(media_id)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            logger.error(f"Media deletion failed: {e}")
            raise

    # ─── Likes ──────────────────────────────────────────────
    def toggle_like(self, feed_id: UUID, current_user: User) -> FeedLikeResponse:
        feed = self.repo.get_by_id(feed_id)
        if not feed or feed.deleted_at:
            raise HTTPException(status_code=404, detail="Feed not found")
        try:
            liked = self.repo.toggle_like(current_user, feed)
            self.session.commit()
            return FeedLikeResponse(feed_id=feed_id, liked=liked)
        except Exception as e:
            self.session.rollback()
            logger.error(f"Like toggle failed: {e}")
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
            raise HTTPException(status_code=404, detail="Feed not found")
        if data.parent_id:
            parent = self.session.get(FeedComment, data.parent_id)
            if not parent or parent.feed_id != feed_id:
                raise HTTPException(status_code=400, detail="Invalid parent comment")
        try:
            comment = self.repo.create_comment(
                current_user, feed, data.content, data.parent_id
            )
            self.session.commit()
            # Refresh to load user relationship
            self.session.refresh(comment)
            return FeedCommentResponse.model_validate(comment)
        except Exception as e:
            self.session.rollback()
            logger.error(f"Comment creation failed: {e}")
            raise

    def delete_comment(self, comment_id: UUID, current_user: User) -> None:
        try:
            deleted = self.repo.delete_comment(
                comment_id,
                current_user,
                current_user.is_admin or current_user.is_moderator,
            )
            if not deleted:
                raise HTTPException(
                    status_code=404,
                    detail="Comment not found or you lack permissions",
                )
            self.session.commit()
        except HTTPException:
            self.session.rollback()
            raise
        except Exception as e:
            self.session.rollback()
            logger.error(f"Comment deletion failed: {e}")
            raise

    # ─── Trending hashtags ──────────────────────────────────
    def get_trending_hashtags(self, limit: int = 20) -> List[HashtagResponse]:
        hashtags = self.repo.get_trending_hashtags(limit)
        return [HashtagResponse.model_validate(h) for h in hashtags]

    # ─── Response builder ───────────────────────────────────
    def _build_feed_response(
        self,
        feed: Feed,
        current_user: User,
        with_details: bool = True,
    ) -> FeedResponse:
        likes_count = self.repo.get_like_count(feed)
        comments_count = self.repo.get_comment_count(feed)
        is_liked = self.repo.is_liked_by_user(current_user, feed)

        # Media
        media = [
            FeedMediaResponse.model_validate(m)
            for m in self.repo.get_media(feed)
        ]

        # Hashtags (proper join, returns Hashtag objects)
        hashtags = [
            HashtagResponse.model_validate(h)
            for h in self.repo.get_hashtags(feed)
        ]

        # Comments — always load so the frontend can display them
        comments = [
            FeedCommentResponse.model_validate(c)
            for c in self.repo.get_comments(feed)
        ]

        # Build response explicitly (avoid model_validate which would
        # try to auto-populate from FeedHashtag association objects)
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
            # ✅ Always include user info
            user=UserResponse.model_validate(feed.user) if feed.user else None,
        )

        return response