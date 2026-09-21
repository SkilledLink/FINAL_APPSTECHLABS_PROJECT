# app/services/review_service.py

from uuid import UUID

from fastapi import HTTPException
from sqlmodel import Session

from app.models.professional import Professional
from app.models.user import User
from app.repositories.review_repository import ReviewRepository
from app.schemas.review import (
    ReviewCreate,
    ReviewListResponse,
    ReviewStatsResponse,
    ReviewUpdate,
)


class ReviewService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = ReviewRepository(session)

    # ─── Helpers ───────────────────────────────────────────

    def _get_professional_or_404(self, professional_id: UUID) -> Professional:
        prof = self.session.get(Professional, professional_id)
        if not prof or prof.deleted_at is not None:
            raise HTTPException(status_code=404, detail="Professional not found")
        return prof

    def _recompute_professional_rating(self, professional_id: UUID) -> None:
        """Update the denormalised rating + total_reviews on Professional."""
        stats = self.repo.compute_stats(professional_id)
        prof = self.session.get(Professional, professional_id)
        if not prof:
            return
        prof.rating = stats["average_rating"]
        prof.total_reviews = stats["total_reviews"]
        self.session.add(prof)
        self.session.commit()

    # ─── Create ────────────────────────────────────────────

    def create_review(self, current_user: User, payload: ReviewCreate):
        prof = self._get_professional_or_404(payload.professional_id)

        # Rule: cannot review yourself
        if prof.user_id == current_user.id:
            raise HTTPException(status_code=400, detail="You cannot review yourself")

        # Rule: one review per reviewer per professional
        existing = self.repo.get_by_reviewer_and_professional(
            current_user.id, prof.id
        )
        if existing:
            raise HTTPException(
                status_code=400,
                detail="You already reviewed this professional",
            )

        review = self.repo.create(
            reviewer_id=current_user.id,
            professional_id=prof.id,
            rating=payload.rating,
            title=payload.title,
            comment=payload.comment,
            is_verified_hire=False,
        )
        self._recompute_professional_rating(prof.id)
        return review

    # ─── Read ──────────────────────────────────────────────

    def list_for_professional(
        self, professional_id: UUID, skip: int = 0, limit: int = 20
    ) -> ReviewListResponse:
        self._get_professional_or_404(professional_id)
        items, total = self.repo.list_for_professional(professional_id, skip, limit)
        return ReviewListResponse(items=items, total=total)

    def get_stats(self, professional_id: UUID) -> ReviewStatsResponse:
        self._get_professional_or_404(professional_id)
        return ReviewStatsResponse(**self.repo.compute_stats(professional_id))

    def has_reviewed(
        self, current_user: User, professional_id: UUID
    ) -> bool:
        self._get_professional_or_404(professional_id)
        return (
            self.repo.get_by_reviewer_and_professional(
                current_user.id, professional_id
            )
            is not None
        )

    # ─── Update ────────────────────────────────────────────

    def update_review(
        self, current_user: User, review_id: UUID, payload: ReviewUpdate
    ):
        review = self.repo.get_by_id(review_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        is_author = review.reviewer_id == current_user.id
        is_admin = bool(getattr(current_user, "is_admin", False))
        if not is_author and not is_admin:
            raise HTTPException(
                status_code=403, detail="You cannot edit this review"
            )

        updated = self.repo.update(
            review, **payload.model_dump(exclude_unset=True)
        )
        self._recompute_professional_rating(review.professional_id)
        return updated

    # ─── Delete ────────────────────────────────────────────

    def delete_review(self, current_user: User, review_id: UUID) -> None:
        review = self.repo.get_by_id(review_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        is_author = review.reviewer_id == current_user.id
        is_admin = bool(getattr(current_user, "is_admin", False))
        if not is_author and not is_admin:
            raise HTTPException(
                status_code=403, detail="You cannot delete this review"
            )

        prof_id = review.professional_id
        self.repo.delete(review)
        self._recompute_professional_rating(prof_id)