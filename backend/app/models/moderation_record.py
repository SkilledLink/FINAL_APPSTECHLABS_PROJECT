from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import JSON
from sqlmodel import Column, Field, SQLModel


class ModerationRecord(SQLModel, table=True):
    __tablename__ = "moderation_records"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    feed_id: UUID = Field(
        foreign_key="feeds.id", index=True, nullable=False
    )

    decision: str = Field(nullable=False, max_length=20, index=True)
    combined_severity: int = Field(nullable=False, index=True)
    combined_confidence: int = Field(nullable=False)

    text_result: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    image_results: Optional[list] = Field(default=None, sa_column=Column(JSON))

    provider: str = Field(nullable=False, max_length=30)
    model: str = Field(nullable=False, max_length=100)
    error: Optional[str] = Field(default=None, max_length=500)

    # Review state
    reviewed_by_user_id: Optional[UUID] = Field(
        default=None, foreign_key="users.id", index=True
    )
    reviewed_at: Optional[datetime] = Field(default=None)
    review_action: Optional[str] = Field(default=None, max_length=20)
    review_notes: Optional[str] = Field(default=None, max_length=500)

    # Set when a feed is edited and re-moderated; old records remain for audit
    superseded_at: Optional[datetime] = Field(default=None, index=True)

    # Notification tracking
    user_notified_at: Optional[datetime] = Field(default=None)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )