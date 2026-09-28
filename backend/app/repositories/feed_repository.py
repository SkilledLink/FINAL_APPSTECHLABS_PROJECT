# app/repositories/feed_repository.py

from datetime import datetime, timezone
from typing import Optional, Tuple, List, Dict, Set
from uuid import UUID

from sqlmodel import Session, select, func
from sqlalchemy.orm import selectinload

from app.models.feed import (
    Feed,
    FeedMedia,
    FeedLike,
    FeedComment,
    Hashtag,
    FeedHashtag,
)
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

    def get_by_id(
        self,
        feed_id: UUID,
        include_deleted: bool = False,
    ) -> Optional[Feed]:
        """
        Fetch a single feed with everything needed for the DETAIL view:
        user, media, and the full comment tree (with authors + replies).
        """
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
        """
        List feeds for the FEED LIST view.

        Loads:  user  +  media  +  comments (with authors + replies)
        The list card renders comments inline, so we eager-load them
        here. Counts are still fetched in bulk via bulk_comment_counts()
        to keep aggregate queries cheap.
        """
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

        subq = None
        if hashtag:
            hashtag_lower = hashtag.lower().lstrip("#")
            subq = (
                select(FeedHashtag.feed_id)
                .join(Hashtag, Hashtag.id == FeedHashtag.hashtag_id)
                .where(Hashtag.name == hashtag_lower)
                .subquery()
            )
            stmt = stmt.where(Feed.id.in_(subq))

        # ── Count ──────────────────────────────────────────
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
        if subq is not None:
            count_stmt = count_stmt.where(Feed.id.in_(subq))

        total = self.session.exec(count_stmt).first() or 0

        # ── Page ───────────────────────────────────────────
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

    # ─── BULK (used by list endpoints to avoid N+1) ─────────
    def bulk_like_counts(self, feed_ids: List[UUID]) -> Dict[UUID, int]:
        if not feed_ids:
            return {}
        stmt = (
            select(FeedLike.feed_id, func.count())
            .where(FeedLike.feed_id.in_(feed_ids))
            .group_by(FeedLike.feed_id)
        )
        return {fid: count for fid, count in self.session.exec(stmt).all()}

    def bulk_comment_counts(self, feed_ids: List[UUID]) -> Dict[UUID, int]:
        if not feed_ids:
            return {}
        stmt = (
            select(FeedComment.feed_id, func.count())
            .where(FeedComment.feed_id.in_(feed_ids))
            .group_by(FeedComment.feed_id)
        )
        return {fid: count for fid, count in self.session.exec(stmt).all()}

    def bulk_liked_feed_ids(
        self, user: User, feed_ids: List[UUID]
    ) -> Set[UUID]:
        if not feed_ids:
            return set()
        stmt = select(FeedLike.feed_id).where(
            FeedLike.user_id == user.id,
            FeedLike.feed_id.in_(feed_ids),
        )
        return set(self.session.exec(stmt).all())

    def bulk_media_by_feed(
        self, feed_ids: List[UUID]
    ) -> Dict[UUID, List[FeedMedia]]:
        """
        ⚠️ Usually redundant — list() already eager-loads Feed.media.
        Only call this if you're working with feed IDs you did NOT fetch
        through list(). Prefer feed.media directly to avoid a duplicate query.
        """
        if not feed_ids:
            return {}
        stmt = select(FeedMedia).where(FeedMedia.feed_id.in_(feed_ids))
        result: Dict[UUID, List[FeedMedia]] = {}
        for m in self.session.exec(stmt).all():
            result.setdefault(m.feed_id, []).append(m)
        return result

    def bulk_hashtags_by_feed(
        self, feed_ids: List[UUID]
    ) -> Dict[UUID, List[Hashtag]]:
        if not feed_ids:
            return {}
        stmt = (
            select(FeedHashtag.feed_id, Hashtag)
            .join(Hashtag, Hashtag.id == FeedHashtag.hashtag_id)
            .where(FeedHashtag.feed_id.in_(feed_ids))
        )
        result: Dict[UUID, List[Hashtag]] = {}
        for fid, hashtag in self.session.exec(stmt).all():
            result.setdefault(fid, []).append(hashtag)
        return result

    # ─── Thumbnails (media-only profile grid) ───────────────
    def list_feeds_with_first_media(
        self,
        skip: int,
        limit: int,
        user_id: Optional[UUID],
        status: str,
    ) -> Tuple[List[Tuple[Feed, FeedMedia, int]], int]:
        """
        Return (feed, cover_media, media_count) tuples for feeds that:
          - match the given status
          - are not soft-deleted
          - have at least one media row
          - optionally belong to `user_id`

        Ordered by Feed.created_at DESC. Feeds with zero media are excluded
        by the inner join.

        Uses a constant number of SQL queries regardless of page size.
        """
        base = (
            select(Feed.id)
            .join(FeedMedia, FeedMedia.feed_id == Feed.id)
            .where(Feed.deleted_at.is_(None))
            .where(Feed.status == status)
            .distinct()
        )
        if user_id is not None:
            base = base.where(Feed.user_id == user_id)

        total = self.session.exec(
            select(func.count()).select_from(base.subquery())
        ).one()

        if not total:
            return [], 0

        feed_ids_stmt = (
            select(Feed.id)
            .where(Feed.id.in_(base))
            .order_by(Feed.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        raw_ids = self.session.exec(feed_ids_stmt).all()
        feed_ids: List[UUID] = [
            (r if isinstance(r, UUID) else r[0]) for r in raw_ids
        ]

        if not feed_ids:
            return [], total

        feeds_stmt = select(Feed).where(Feed.id.in_(feed_ids))
        feeds_by_id: Dict[UUID, Feed] = {
            f.id: f for f in self.session.exec(feeds_stmt).all()
        }
        feeds = [feeds_by_id[fid] for fid in feed_ids if fid in feeds_by_id]

        media_stmt = (
            select(FeedMedia)
            .where(FeedMedia.feed_id.in_(feed_ids))
            .order_by(
                FeedMedia.feed_id,
                FeedMedia.created_at.asc(),
            )
        )

        first_media: Dict[UUID, FeedMedia] = {}
        media_counts: Dict[UUID, int] = {}
        for m in self.session.exec(media_stmt).all():
            media_counts[m.feed_id] = media_counts.get(m.feed_id, 0) + 1
            first_media.setdefault(m.feed_id, m)

        rows = [
            (f, first_media[f.id], media_counts.get(f.id, 0))
            for f in feeds
            if f.id in first_media
        ]
        return rows, total