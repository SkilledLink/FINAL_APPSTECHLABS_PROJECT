import logging

from app.services.moderation import prompts
from app.services.moderation.provider import ModerationProvider, ProviderResult

logger = logging.getLogger(__name__)


class TextModerator:
    def __init__(self, provider: ModerationProvider):
        self.provider = provider

    def moderate(self, title: str, description: str) -> ProviderResult:
        user_message = prompts.build_text_user_message(title, description)
        try:
            return self.provider.moderate_text(
                system_prompt=prompts.SYSTEM_PROMPT,
                user_text=user_message,
            )
        except Exception as e:
            logger.exception("Text moderation failed unexpectedly")
            return ProviderResult.failure(
                f"text_moderator_exception: {e}",
                provider=self.provider.name,
            )