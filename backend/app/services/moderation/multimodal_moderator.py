# app/services/moderation/multimodal_moderator.py
"""
Single-call moderation: text + images in one provider request.

Gemini handles this natively — it can accept text + up to ~16 image parts
in one generate_content call. Groq falls back to text-only via the base
class default.
"""

import logging

from app.services.moderation import prompts
from app.services.moderation.provider import ModerationProvider, ProviderResult

logger = logging.getLogger(__name__)


class MultimodalModerator:
    def __init__(self, provider: ModerationProvider):
        self.provider = provider

    def moderate(
        self,
        title: str,
        description: str,
        images: list[tuple[bytes, str]],
    ) -> ProviderResult:
        """
        images: list of (image_bytes, mime_type). May be empty.
        """
        user_text = prompts.build_text_user_message(title, description)

        try:
            return self.provider.moderate_multimodal(
                system_prompt=prompts.SYSTEM_PROMPT,
                user_text=user_text,
                images=images,
            )
        except Exception as e:
            logger.exception("Multimodal moderation failed unexpectedly")
            return ProviderResult.failure(
                f"multimodal_moderator_exception: {e}",
                provider=self.provider.name,
            )