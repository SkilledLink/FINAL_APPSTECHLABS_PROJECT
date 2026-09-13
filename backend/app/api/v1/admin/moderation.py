from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.permissions import require_admin
from app.enums.admin import Capability
from app.models.user import User
from app.schemas.moderation import (
    ModerationFull,
    ModerationQueueItem,
    ModerationQueueResponse,
    ModerationReviewRequest,
    ModerationSummary,
)
from app.services.moderation.moderation_service import ModerationService
from app.repositories.moderation_repository import ModerationRepository

router = APIRouter(
    prefix="/admin/moderation",
    tags=["admin-moderation"],
    dependencies=[Depends(require_admin)],
)


def _summary_from_record(record) -> ModerationSummary:
    text = record.text_result or {}
    return ModerationSummary(
        record_id=record.id,
        decision=record.decision,
        severity=record.combined_severity,
        confidence=record.combined_confidence,
        description=text.get("description") or "",
        reason=text.get("reason") or record.error or "",
        categories=text.get("categories") or [],
        provider=record.provider,
        model=record.model,
        error=record.error,
        created_at=record.created_at,
    )


def _full_from_record(record) -> ModerationFull:
    base = _summary_from_record(record)
    return ModerationFull(
        **base.model_dump(),
        text_result=record.text_result,
        image_results=record.image_results,
    )


@router.get("/queue", response_model=ModerationQueueResponse)
def list_queue(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    severity_min: Optional[int] = Query(None, ge=1, le=10),
    severity_max: Optional[int] = Query(None, ge=1, le=10),
    has_error: Optional[bool] = Query(None),
    session: Session = Depends(get_session),
):
    items, total = ModerationRepository(session).list_queue(
        skip=skip, limit=limit,
        severity_min=severity_min,
        severity_max=severity_max,
        has_error=has_error,
    )
    return ModerationQueueResponse(
        items=[_queue_item(session, r) for r in items],
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
    )


@router.get("/queue/{record_id}", response_model=ModerationFull)
def get_queue_item(record_id: UUID, session: Session = Depends(get_session)):
    record = ModerationRepository(session).get_by_id(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return _full_from_record(record)


@router.post("/queue/{record_id}/approve", response_model=ModerationSummary)
def approve(
    record_id: UUID,
    data: ModerationReviewRequest,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    record = ModerationService(session).review(
        record_id=record_id,
        reviewer=current_user,
        action="approve",
        reason=data.reason,
        request=request,
    )
    return _summary_from_record(record)


@router.post("/queue/{record_id}/reject", response_model=ModerationSummary)
def reject(
    record_id: UUID,
    data: ModerationReviewRequest,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    record = ModerationService(session).review(
        record_id=record_id,
        reviewer=current_user,
        action="reject",
        reason=data.reason,
        request=request,
    )
    return _summary_from_record(record)


@router.get("/records/{record_id}", response_model=ModerationFull)
def get_record(record_id: UUID, session: Session = Depends(get_session)):
    record = ModerationRepository(session).get_by_id(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return _full_from_record(record)


def _queue_item(session: Session, record) -> ModerationQueueItem:
    from app.models.feed import Feed, FeedMedia
    from sqlmodel import select

    feed = session.get(Feed, record.feed_id)
    media_rows = session.exec(
        select(FeedMedia).where(FeedMedia.feed_id == record.feed_id)
    ).all()
    media = [
        {
            "id": str(m.id),
            "media_url": m.media_url,
            "media_type": m.media_type,
        }
        for m in media_rows
    ]
    return ModerationQueueItem(
        record_id=record.id,
        feed_id=record.feed_id,
        feed_title=feed.title if feed else "",
        feed_description=feed.description if feed else "",
        feed_author_id=feed.user_id if feed else record.feed_id,
        feed_media=media,
        summary=_summary_from_record(record),
    )