# app/services/report_service.py

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlmodel import Session

from app.models.report import (
    Report,
    ReportAction,
    ReportReason,
    ReportStatus,
    ReportTargetType,
)
from app.models.user import User
from app.repositories.report_repository import ReportRepository
from app.schemas.report import ReportCreate, ReportRead, ReportReview


# Registry of valid report targets → model class.
# We import lazily to avoid circular imports at module load time.
def _get_target_model(target_type: ReportTargetType):
    from app.models.user import User as UserModel
    from app.models.professional import Professional
    from app.models.job import Job
    from app.models.feed import Feed

    return {
        ReportTargetType.USER: UserModel,
        ReportTargetType.PROFESSIONAL: Professional,
        ReportTargetType.JOB: Job,
        ReportTargetType.FEED: Feed,
    }[target_type]


class ReportService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = ReportRepository(session)

    # ─── VALIDATE TARGET EXISTS ─────────────────────────────
    def _validate_target(self, target_type: ReportTargetType, target_id: UUID) -> None:
        model = _get_target_model(target_type)
        target = self.session.get(model, target_id)
        if not target:
            raise HTTPException(
                status_code=404,
                detail=f"{target_type.value.capitalize()} not found",
            )

        # If the target has a soft-delete marker, treat it as gone.
        if getattr(target, "deleted_at", None) is not None:
            raise HTTPException(
                status_code=404,
                detail=f"{target_type.value.capitalize()} not found",
            )

    # ─── CREATE REPORT ──────────────────────────────────────
    def create_report(
        self,
        payload: ReportCreate,
        current_user: User,
    ) -> ReportRead:
        # 1. Can't report yourself.
        if (
            payload.target_type == ReportTargetType.USER
            and payload.target_id == current_user.id
        ):
            raise HTTPException(400, "You cannot report yourself")

        # 2. Target must exist.
        self._validate_target(payload.target_type, payload.target_id)

        # 3. Anti-spam: one report per (reporter, target).
        existing = self.repo.get_existing(
            reporter_id=current_user.id,
            target_type=payload.target_type,
            target_id=payload.target_id,
        )
        if existing:
            raise HTTPException(
                409,
                "You have already reported",
            )

        report = Report(
            reporter_id=current_user.id,
            target_id=payload.target_id,
            target_type=payload.target_type,
            reason=payload.reason,
            description=payload.description,
        )
        report = self.repo.create(report)
        return ReportRead.model_validate(report)

    # ─── LIST (moderator / admin) ───────────────────────────
    def list_reports(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 20,
        status: Optional[ReportStatus] = None,
        target_type: Optional[ReportTargetType] = None,
    ) -> dict:
        self._require_moderator(current_user)

        items, total = self.repo.list_reports(
            skip=skip,
            limit=limit,
            status=status,
            target_type=target_type,
        )
        return {
            "items": [ReportRead.model_validate(r) for r in items],
            "total": total,
            "page": skip // limit + 1 if limit else 1,
            "size": limit,
        }

    # ─── LIST MY REPORTS ────────────────────────────────────
    def list_my_reports(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 20,
    ) -> dict:
        items, total = self.repo.list_reports(
            skip=skip,
            limit=limit,
            reporter_id=current_user.id,
        )
        return {
            "items": [ReportRead.model_validate(r) for r in items],
            "total": total,
            "page": skip // limit + 1 if limit else 1,
            "size": limit,
        }

    # ─── GET ONE ────────────────────────────────────────────
    def get_report(self, report_id: UUID, current_user: User) -> ReportRead:
        report = self.repo.get_by_id(report_id)
        if not report or report.deleted_at is not None:
            raise HTTPException(404, "Report not found")

        # Reporter can see their own; moderators / admins can see any.
        if (
            report.reporter_id != current_user.id
            and not self._is_moderator(current_user)
        ):
            raise HTTPException(403, "Not enough permissions")

        return ReportRead.model_validate(report)

    # ─── REVIEW (moderator / admin) ─────────────────────────
    def review_report(
        self,
        report_id: UUID,
        payload: ReportReview,
        current_user: User,
    ) -> ReportRead:
        self._require_moderator(current_user)

        report = self.repo.get_by_id(report_id)
        if not report or report.deleted_at is not None:
            raise HTTPException(404, "Report not found")

        if payload.status == ReportStatus.PENDING:
            raise HTTPException(
                400,
                "A reviewed report cannot be set back to pending",
            )

        update_data = {
            "status": payload.status,
            "action_taken": payload.action_taken,
            "review_notes": payload.review_notes,
            "reviewed_by": current_user.id,
            "reviewed_at": datetime.now(timezone.utc),
        }
        report = self.repo.update(report, update_data)
        return ReportRead.model_validate(report)

    # ─── CANCEL / WITHDRAW (reporter only) ──────────────────
    def withdraw_report(self, report_id: UUID, current_user: User) -> None:
        report = self.repo.get_by_id(report_id)
        if not report or report.deleted_at is not None:
            raise HTTPException(404, "Report not found")

        if report.reporter_id != current_user.id:
            raise HTTPException(403, "Not enough permissions")

        if report.status != ReportStatus.PENDING:
            raise HTTPException(
                400,
                "Only pending reports can be withdrawn",
            )

        self.repo.soft_delete(report)

    # ─── HELPERS ────────────────────────────────────────────
    @staticmethod
    def _is_moderator(user: User) -> bool:
        return bool(getattr(user, "is_moderator", False) or getattr(user, "is_admin", False))

    def _require_moderator(self, user: User) -> None:
        if not self._is_moderator(user):
            raise HTTPException(403, "Moderator privileges required")