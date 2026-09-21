# app/services/professional_ai_usage_service.py

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlmodel import Session

from app.enums.professional_tier import TierFeatureType
from app.models.professional_ai_usage import ProfessionalAIUsage
from app.repositories.professional_ai_usage_repository import (
    ProfessionalAIUsageRepository,
)
from app.repositories.professional_tier_repository import (
    ProfessionalTierRepository,
)
from app.repositories.professional_tier_subscription_repository import (
    ProfessionalTierSubscriptionRepository,
)
from app.schemas.professional_ai_usage import AIUsageCheckResponse

logger = logging.getLogger(__name__)

# Sentinel for "no limit". Must fit an int column and stay non-negative.
UNLIMITED_LIMIT = 2_147_483_647


class ProfessionalAIUsageService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = ProfessionalAIUsageRepository(session)
        self.tier_repo = ProfessionalTierRepository(session)
        self.sub_repo = ProfessionalTierSubscriptionRepository(session)

    # ─── CHECK ───────────────────────────────────────────────
    def check(
        self, professional_id: UUID, feature_key: str
    ) -> AIUsageCheckResponse:
        sub = self.sub_repo.get_active_for_professional(professional_id)
        if not sub:
            return self._denied(feature_key, reason="no_active_subscription")

        feature = self.tier_repo.get_feature_by_key(sub.tier_id, feature_key)
        if not feature or not feature.is_enabled:
            return self._denied(feature_key, reason="feature_not_entitled")

        if feature.feature_type == TierFeatureType.BOOLEAN:
            return AIUsageCheckResponse(
                feature_key=feature_key,
                allowed=True,
                usage_count=0,
                usage_limit=UNLIMITED_LIMIT,
                remaining=UNLIMITED_LIMIT,
            )

        value = feature.feature_value or {}
        limit = value.get("limit")
        if limit is None:
            return AIUsageCheckResponse(
                feature_key=feature_key,
                allowed=True,
                usage_count=0,
                usage_limit=UNLIMITED_LIMIT,
                remaining=UNLIMITED_LIMIT,
            )

        period_start, period_end = self._resolve_period(value)
        usage = self.repo.get_for_period(
            professional_id, feature_key, period_start
        )
        count = usage.usage_count if usage else 0
        remaining = max(0, int(limit) - count)

        return AIUsageCheckResponse(
            feature_key=feature_key,
            allowed=remaining > 0,
            usage_count=count,
            usage_limit=int(limit),
            remaining=remaining,
            period_start=period_start,
            period_end=period_end,
        )

    # ─── INCREMENT ───────────────────────────────────────────
    def increment(
        self, professional_id: UUID, feature_key: str, amount: int = 1
    ) -> ProfessionalAIUsage:
        if amount < 1:
            raise HTTPException(400, "amount must be >= 1")

        sub = self.sub_repo.get_active_for_professional(professional_id)
        if not sub:
            raise HTTPException(403, "No active subscription")

        feature = self.tier_repo.get_feature_by_key(sub.tier_id, feature_key)
        if not feature or not feature.is_enabled:
            raise HTTPException(
                403, f"Feature '{feature_key}' is not entitled"
            )

        value = feature.feature_value or {}
        limit_raw = value.get("limit")

        if feature.feature_type == TierFeatureType.BOOLEAN or limit_raw is None:
            limit = UNLIMITED_LIMIT
        else:
            limit = int(limit_raw)

        period_start, period_end = self._resolve_period(value)

        usage = self.repo.get_or_create(
            professional_id=professional_id,
            feature_key=feature_key,
            period_start=period_start,
            period_end=period_end,
            usage_limit=limit,
            subscription_id=sub.id,
        )

        if limit != UNLIMITED_LIMIT:
            if usage.usage_count + amount > limit:
                raise HTTPException(
                    429, "AI usage limit reached for the current period"
                )

        self.repo.increment(usage, amount)
        self.session.commit()
        self.session.refresh(usage)
        return usage

    # ─── READ ────────────────────────────────────────────────
    def list_for_professional(
        self,
        professional_id: UUID,
        period_start: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[ProfessionalAIUsage], int]:
        return self.repo.list_for_professional(
            professional_id,
            period_start=period_start,
            skip=skip,
            limit=limit,
        )

    # ─── INTERNALS ───────────────────────────────────────────
    def _resolve_period(
        self, feature_value: dict
    ) -> tuple[datetime, datetime]:
        period = (feature_value or {}).get("period", "monthly")
        now = datetime.now(timezone.utc)

        if period == "daily":
            start = now.replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            end = start + timedelta(days=1)
        elif period == "weekly":
            start = (now - timedelta(days=now.weekday())).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            end = start + timedelta(days=7)
        else:  # monthly
            start = now.replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )
            if now.month == 12:
                end = start.replace(year=now.year + 1, month=1)
            else:
                end = start.replace(month=now.month + 1)
        return start, end

    def _denied(
        self, feature_key: str, reason: str
    ) -> AIUsageCheckResponse:
        logger.debug(
            "AI access denied for feature=%s reason=%s", feature_key, reason
        )
        return AIUsageCheckResponse(
            feature_key=feature_key,
            allowed=False,
            usage_count=0,
            usage_limit=0,
            remaining=0,
        )