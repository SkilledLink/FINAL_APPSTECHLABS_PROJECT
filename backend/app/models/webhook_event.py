# app/models/webhook_event.py

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import JSON, Column, UniqueConstraint
from sqlmodel import Field, SQLModel


class WebhookEvent(SQLModel, table=True):
    __tablename__ = "webhook_events"
    __table_args__ = (
        UniqueConstraint(
            "provider", "event_id", name="uq_webhook_provider_event_id"
        ),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    provider: str = Field(max_length=50, nullable=False, index=True)
    event_id: str = Field(max_length=255, nullable=False, index=True)
    event_type: Optional[str] = Field(default=None, max_length=100)
    status: Optional[str] = Field(default=None, max_length=50)

    received_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    processed_at: Optional[datetime] = Field(default=None)

    payload: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    processing_error: Optional[str] = Field(default=None, max_length=1000)