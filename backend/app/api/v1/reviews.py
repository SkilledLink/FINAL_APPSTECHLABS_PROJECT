# app/api/v1/reviews.py

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.current_user import (
    get_current_active_user,
    get_current_user,
)
from app.models.user import User
from app.schemas.review import (
    ReviewCreate,
    ReviewListResponse,
    ReviewResponse,
    ReviewStatsResponse,
    ReviewUpdate,
)
from app.services.review_service import ReviewService

router = APIRouter(tags=["Reviews"])


# ─── CREATE ────────────────────────────────────────────────
@router.post(
    "/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    payload: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    return ReviewService(session).create_review(current_user, payload)


# ─── LIST for a professional ───────────────────────────────
@router.get(
    "/professionals/{professional_id}/reviews",
    response_model=ReviewListResponse,
)
def list_professional_reviews(
    professional_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session),
):
    return ReviewService(session).list_for_professional(
        professional_id, skip, limit
    )


# ─── STATS ─────────────────────────────────────────────────
@router.get(
    "/professionals/{professional_id}/reviews/stats",
    response_model=ReviewStatsResponse,
)
def professional_review_stats(
    professional_id: UUID,
    session: Session = Depends(get_session),
):
    return ReviewService(session).get_stats(professional_id)


# ─── HAS CURRENT USER REVIEWED? ────────────────────────────
@router.get("/professionals/{professional_id}/reviews/me")
def has_reviewed(
    professional_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return {
        "has_reviewed": ReviewService(session).has_reviewed(
            current_user, professional_id
        )
    }


# ─── UPDATE ────────────────────────────────────────────────
@router.patch("/reviews/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: UUID,
    payload: ReviewUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    return ReviewService(session).update_review(
        current_user, review_id, payload
    )


# ─── DELETE ────────────────────────────────────────────────
@router.delete(
    "/reviews/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_review(
    review_id: UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    ReviewService(session).delete_review(current_user, review_id)
    return None