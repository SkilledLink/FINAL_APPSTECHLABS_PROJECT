from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlmodel import Session, func, select

from app.models.moderation_record import ModerationRecord


class ModerationRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, record: ModerationRecord) -> ModerationRecord:
        self.session.add(record)
        self.session.flush()
        return record

    def get_by_id(self, record_id: UUID) -> Optional[ModerationRecord]:
        return self.session.get(ModerationRecord, record_id)

    def get_active_for_feed(self, feed_id: UUID) -> Optional[ModerationRecord]:
        """Latest non-superseded record for a feed."""
        stmt = (
            select(ModerationRecord)
            .where(
                ModerationRecord.feed_id == feed_id,
                ModerationRecord.superseded_at.is_(None),
            )
            .order_by(ModerationRecord.created_at.desc())
            .limit(1)
        )
        return self.session.exec(stmt).first()

    def supersede_for_feed(self, feed_id: UUID) -> int:
        """Mark all active records for this feed as superseded."""
        now = datetime.now(timezone.utc)
        stmt = select(ModerationRecord).where(
            ModerationRecord.feed_id == feed_id,
            ModerationRecord.superseded_at.is_(None),
        )
        records = self.session.exec(stmt).all()
        for r in records:
            r.superseded_at = now
            self.session.add(r)
        self.session.flush()
        return len(records)

    def list_queue(
        self,
        skip: int = 0,
        limit: int = 20,
        severity_min: Optional[int] = None,
        severity_max: Optional[int] = None,
        has_error: Optional[bool] = None,
    ) -> tuple[list[ModerationRecord], int]:
        conditions = [
            ModerationRecord.decision == "review",
            ModerationRecord.reviewed_at.is_(None),
            ModerationRecord.superseded_at.is_(None),
        ]
        if severity_min is not None:
            conditions.append(ModerationRecord.combined_severity >= severity_min)
        if severity_max is not None:
            conditions.append(ModerationRecord.combined_severity <= severity_max)
        if has_error is True:
            conditions.append(ModerationRecord.error.is_not(None))
        elif has_error is False:
            conditions.append(ModerationRecord.error.is_(None))

        total = self.session.exec(
            select(func.count())
            .select_from(ModerationRecord)
            .where(*conditions)
        ).first() or 0

        items = self.session.exec(
            select(ModerationRecord)
            .where(*conditions)
            .order_by(
                ModerationRecord.combined_severity.desc(),
                ModerationRecord.combined_confidence.asc(),
                ModerationRecord.created_at.asc(),
            )
            .offset(skip)
            .limit(limit)
        ).all()
        return list(items), total

    def list_all(
        self,
        skip: int = 0,
        limit: int = 50,
        decision: Optional[str] = None,
        feed_id: Optional[UUID] = None,
    ) -> tuple[list[ModerationRecord], int]:
        conditions = []
        if decision:
            conditions.append(ModerationRecord.decision == decision)
        if feed_id:
            conditions.append(ModerationRecord.feed_id == feed_id)

        count_stmt = select(func.count()).select_from(ModerationRecord)
        list_stmt = select(ModerationRecord)
        if conditions:
            count_stmt = count_stmt.where(*conditions)
            list_stmt = list_stmt.where(*conditions)

        total = self.session.exec(count_stmt).first() or 0
        items = self.session.exec(
            list_stmt.order_by(ModerationRecord.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return list(items), total