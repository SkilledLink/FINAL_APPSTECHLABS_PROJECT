import logging

from app.services.moderation import prompts
from app.services.moderation.image_fetcher import (
    CloudinaryImageFetcher,
    ImageFetchError,
)
from app.services.moderation.provider import ModerationProvider, ProviderResult

logger = logging.getLogger(__name__)


class ImageModerator:
    def __init__(
        self,
        provider: ModerationProvider,
        fetcher: CloudinaryImageFetcher | None = None,
    ):
        self.provider = provider
        self.fetcher = fetcher or CloudinaryImageFetcher()

    def moderate(self, image_url: str) -> ProviderResult:
        try:
            image_bytes, mime = self.fetcher.fetch_and_resize(image_url)
        except ImageFetchError as e:
            logger.warning("Image fetch failed for %s: %s", image_url, e)
            return ProviderResult.failure(
                f"image_fetch_failed: {e}",
                provider=self.provider.name,
            )
        except Exception as e:
            logger.exception("Image fetch crashed")
            return ProviderResult.failure(
                f"image_fetch_exception: {e}",
                provider=self.provider.name,
            )

        try:
            return self.provider.moderate_image(
                system_prompt=prompts.SYSTEM_PROMPT,
                image_bytes=image_bytes,
                mime_type=mime,
            )
        except Exception as e:
            logger.exception("Image moderation failed unexpectedly")
            return ProviderResult.failure(
                f"image_moderator_exception: {e}",
                provider=self.provider.name,
            )