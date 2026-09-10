from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

from app.models.user import User


# ─────────────────────────────────────────────────────────────
# FEED
# ─────────────────────────────────────────────────────────────
class Feed(SQLModel, table=True):
    __tablename__ = "feeds"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)

    title: str = Field(max_length=200, nullable=False)
    description: str = Field(nullable=False)

    status: str = Field(default="published")  # published, draft, archived

    # Visibility
    is_public: bool = Field(default=True)

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deleted_at: Optional[datetime] = Field(default=None)

    # Relationships
    user: "User" = Relationship(back_populates="feeds")
    media: List["FeedMedia"] = Relationship(
        back_populates="feed",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    hashtags: List["FeedHashtag"] = Relationship(
        back_populates="feed",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    likes: List["FeedLike"] = Relationship(
        back_populates="feed",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    comments: List["FeedComment"] = Relationship(
        back_populates="feed",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


# ─────────────────────────────────────────────────────────────
# FEED MEDIA (image OR video)
# ─────────────────────────────────────────────────────────────
class FeedMedia(SQLModel, table=True):
    __tablename__ = "feed_media"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    feed_id: UUID = Field(foreign_key="feeds.id", nullable=False, index=True)

    media_url: str = Field(nullable=False)
    media_type: str = Field(nullable=False)  # "image" or "video"

    # Optional metadata
    thumbnail_url: Optional[str] = Field(default=None)
    width: Optional[int] = Field(default=None)
    height: Optional[int] = Field(default=None)
    duration_seconds: Optional[float] = Field(default=None)  # for videos
    file_size: Optional[int] = Field(default=None)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    feed: "Feed" = Relationship(back_populates="media")


# ─────────────────────────────────────────────────────────────
# HASHTAG
# ─────────────────────────────────────────────────────────────
class Hashtag(SQLModel, table=True):
    __tablename__ = "hashtags"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    name: str = Field(unique=True, index=True, nullable=False, max_length=100)  # stored lowercase, no #
    usage_count: int = Field(default=0)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    feeds: List["FeedHashtag"] = Relationship(back_populates="hashtag")


class FeedHashtag(SQLModel, table=True):
    __tablename__ = "feed_hashtags"

    feed_id: UUID = Field(foreign_key="feeds.id", primary_key=True)
    hashtag_id: UUID = Field(foreign_key="hashtags.id", primary_key=True)

    feed: "Feed" = Relationship(back_populates="hashtags")
    hashtag: "Hashtag" = Relationship(back_populates="feeds")


# ─────────────────────────────────────────────────────────────
# LIKE
# ─────────────────────────────────────────────────────────────
class FeedLike(SQLModel, table=True):
    __tablename__ = "feed_likes"

    user_id: UUID = Field(foreign_key="users.id", primary_key=True)
    feed_id: UUID = Field(foreign_key="feeds.id", primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: "User" = Relationship()
    feed: "Feed" = Relationship(back_populates="likes")


# ─────────────────────────────────────────────────────────────
# COMMENT
# ─────────────────────────────────────────────────────────────
class FeedComment(SQLModel, table=True):
    __tablename__ = "feed_comments"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    feed_id: UUID = Field(foreign_key="feeds.id", nullable=False, index=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    content: str = Field(nullable=False, max_length=1000)
    parent_id: Optional[UUID] = Field(
        default=None,
        foreign_key="feed_comments.id",
        index=True
    )

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    feed: "Feed" = Relationship(back_populates="comments")
    user: "User" = Relationship()
    replies: List["FeedComment"] = Relationship(
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"}
    )