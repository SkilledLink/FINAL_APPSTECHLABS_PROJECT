from datetime import datetime, timezone
from typing import Optional, Tuple, List
from uuid import UUID

from sqlmodel import Session, select, func
from sqlalchemy.orm import selectinload

from app.models.feed import Feed, FeedMedia, FeedLike, FeedComment, Hashtag, FeedHashtag
from app.models.user import User



class FeedRepository:
    def __init__(self, session: Session):
        self.session = session

    # ─── Feed ───────────────────────────────────────────────
    def create(self, user: User, data: dict) -> Feed:
        feed = Feed(user_id=user.id, **data)
        self.session.add(feed)
        self.session.flush()
        return feed

    def get_by_id(self, feed_id: UUID, include_deleted: bool = False) -> Optional[Feed]:
        stmt = (
            select(Feed)
            .where(Feed.id == feed_id)
            .options(
                selectinload(Feed.user),
                selectinload(Feed.media),
                selectinload(Feed.comments).selectinload(FeedComment.user),
                selectinload(Feed.comments).selectinload(FeedComment.replies),
            )
        )
        if not include_deleted:
            stmt = stmt.where(Feed.deleted_at.is_(None))
        return self.session.exec(stmt).first()

    def list(
        self,
        skip: int = 0,
        limit: int = 20,
        include_deleted: bool = False,
        user_id: Optional[UUID] = None,
        search: Optional[str] = None,
        hashtag: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Tuple[List[Feed], int]:
        stmt = (
            select(Feed)
            .options(
                selectinload(Feed.user),
                selectinload(Feed.media),
                selectinload(Feed.comments).selectinload(FeedComment.user),
                selectinload(Feed.comments).selectinload(FeedComment.replies),
            )
        )
        if not include_deleted:
            stmt = stmt.where(Feed.deleted_at.is_(None))
        if user_id:
            stmt = stmt.where(Feed.user_id == user_id)
        if status:
            stmt = stmt.where(Feed.status == status)
        if search:
            stmt = stmt.where(
                Feed.title.contains(search) | Feed.description.contains(search)
            )
        if hashtag:
            hashtag_lower = hashtag.lower().lstrip("#")
            subq = (
                select(FeedHashtag.feed_id)
                .join(Hashtag, Hashtag.id == FeedHashtag.hashtag_id)
                .where(Hashtag.name == hashtag_lower)
                .subquery()
            )
            stmt = stmt.where(Feed.id.in_(subq))

        # Count
        count_stmt = select(func.count()).select_from(Feed)
        if not include_deleted:
            count_stmt = count_stmt.where(Feed.deleted_at.is_(None))
        if user_id:
            count_stmt = count_stmt.where(Feed.user_id == user_id)
        if status:
            count_stmt = count_stmt.where(Feed.status == status)
        if search:
            count_stmt = count_stmt.where(
                Feed.title.contains(search) | Feed.description.contains(search)
            )
        if hashtag:
            count_stmt = count_stmt.where(Feed.id.in_(subq))

        total = self.session.exec(count_stmt).first() or 0

        stmt = stmt.offset(skip).limit(limit).order_by(Feed.created_at.desc())
        feeds = self.session.exec(stmt).all()
        return feeds, total

    def update(self, feed: Feed, data: dict) -> Feed:
        for key, value in data.items():
            setattr(feed, key, value)
        feed.updated_at = datetime.now(timezone.utc)
        self.session.add(feed)
        self.session.flush()
        return feed

    def delete(self, feed: Feed, hard: bool = False) -> None:
        if hard:
            self.session.delete(feed)
        else:
            feed.deleted_at = datetime.now(timezone.utc)
            self.session.add(feed)
        self.session.flush()

    # ─── Media ──────────────────────────────────────────────
    def add_media(
        self,
        feed: Feed,
        media_url: str,
        media_type: str,
        thumbnail_url: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
        duration_seconds: Optional[float] = None,
        file_size: Optional[int] = None,
    ) -> FeedMedia:
        media = FeedMedia(
            feed_id=feed.id,
            media_url=media_url,
            media_type=media_type,
            thumbnail_url=thumbnail_url,
            width=width,
            height=height,
            duration_seconds=duration_seconds,
            file_size=file_size,
        )
        self.session.add(media)
        self.session.flush()
        return media

    def get_media(self, feed: Feed) -> List[FeedMedia]:
        stmt = select(FeedMedia).where(FeedMedia.feed_id == feed.id)
        return self.session.exec(stmt).all()

    def delete_media(self, media_id: UUID) -> None:
        media = self.session.get(FeedMedia, media_id)
        if media:
            self.session.delete(media)
            self.session.flush()

    # ─── Hashtags ───────────────────────────────────────────
    def add_hashtags(self, feed: Feed, hashtag_names: List[str]) -> None:
        for name in hashtag_names:
            normalized = name.lower().lstrip("#").strip()
            if not normalized:
                continue

            hashtag = self.session.exec(
                select(Hashtag).where(Hashtag.name == normalized)
            ).first()
            if not hashtag:
                hashtag = Hashtag(name=normalized, usage_count=1)
                self.session.add(hashtag)
                self.session.flush()
            else:
                hashtag.usage_count += 1
                self.session.add(hashtag)

            link = FeedHashtag(feed_id=feed.id, hashtag_id=hashtag.id)
            self.session.add(link)

        self.session.flush()

    def remove_hashtags(self, feed: Feed) -> None:
        stmt = select(FeedHashtag).where(FeedHashtag.feed_id == feed.id)
        links = self.session.exec(stmt).all()
        for link in links:
            hashtag = self.session.get(Hashtag, link.hashtag_id)
            if hashtag and hashtag.usage_count > 0:
                hashtag.usage_count -= 1
                self.session.add(hashtag)
            self.session.delete(link)
        self.session.flush()

    def get_hashtags(self, feed: Feed) -> List[Hashtag]:
        stmt = (
            select(Hashtag)
            .join(FeedHashtag, FeedHashtag.hashtag_id == Hashtag.id)
            .where(FeedHashtag.feed_id == feed.id)
        )
        return self.session.exec(stmt).all()

    def get_trending_hashtags(self, limit: int = 20) -> List[Hashtag]:
        stmt = (
            select(Hashtag)
            .where(Hashtag.usage_count > 0)
            .order_by(Hashtag.usage_count.desc())
            .limit(limit)
        )
        return self.session.exec(stmt).all()

    # ─── Likes ──────────────────────────────────────────────
    def toggle_like(self, user: User, feed: Feed) -> bool:
        existing = self.session.exec(
            select(FeedLike).where(
                FeedLike.user_id == user.id,
                FeedLike.feed_id == feed.id,
            )
        ).first()
        if existing:
            self.session.delete(existing)
            self.session.flush()
            return False
        else:
            like = FeedLike(user_id=user.id, feed_id=feed.id)
            self.session.add(like)
            self.session.flush()
            return True

    def get_like_count(self, feed: Feed) -> int:
        stmt = select(func.count()).where(FeedLike.feed_id == feed.id)
        return self.session.exec(stmt).first() or 0

    def is_liked_by_user(self, user: User, feed: Feed) -> bool:
        stmt = select(FeedLike).where(
            FeedLike.user_id == user.id,
            FeedLike.feed_id == feed.id,
        )
        return self.session.exec(stmt).first() is not None

    # ─── Comments ───────────────────────────────────────────
    def create_comment(
        self,
        user: User,
        feed: Feed,
        content: str,
        parent_id: Optional[UUID] = None,
    ) -> FeedComment:
        comment = FeedComment(
            feed_id=feed.id,
            user_id=user.id,
            content=content,
            parent_id=parent_id,
        )
        self.session.add(comment)
        self.session.flush()
        return comment

    def get_comments(self, feed: Feed) -> List[FeedComment]:
        stmt = (
            select(FeedComment)
            .where(
                FeedComment.feed_id == feed.id,
                FeedComment.parent_id.is_(None),
            )
            .options(
                selectinload(FeedComment.user),
                selectinload(FeedComment.replies),
            )
            .order_by(FeedComment.created_at)
        )
        return self.session.exec(stmt).all()

    def get_comment_count(self, feed: Feed) -> int:
        stmt = select(func.count()).where(FeedComment.feed_id == feed.id)
        return self.session.exec(stmt).first() or 0

    def delete_comment(
        self,
        comment_id: UUID,
        user: User,
        is_admin: bool = False,
    ) -> bool:
        comment = self.session.get(FeedComment, comment_id)
        if not comment:
            return False
        if comment.user_id != user.id and not is_admin:
            return False
        self.session.delete(comment)
        self.session.flush()
        return True