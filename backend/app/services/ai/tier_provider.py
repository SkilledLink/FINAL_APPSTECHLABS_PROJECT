# app/services/ai/tier_provider.py
"""Resolves the AI provider + key + model for a professional based on
their currently active subscription tier.

Level 2 (AI Professional)   -> Groq
Level 3 (AI Professional+)  -> Gemini

If the professional has no active subscription, raises HTTPException(402).
If they downgrade from Level 3 to Level 2, the next request automatically
routes through Groq -- no key rotation, no manual intervention.
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

    def resolve_for_professional(
        self, professional_id: UUID, *, vision: bool = False
    ) -> tuple[AIProviderConfig, object, int]:
        """Returns (config, adapter, tier_level)."""
        sub = self.sub_repo.get_active_for_professional(professional_id)
        if not sub:
            raise HTTPException(
                status_code=http_status.HTTP_402_PAYMENT_REQUIRED,
                detail=(
                    "An active AI Professional subscription is required to "
                    "use this feature."
                ),
            )

        tier = self.tier_repo.get_by_id(sub.tier_id)
        if not tier:
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Active subscription points to a missing tier.",
            )

        config = self._config_for_level(tier.level, vision=vision)
        adapter = self._adapter_for(config)
        return config, adapter, tier.level

    # ---- INTERNALS --------------------------------------------------

    def _config_for_level(
        self, level: int, *, vision: bool = False
    ) -> AIProviderConfig:
        if level <= 1:
            raise HTTPException(
                status_code=http_status.HTTP_402_PAYMENT_REQUIRED,
                detail="AI features require Level 2 or higher.",
            )

        if level == 2:
            return AIProviderConfig(
                provider=settings.AI_TIER_2_PROVIDER,
                api_key=settings.AI_TIER_2_API_KEY,
                model=settings.AI_TIER_2_MODEL,
                base_url=settings.AI_TIER_2_BASE_URL,
                max_tokens=settings.AI_TIER_2_MAX_TOKENS,
                temperature=settings.AI_TIER_2_TEMPERATURE,
                timeout_seconds=settings.AI_TIER_2_TIMEOUT_SECONDS,
            )

        model = (
            settings.AI_TIER_3_VISION_MODEL
            if vision
            else settings.AI_TIER_3_MODEL
        )
        return AIProviderConfig(
            provider=settings.AI_TIER_3_PROVIDER,
            api_key=settings.AI_TIER_3_API_KEY,
            model=model,
            base_url=settings.AI_TIER_3_BASE_URL,
            max_tokens=settings.AI_TIER_3_MAX_TOKENS,
            temperature=settings.AI_TIER_3_TEMPERATURE,
            timeout_seconds=settings.AI_TIER_3_TIMEOUT_SECONDS,
        )

    def _adapter_for(self, config: AIProviderConfig):
        if config.provider == "groq":
            return GroqAdapter(config)
        if config.provider == "gemini":
            return GeminiAdapter(config)
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unknown AI provider: {config.provider}",
        )