# app/repositories/review_repository.py

from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict
from uuid import UUID

from sqlmodel import Session, select, func

from app.models.review import Review


class ReviewRepository:
    def __init__(self, session: Session):
        self.session = session

    # ─── CRUD ──────────────────────────────────────────────

    def create(self, **kwargs) -> Review:
        review = Review(**kwargs)
        self.session.add(review)
        self.session.commit()
        self.session.refresh(review)
        return review

    def get_by_id(self, review_id: UUID) -> Optional[Review]:
        return self.session.get(Review, review_id)

    def get_by_reviewer_and_professional(
        self, reviewer_id: UUID, professional_id: UUID
    ) -> Optional[Review]:
        return self.session.exec(
            select(Review).where(
                Review.reviewer_id == reviewer_id,
                Review.professional_id == professional_id,
            )
        ).first()

    def update(self, review: Review, **kwargs) -> Review:
        for k, v in kwargs.items():
            setattr(review, k, v)
        review.updated_at = datetime.now(timezone.utc)
        self.session.add(review)
        self.session.commit()
        self.session.refresh(review)
        return review

    def delete(self, review: Review) -> None:
        self.session.delete(review)
        self.session.commit()

    # ─── Lists ─────────────────────────────────────────────

    def list_for_professional(
        self, professional_id: UUID, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Review], int]:
        count_stmt = (
            select(func.count())
            .select_from(Review)
            .where(Review.professional_id == professional_id)
        )
        total = self.session.exec(count_stmt).one()

        stmt = (
            select(Review)
            .where(Review.professional_id == professional_id)
            .order_by(Review.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(stmt).all())
        return items, total

    def list_by_reviewer(
        self, reviewer_id: UUID, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Review], int]:
        count_stmt = (
            select(func.count())
            .select_from(Review)
            .where(Review.reviewer_id == reviewer_id)
        )
        total = self.session.exec(count_stmt).one()

        stmt = (
            select(Review)
            .where(Review.reviewer_id == reviewer_id)
            .order_by(Review.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(stmt).all())
        return items, total

    # ─── Stats ─────────────────────────────────────────────

    def compute_stats(self, professional_id: UUID) -> Dict:
        row = self.session.exec(
            select(
                func.count(Review.id),
                func.coalesce(func.avg(Review.rating), 0),
            ).where(Review.professional_id == professional_id)
        ).first()

        total = int(row[0] or 0)
        avg = float(row[1] or 0)

        breakdown_rows = self.session.exec(
            select(Review.rating, func.count())
            .where(Review.professional_id == professional_id)
            .group_by(Review.rating)
        ).all()

        breakdown = {str(i): 0 for i in range(1, 6)}
        for rating, count in breakdown_rows:
            breakdown[str(rating)] = int(count)

        return {
            "average_rating": round(avg, 2),
            "total_reviews": total,
            "breakdown": breakdown,
        }