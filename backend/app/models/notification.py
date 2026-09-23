from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import JSON, Index, text
from sqlmodel import Column, Field, SQLModel


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"
    __table_args__ = (
        # Partial unique index: at most one live unread aggregate per
        # (user, type, aggregation_key). Non-aggregated rows leave
        # aggregation_key NULL and are not constrained.
        Index(
            "uq_notification_aggregate",
            "user_id",
            "type",
            "aggregation_key",
            unique=True,
            postgresql_where=text(
                "read_at IS NULL AND aggregation_key IS NOT NULL"
            ),
        ),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: UUID = Field(
        foreign_key="users.id", index=True, nullable=False
    )

    type: str = Field(nullable=False, max_length=50, index=True)
    title: str = Field(nullable=False, max_length=200)
    body: str = Field(nullable=False, max_length=1000)
    payload: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    # NULL for one-shot notifications (messages, comments, verification,
    # payments, admin actions). Set for aggregatable types (likes,
    # follows) and for message idempotency (msg:<message_id>).
    aggregation_key: Optional[str] = Field(
        default=None, max_length=100, nullable=True
    )

    read_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )