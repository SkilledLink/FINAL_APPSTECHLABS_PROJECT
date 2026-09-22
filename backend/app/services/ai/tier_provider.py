# app/services/ai/tier_provider.py
"""Resolves the AI provider + key + model for a professional.

Text features (both tiers)   → Groq   (fast, cheap, high quality)
Vision features (Level 3+)   → Gemini (vision + long context)

Level 2 cannot access vision features — resolve_vision_provider
raises 402 with a clear upgrade hint.
"""

import logging
from uuid import UUID

from fastapi import HTTPException, status as http_status
from sqlmodel import Session

from app.core.config import settings
from app.repositories.professional_tier_repository import (
    ProfessionalTierRepository,
)
from app.repositories.professional_tier_subscription_repository import (
    ProfessionalTierSubscriptionRepository,
)
from app.services.ai.base import AIProviderConfig
from app.services.ai.gemini_adapter import GeminiAdapter
from app.services.ai.groq_adapter import GroqAdapter

logger = logging.getLogger(__name__)


class TierProviderResolver:
    def __init__(self, session: Session):
        self.session = session
        self.sub_repo = ProfessionalTierSubscriptionRepository(session)
        self.tier_repo = ProfessionalTierRepository(session)

    # ─── TEXT FEATURES (both tiers, Groq) ────────────────────────

    def resolve_text_provider(
        self, professional_id: UUID
    ) -> tuple[AIProviderConfig, GroqAdapter, int]:
        """Groq for any tier 2+. Text features run identically on
        Level 2 and Level 3 — tiers differentiate by quota and by
        access to Level 3-exclusive features (vision, deep analysis)."""
        tier_level = self._active_tier_level(professional_id)

        if tier_level < 2:
            raise HTTPException(
                status_code=http_status.HTTP_402_PAYMENT_REQUIRED,
                detail=(
                    "AI features require an active AI Professional "
                    "subscription (Level 2 or higher)."
                ),
            )

        config = AIProviderConfig(
            provider=settings.AI_TIER_2_PROVIDER,
            api_key=settings.AI_TIER_2_API_KEY,
            model=settings.AI_TIER_2_MODEL,
            base_url=settings.AI_TIER_2_BASE_URL,
            max_tokens=settings.AI_TIER_2_MAX_TOKENS,
            temperature=settings.AI_TIER_2_TEMPERATURE,
            timeout_seconds=settings.AI_TIER_2_TIMEOUT_SECONDS,
        )
        return config, GroqAdapter(config), tier_level

    # ─── VISION FEATURES (Level 3+, Gemini) ──────────────────────

    def resolve_vision_provider(
        self, professional_id: UUID
    ) -> tuple[AIProviderConfig, GeminiAdapter, int]:
        """Gemini for Level 3+. Vision + long-context analysis.
        Level 2 gets a 402 with upgrade hint."""
        tier_level = self._active_tier_level(professional_id)

        if tier_level < 3:
            raise HTTPException(
                status_code=http_status.HTTP_402_PAYMENT_REQUIRED,
                detail=(
                    "Image analysis and deep portfolio analysis require "
                    "Level 3 (AI Professional Plus). Upgrade to unlock "
                    "Gemini-powered vision features."
                ),
            )

        config = AIProviderConfig(
            provider=settings.AI_TIER_3_PROVIDER,
            api_key=settings.AI_TIER_3_API_KEY,
            model=settings.AI_TIER_3_VISION_MODEL,
            base_url=settings.AI_TIER_3_BASE_URL,
            max_tokens=settings.AI_TIER_3_MAX_TOKENS,
            temperature=settings.AI_TIER_3_TEMPERATURE,
            timeout_seconds=settings.AI_TIER_3_TIMEOUT_SECONDS,
        )
        return config, GeminiAdapter(config), tier_level

    # ─── INTERNALS ────────────────────────────────────────────────

    def _active_tier_level(self, professional_id: UUID) -> int:
        sub = self.sub_repo.get_active_for_professional(professional_id)
        if not sub:
            raise HTTPException(
                status_code=http_status.HTTP_402_PAYMENT_REQUIRED,
                detail=(
                    "An active AI Professional subscription is required "
                    "to use this feature."
                ),
            )
        tier = self.tier_repo.get_by_id(sub.tier_id)
        if not tier:
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Active subscription points to a missing tier.",
            )
        return tier.level