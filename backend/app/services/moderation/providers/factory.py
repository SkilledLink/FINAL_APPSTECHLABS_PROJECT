import logging

from app.core.config import settings
from app.services.moderation.provider import ModerationProvider

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
    primary = (primary or "").lower()
    fallback = (fallback or "").lower()

    for name in (primary, fallback):
        provider = _try_build(name)
        if provider is not None:
            if name != primary:
                logger.warning(
                    "Primary %s moderation provider %r unavailable, "
                    "using fallback %r",
                    modality, primary, name,
                )
            return provider

    raise RuntimeError(
        f"No {modality} moderation provider is configured"
    )


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