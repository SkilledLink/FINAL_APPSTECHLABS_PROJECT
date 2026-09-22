# app/repositories/webhook_event_repository.py

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from app.models.webhook_event import WebhookEvent


class WebhookEventRepository:
    def __init__(self, session: Session):
        self.session = session

    def try_claim(
        self,
        *,
        provider: str,
        event_id: str,
        event_type: Optional[str],
        status: Optional[str],
        payload: dict,
    ) -> Optional[WebhookEvent]:
        """Returns the new row if this is a first-seen event, else None."""
        row = WebhookEvent(
            provider=provider,
            event_id=event_id,
            event_type=event_type,
            status=status,
            payload=payload,
        )
        self.session.add(row)
        try:
            self.session.flush()
        except IntegrityError:
            self.session.rollback()
            return None
        return row

    def mark_processed(self, row: WebhookEvent) -> None:
        row.processed_at = datetime.now(timezone.utc)
        self.session.add(row)

    def mark_failed(self, row: WebhookEvent, error: str) -> None:
        row.processing_error = error[:1000]
        self.session.add(row)