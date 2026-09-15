import logging

from app.services.moderation.provider import (
    ModerationProvider,
    ProviderResult,
)

logger = logging.getLogger(__name__)


class FallbackModerationProvider(ModerationProvider):
    """Wraps a primary and a fallback provider.

    Each call tries the primary first. If the primary returns a
    ProviderResult with an error (which every provider does instead of
    raising), the fallback is invoked. The fallback result is annotated
    with metadata about the primary failure so callers can persist and
    surface it.
    """

    def __init__(
        self,
        primary: ModerationProvider,
        fallback: ModerationProvider,
    ):
        self.primary = primary
        self.fallback = fallback
        # Advertise the primary name; the actual provider is per-result.
        self.name = primary.name

    # ─── Public API ─────────────────────────────────────────
    def moderate_text(self, system_prompt: str, user_text: str) -> ProviderResult:
        primary_result = self.primary.moderate_text(system_prompt, user_text)
        if not primary_result.error:
            return primary_result
        return self._fallback(
            primary_result,
            lambda: self.fallback.moderate_text(system_prompt, user_text),
            modality="text",
        )

    def moderate_image(
        self, system_prompt: str, image_bytes: bytes, mime_type: str,
    ) -> ProviderResult:
        primary_result = self.primary.moderate_image(
            system_prompt, image_bytes, mime_type
        )
        if not primary_result.error:
            return primary_result
        return self._fallback(
            primary_result,
            lambda: self.fallback.moderate_image(
                system_prompt, image_bytes, mime_type
            ),
            modality="image",
        )

    # ─── Internals ──────────────────────────────────────────
    def _fallback(
        self,
        primary_result: ProviderResult,
        call_fallback,
        modality: str,
    ) -> ProviderResult:
        logger.warning(
            "Primary %s provider %r failed (%s); falling back to %r",
            modality,
            primary_result.provider or self.primary.name,
            primary_result.error,
            self.fallback.name,
        )

        try:
            fallback_result = call_fallback()
        except Exception as e:
            # Providers are contractually not supposed to raise, but
            # guard anyway so a buggy provider cannot break the pipeline.
            logger.exception("Fallback %s provider raised unexpectedly", modality)
            fallback_result = ProviderResult.failure(
                f"fallback_exception: {e}",
                provider=self.fallback.name,
            )

        if not fallback_result.error:
            # Fallback succeeded — annotate with primary failure info.
            fallback_result.fallback_used = True
            fallback_result.primary_provider = (
                primary_result.provider or self.primary.name
            )
            fallback_result.primary_model = primary_result.model
            fallback_result.primary_error = primary_result.error
            return fallback_result

        # Both failed. Return the fallback failure but keep both errors.
        logger.error(
            "Fallback %s provider %r also failed (%s)",
            modality,
            self.fallback.name,
            fallback_result.error,
        )
        fallback_result.fallback_used = True
        fallback_result.primary_provider = (
            primary_result.provider or self.primary.name
        )
        fallback_result.primary_model = primary_result.model
        fallback_result.primary_error = primary_result.error
        fallback_result.error = (
            f"primary={primary_result.error}; fallback={fallback_result.error}"
        )
        return fallback_result