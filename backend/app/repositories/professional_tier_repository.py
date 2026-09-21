from datetime import datetime, timezone
from typing import Optional, Tuple
from uuid import UUID

from sqlmodel import Session, func, select

from app.models.professional_tier import (
    ProfessionalTier,
    ProfessionalTierFeature,
)


class ProfessionalTierRepository:
    def __init__(self, session: Session):
        self.session = session

    # ─── TIER — CREATE ───────────────────────────────────────
    def create(self, tier: ProfessionalTier) -> ProfessionalTier:
        self.session.add(tier)
        self.session.flush()
        return tier

    # ─── TIER — READ ─────────────────────────────────────────
    def get_by_id(self, tier_id: UUID) -> Optional[ProfessionalTier]:
        stmt = select(ProfessionalTier).where(ProfessionalTier.id == tier_id)
        return self.session.exec(stmt).first()

    def get_by_name(self, name: str) -> Optional[ProfessionalTier]:
        stmt = select(ProfessionalTier).where(ProfessionalTier.name == name)
        return self.session.exec(stmt).first()

    def get_by_level(self, level: int) -> Optional[ProfessionalTier]:
        stmt = select(ProfessionalTier).where(ProfessionalTier.level == level)
        return self.session.exec(stmt).first()

    def get_by_badge_code(self, badge_code: str) -> Optional[ProfessionalTier]:
        stmt = select(ProfessionalTier).where(
            ProfessionalTier.badge_code == badge_code
        )
        return self.session.exec(stmt).first()

    def list_by_ids(self, tier_ids: list[UUID]) -> list[ProfessionalTier]:
        """Batch fetch — one query for many tiers. Used when attaching
        badges to a page of search results."""
        if not tier_ids:
            return []
        stmt = select(ProfessionalTier).where(
            ProfessionalTier.id.in_(tier_ids)
        )
        return self.session.exec(stmt).all()

    def list_all(
        self,
        skip: int = 0,
        limit: int = 50,
        include_inactive: bool = False,
    ) -> Tuple[list[ProfessionalTier], int]:
        conditions = []
        if not include_inactive:
            conditions.append(ProfessionalTier.is_active.is_(True))

        count_stmt = select(func.count()).select_from(ProfessionalTier)
        stmt = select(ProfessionalTier)
        if conditions:
            count_stmt = count_stmt.where(*conditions)
            stmt = stmt.where(*conditions)

        total = self.session.exec(count_stmt).first() or 0
        items = self.session.exec(
            stmt.order_by(
                ProfessionalTier.display_order.asc(),
                ProfessionalTier.level.asc(),
            )
            .offset(skip)
            .limit(limit)
        ).all()
        return items, total

    def list_public(self) -> list[ProfessionalTier]:
        """Tiers visible on the pricing/upgrade page."""
        stmt = (
            select(ProfessionalTier)
            .where(ProfessionalTier.is_active.is_(True))
            .where(ProfessionalTier.is_public.is_(True))
            .order_by(
                ProfessionalTier.display_order.asc(),
                ProfessionalTier.level.asc(),
            )
        )
        return self.session.exec(stmt).all()

    # ─── TIER — UPDATE ───────────────────────────────────────
    def update(self, tier: ProfessionalTier, **kwargs) -> ProfessionalTier:
        for key, value in kwargs.items():
            if hasattr(tier, key):
                setattr(tier, key, value)
        tier.updated_at = datetime.now(timezone.utc)
        self.session.add(tier)
        self.session.flush()
        return tier

    # ─── TIER — DELETE ───────────────────────────────────────
    def delete(self, tier: ProfessionalTier) -> None:
        self.session.delete(tier)
        self.session.flush()

    # ─── FEATURE — CREATE ────────────────────────────────────
    def create_feature(
        self, feature: ProfessionalTierFeature
    ) -> ProfessionalTierFeature:
        self.session.add(feature)
        self.session.flush()
        return feature

    # ─── FEATURE — READ ──────────────────────────────────────
    def get_feature_by_id(
        self, feature_id: UUID
    ) -> Optional[ProfessionalTierFeature]:
        return self.session.get(ProfessionalTierFeature, feature_id)

    def get_feature_by_key(
        self, tier_id: UUID, feature_key: str
    ) -> Optional[ProfessionalTierFeature]:
        stmt = select(ProfessionalTierFeature).where(
            ProfessionalTierFeature.tier_id == tier_id,
            ProfessionalTierFeature.feature_key == feature_key,
        )
        return self.session.exec(stmt).first()

    def list_features(
        self, tier_id: UUID, enabled_only: bool = False
    ) -> list[ProfessionalTierFeature]:
        stmt = select(ProfessionalTierFeature).where(
            ProfessionalTierFeature.tier_id == tier_id
        )
        if enabled_only:
            stmt = stmt.where(ProfessionalTierFeature.is_enabled.is_(True))
        return self.session.exec(
            stmt.order_by(ProfessionalTierFeature.feature_key.asc())
        ).all()

    def list_features_for_tiers(
        self, tier_ids: list[UUID], enabled_only: bool = True
    ) -> list[ProfessionalTierFeature]:
        """Batch lookup — avoids N+1 when rendering a tier comparison table."""
        if not tier_ids:
            return []
        stmt = select(ProfessionalTierFeature).where(
            ProfessionalTierFeature.tier_id.in_(tier_ids)
        )
        if enabled_only:
            stmt = stmt.where(ProfessionalTierFeature.is_enabled.is_(True))
        return self.session.exec(stmt).all()

    # ─── FEATURE — UPDATE ────────────────────────────────────
    def update_feature(
        self, feature: ProfessionalTierFeature, **kwargs
    ) -> ProfessionalTierFeature:
        for key, value in kwargs.items():
            if hasattr(feature, key):
                setattr(feature, key, value)
        feature.updated_at = datetime.now(timezone.utc)
        self.session.add(feature)
        self.session.flush()
        return feature

    # ─── FEATURE — DELETE ────────────────────────────────────
    def delete_feature(self, feature: ProfessionalTierFeature) -> None:
        self.session.delete(feature)
        self.session.flush()