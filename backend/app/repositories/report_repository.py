# app/repositories/report_repository.py
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlmodel import Session, select, func

from app.models.report import (
    Report,
    ReportStatus,
    ReportTargetType,
)


class ReportRepository:
    def __init__(self, session: Session):
        self.session = session

    # ─── CREATE ─────────────────────────────────────────────
    def create(self, report: Report) -> Report:
        self.session.add(report)
        self.session.commit()
        self.session.refresh(report)
        return report

    # ─── READ ───────────────────────────────────────────────
    def get_by_id(self, report_id: UUID) -> Optional[Report]:
        return self.session.get(Report, report_id)

    def list_reports(
        self,
        skip: int = 0,
        limit: int = 20,
        status: Optional[ReportStatus] = None,
        target_type: Optional[ReportTargetType] = None,
        reporter_id: Optional[UUID] = None,
    ) -> tuple[list[Report], int]:
        """Return (items, total) with optional filters."""
        stmt = select(Report).where(Report.deleted_at.is_(None))
        count_stmt = (
            select(func.count())
            .select_from(Report)
            .where(Report.deleted_at.is_(None))
        )

        if status is not None:
            stmt = stmt.where(Report.status == status)
            count_stmt = count_stmt.where(Report.status == status)

        if target_type is not None:
            stmt = stmt.where(Report.target_type == target_type)
            count_stmt = count_stmt.where(Report.target_type == target_type)

        if reporter_id is not None:
            stmt = stmt.where(Report.reporter_id == reporter_id)
            count_stmt = count_stmt.where(Report.reporter_id == reporter_id)

        stmt = stmt.order_by(Report.created_at.desc()).offset(skip).limit(limit)

        items = list(self.session.exec(stmt).all())
        total = self.session.exec(count_stmt).one()
        return items, total

    def get_existing(
        self,
        reporter_id: UUID,
        target_type: ReportTargetType,
        target_id: UUID,
    ) -> Optional[Report]:
        """Check if this user already reported this target (anti-spam)."""
        stmt = select(Report).where(
            Report.reporter_id == reporter_id,
            Report.target_type == target_type,
            Report.target_id == target_id,
            Report.deleted_at.is_(None),
        )
        return self.session.exec(stmt).first()

    # ─── UPDATE ─────────────────────────────────────────────
    def update(self, report: Report, data: dict) -> Report:
        for key, value in data.items():
            setattr(report, key, value)
        report.updated_at = datetime.now(timezone.utc)
        self.session.add(report)
        self.session.commit()
        self.session.refresh(report)
        return report

    # ─── DELETE (soft) ──────────────────────────────────────
    def soft_delete(self, report: Report) -> None:
        report.deleted_at = datetime.now(timezone.utc)
        self.session.add(report)
        self.session.commit()