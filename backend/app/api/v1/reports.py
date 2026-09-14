# app/api/v1/reports.py

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.dependencies.auth import get_current_user
from app.database.session import get_session
from app.models.report import ReportStatus, ReportTargetType
from app.models.user import User
from app.schemas.report import ReportCreate, ReportRead, ReportReview
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


# ─────────────────────────────────────────────────────────────
# DEPENDENCY
# ─────────────────────────────────────────────────────────────
def get_report_service(session: Session = Depends(get_session)) -> ReportService:
    return ReportService(session)


# ─────────────────────────────────────────────────────────────
# CREATE — any authenticated user
# ─────────────────────────────────────────────────────────────
@router.post(
    "",
    response_model=ReportRead,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a report against a user, professional, job, or feed",
)
def create_report(
    payload: ReportCreate,
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
) -> ReportRead:
    return service.create_report(payload, current_user)


# ─────────────────────────────────────────────────────────────
# MY REPORTS — any authenticated user
# NOTE: must be declared BEFORE `/{report_id}` so "me" isn't
# swallowed as a path parameter.
# ─────────────────────────────────────────────────────────────
@router.get(
    "/me",
    summary="List reports I have filed",
)
def list_my_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
) -> dict:
    return service.list_my_reports(current_user, skip=skip, limit=limit)


# ─────────────────────────────────────────────────────────────
# MODERATOR LIST — moderator / admin only
# ─────────────────────────────────────────────────────────────
@router.get(
    "",
    summary="List all reports (moderator / admin only)",
)
def list_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[ReportStatus] = Query(
        default=None,
        alias="status",
        description="Filter by report status",
    ),
    target_type: Optional[ReportTargetType] = Query(
        default=None,
        description="Filter by target type",
    ),
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
) -> dict:
    return service.list_reports(
        current_user,
        skip=skip,
        limit=limit,
        status=status_filter,
        target_type=target_type,
    )


# ─────────────────────────────────────────────────────────────
# GET ONE — reporter, moderator, or admin
# ─────────────────────────────────────────────────────────────
@router.get(
    "/{report_id}",
    response_model=ReportRead,
    summary="Get a single report (reporter, moderator, or admin)",
)
def get_report(
    report_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
) -> ReportRead:
    return service.get_report(report_id, current_user)


# ─────────────────────────────────────────────────────────────
# REVIEW — moderator / admin only
# ─────────────────────────────────────────────────────────────
@router.patch(
    "/{report_id}/review",
    response_model=ReportRead,
    summary="Resolve / dismiss / escalate a report (moderator / admin only)",
)
def review_report(
    report_id: UUID,
    payload: ReportReview,
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
) -> ReportRead:
    return service.review_report(report_id, payload, current_user)


# ─────────────────────────────────────────────────────────────
# WITHDRAW — reporter only, pending reports only
# ─────────────────────────────────────────────────────────────
@router.delete(
    "/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Withdraw your own pending report",
)
def withdraw_report(
    report_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
) -> None:
    service.withdraw_report(report_id, current_user)
    return None