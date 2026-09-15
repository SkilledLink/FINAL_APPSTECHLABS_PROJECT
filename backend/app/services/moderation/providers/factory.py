import logging

from app.core.config import settings
from app.services.moderation.provider import ModerationProvider
from app.services.moderation.providers.fallback_provider import (
    FallbackModerationProvider,
)

logger = logging.getLogger(__name__)


def build_text_provider() -> ModerationProvider:
    return _resolve(
        primary=settings.MODERATION_TEXT_PROVIDER,
        fallback=settings.MODERATION_TEXT_FALLBACK_PROVIDER,
        modality="text",
    )


def build_image_provider() -> ModerationProvider:
    return _resolve(
        primary=settings.MODERATION_IMAGE_PROVIDER,
        fallback=settings.MODERATION_IMAGE_FALLBACK_PROVIDER,
        modality="image",
    )


def _resolve(primary: str, fallback: str, modality: str) -> ModerationProvider:
    primary_name = (primary or "").lower()
    fallback_name = (fallback or "").lower()

    primary_provider = _try_build(primary_name)

    # Primary unavailable at build time — use fallback as the sole provider.
    if primary_provider is None:
        fallback_provider = _try_build(fallback_name)
        if fallback_provider is None:
            raise RuntimeError(
                f"No {modality} moderation provider is configured"
            )
        logger.warning(
            "Primary %s moderation provider %r unavailable at build time, "
            "using %r as sole provider",
            modality, primary_name, fallback_name,
        )
        return fallback_provider

    # Primary available — try to build the fallback too and wrap them.
    if fallback_name and fallback_name != primary_name:
        fallback_provider = _try_build(fallback_name)
        if fallback_provider is not None:
            return FallbackModerationProvider(primary_provider, fallback_provider)
        logger.warning(
            "Fallback %s moderation provider %r unavailable; "
            "running without runtime fallback",
            modality, fallback_name,
        )

    return primary_provider


def _try_build(name: str) -> ModerationProvider | None:
    if name == "groq":
        if not settings.GROQ_API_KEY:
            return None
        from app.services.moderation.providers.groq_provider import (
            GroqModerationProvider,
        )
        return GroqModerationProvider()
    if name == "gemini":
        if not settings.GEMINI_API_KEY:
            return None
        from app.services.moderation.providers.gemini_provider import (
            GeminiModerationProvider,
        )
        return GeminiModerationProvider()
    return None