# app/services/moderation/text_moderator.py
import hashlib
import logging

from app.ai.cache import TTLCache
from app.core.config import settings
from app.services.moderation import prompts
from app.services.moderation.provider import ModerationProvider, ProviderResult

logger = logging.getLogger(__name__)

_text_cache = TTLCache(
    ttl_seconds=settings.MODERATION_TEXT_CACHE_TTL_SECONDS,
    max_size=settings.MODERATION_TEXT_CACHE_MAX_SIZE,
)


def _content_hash(title: str, description: str) -> str:
    h = hashlib.sha256()
    h.update((title or "").strip().encode("utf-8"))
    h.update(b"\x00")
    h.update((description or "").strip().encode("utf-8"))
    return h.hexdigest()


class TextModerator:
    def __init__(self, provider: ModerationProvider):
        self.provider = provider

    def moderate(self, title: str, description: str) -> ProviderResult:
        key = _content_hash(title, description)
        cached = _text_cache.get(key)
        if cached is not None:
            logger.info("text_moderation cache hit")
            return cached

        user_message = prompts.build_text_user_message(title, description)
        try:
            result = self.provider.moderate_text(
                system_prompt=prompts.SYSTEM_PROMPT,
                user_text=user_message,
            )
        except Exception as e:
            logger.exception("Text moderation failed unexpectedly")
            return ProviderResult.failure(
                f"text_moderator_exception: {e}",
                provider=self.provider.name,
            )

        if not result.error:
            _text_cache.set(key, result)
        return result