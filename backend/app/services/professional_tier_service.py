# app/services/professional_tier_service.py

import logging
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status as http_status
from sqlmodel import Session

from app.models.professional_tier import (
    ProfessionalTier,
    ProfessionalTierFeature,
)
from app.repositories.professional_tier_repository import (
    ProfessionalTierRepository,
)
from app.schemas.professional_tier import (
    ProfessionalTierCreate,
    ProfessionalTierDetailResponse,
    ProfessionalTierListResponse,
    ProfessionalTierResponse,
    ProfessionalTierUpdate,
    TierFeatureCreate,
    TierFeatureResponse,
    TierFeatureUpdate,
)

logger = logging.getLogger(__name__)


class ProfessionalTierCatalogService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = ProfessionalTierRepository(session)

    # ─── TIER — READ ─────────────────────────────────────────
    def get_tier(self, tier_id: UUID) -> ProfessionalTier:
        tier = self.repo.get_by_id(tier_id)
        if not tier:
            raise HTTPException(404, "Tier not found")
        return tier

    def get_tier_detail(self, tier_id: UUID) -> ProfessionalTierDetailResponse:
        tier = self.get_tier(tier_id)
        return self._to_detail(tier)

    def list_tiers(
        self,
        skip: int = 0,
        limit: int = 50,
        include_inactive: bool = False,
    ) -> ProfessionalTierListResponse:
        items, total = self.repo.list_all(
            skip=skip, limit=limit, include_inactive=include_inactive
        )
        return ProfessionalTierListResponse(
            items=[self._to_detail(t) for t in items],
            total=total,
        )

    def list_public_tiers(self) -> ProfessionalTierListResponse:
        tiers = self.repo.list_public()
        return ProfessionalTierListResponse(
            items=[self._to_detail(t) for t in tiers],
            total=len(tiers),
        )

    # ─── TIER — WRITE (admin) ────────────────────────────────
    def create_tier(self, data: ProfessionalTierCreate) -> ProfessionalTier:
        if self.repo.get_by_name(data.name):
            raise HTTPException(
                http_status.HTTP_409_CONFLICT,
                f"Tier named '{data.name}' already exists",
            )
        if self.repo.get_by_level(data.level):
            raise HTTPException(
                http_status.HTTP_409_CONFLICT,
                f"Tier level {data.level} already exists",
            )
        if data.badge_code and self.repo.get_by_badge_code(data.badge_code):
            raise HTTPException(
                http_status.HTTP_409_CONFLICT,
                f"Badge code '{data.badge_code}' already exists",
            )

        tier = ProfessionalTier(**data.model_dump())
        self.repo.create(tier)
        self.session.commit()
        self.session.refresh(tier)
        return tier

    def update_tier(
        self, tier_id: UUID, data: ProfessionalTierUpdate
    ) -> ProfessionalTier:
        tier = self.get_tier(tier_id)
        updates = data.model_dump(exclude_unset=True)

        if "name" in updates and updates["name"] != tier.name:
            if self.repo.get_by_name(updates["name"]):
                raise HTTPException(
                    http_status.HTTP_409_CONFLICT,
                    f"Tier named '{updates['name']}' already exists",
                )
        if "badge_code" in updates and updates["badge_code"] != tier.badge_code:
            existing = self.repo.get_by_badge_code(updates["badge_code"])
            if existing and existing.id != tier.id:
                raise HTTPException(
                    http_status.HTTP_409_CONFLICT,
                    f"Badge code '{updates['badge_code']}' already exists",
                )

        self.repo.update(tier, **updates)
        self.session.commit()
        self.session.refresh(tier)
        return tier

    def delete_tier(self, tier_id: UUID) -> None:
        tier = self.get_tier(tier_id)
        if self.repo.list_features(tier.id):
            raise HTTPException(
                http_status.HTTP_400_BAD_REQUEST,
                "Remove tier features before deleting the tier",
            )
        self.repo.delete(tier)
        self.session.commit()

    # ─── FEATURE — WRITE (admin) ─────────────────────────────
    def create_feature(
        self, tier_id: UUID, data: TierFeatureCreate
    ) -> ProfessionalTierFeature:
        tier = self.get_tier(tier_id)
        if self.repo.get_feature_by_key(tier.id, data.feature_key):
            raise HTTPException(
                http_status.HTTP_409_CONFLICT,
                f"Feature '{data.feature_key}' already exists on this tier",
            )
        feature = ProfessionalTierFeature(
            tier_id=tier.id, **data.model_dump()
        )
        self.repo.create_feature(feature)
        self.session.commit()
        self.session.refresh(feature)
        return feature

    def update_feature(
        self, feature_id: UUID, data: TierFeatureUpdate
    ) -> ProfessionalTierFeature:
        feature = self.repo.get_feature_by_id(feature_id)
        if not feature:
            raise HTTPException(404, "Tier feature not found")
        self.repo.update_feature(
            feature, **data.model_dump(exclude_unset=True)
        )
        self.session.commit()
        self.session.refresh(feature)
        return feature

    def delete_feature(self, feature_id: UUID) -> None:
        feature = self.repo.get_feature_by_id(feature_id)
        if not feature:
            raise HTTPException(404, "Tier feature not found")
        self.repo.delete_feature(feature)
        self.session.commit()

    # ─── INTERNALS ───────────────────────────────────────────
    def _to_detail(
        self, tier: ProfessionalTier
    ) -> ProfessionalTierDetailResponse:
        features = self.repo.list_features(tier.id, enabled_only=False)
        base = ProfessionalTierResponse.model_validate(tier)
        return ProfessionalTierDetailResponse(
            **base.model_dump(),
            features=[
                TierFeatureResponse.model_validate(f) for f in features
            ],
        )