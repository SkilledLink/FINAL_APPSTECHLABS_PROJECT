# app/repositories/professional_ai_usage.py

from datetime import datetime, timezone
from typing import Optional, Tuple
from uuid import UUID

from sqlmodel import Session, func, select

from app.models.professional_ai_usage import ProfessionalAIUsage


class ProfessionalAIUsageRepository:
    def __init__(self, session: Session):
        self.session = session

    # ─── CREATE ──────────────────────────────────────────────
    def create(
        self, usage: ProfessionalAIUsage
    ) -> ProfessionalAIUsage:
        self.session.add(usage)
        self.session.flush()
        return usage

    # ─── READ (single) ───────────────────────────────────────
    def get_by_id(self, usage_id: UUID) -> Optional[ProfessionalAIUsage]:
        return self.session.get(ProfessionalAIUsage, usage_id)

    def get_for_period(
        self,
        professional_id: UUID,
        feature_key: str,
        period_start: datetime,
    ) -> Optional[ProfessionalAIUsage]:
        stmt = select(ProfessionalAIUsage).where(
            ProfessionalAIUsage.professional_id == professional_id,
            ProfessionalAIUsage.feature_key == feature_key,
            ProfessionalAIUsage.period_start == period_start,
        )
        return self.session.exec(stmt).first()

    # ─── READ (list) ─────────────────────────────────────────
    def list_for_professional(
        self,
        professional_id: UUID,
        period_start: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[list[ProfessionalAIUsage], int]:
        conditions = [
            ProfessionalAIUsage.professional_id == professional_id
        ]
        if period_start is not None:
            conditions.append(
                ProfessionalAIUsage.period_start == period_start
            )

        count_stmt = (
            select(func.count())
            .select_from(ProfessionalAIUsage)
            .where(*conditions)
        )
        stmt = (
            select(ProfessionalAIUsage)
            .where(*conditions)
            .order_by(ProfessionalAIUsage.feature_key.asc())
        )
        total = self.session.exec(count_stmt).first() or 0
        items = self.session.exec(stmt.offset(skip).limit(limit)).all()
        return items, total

    # ─── UPSERT (per feature_key + period) ───────────────────
    def get_or_create(
        self,
        professional_id: UUID,
        feature_key: str,
        period_start: datetime,
        period_end: datetime,
        usage_limit: int,
        subscription_id: Optional[UUID] = None,
    ) -> ProfessionalAIUsage:
        """Fetches the current-period row or creates it. The service layer
        is responsible for resolving `usage_limit` from the tier feature
        config before calling this."""
        existing = self.get_for_period(
            professional_id, feature_key, period_start
        )
        if existing:
            # Refresh limit + subscription_id in case the tier changed.
            changed = False
            if existing.usage_limit != usage_limit:
                existing.usage_limit = usage_limit
                changed = True
            if existing.subscription_id != subscription_id:
                existing.subscription_id = subscription_id
                changed = True
            if changed:
                existing.updated_at = datetime.now(timezone.utc)
                self.session.add(existing)
                self.session.flush()
            return existing

        usage = ProfessionalAIUsage(
            professional_id=professional_id,
            subscription_id=subscription_id,
            feature_key=feature_key,
            usage_count=0,
            usage_limit=usage_limit,
            period_start=period_start,
            period_end=period_end,
        )
        self.session.add(usage)
        self.session.flush()
        return usage

    # ─── UPDATE ──────────────────────────────────────────────
    def increment(
        self, usage: ProfessionalAIUsage, amount: int = 1
    ) -> ProfessionalAIUsage:
        usage.usage_count = (usage.usage_count or 0) + amount
        usage.updated_at = datetime.now(timezone.utc)
        self.session.add(usage)
        self.session.flush()
        return usage

    def update_limit(
        self, usage: ProfessionalAIUsage, usage_limit: int
    ) -> ProfessionalAIUsage:
        usage.usage_limit = usage_limit
        usage.updated_at = datetime.now(timezone.utc)
        self.session.add(usage)
        self.session.flush()
        return usage

    def delete(self, usage: ProfessionalAIUsage) -> None:
        self.session.delete(usage)
        self.session.flush()