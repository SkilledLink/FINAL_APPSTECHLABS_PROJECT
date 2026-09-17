# app/services/moderation/provider.py
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ProviderResult:
    severity: int
    confidence: int
    description: str
    reason: str
    categories: list[str] = field(default_factory=list)
    raw: Optional[dict] = None
    provider: str = ""
    model: str = ""
    error: Optional[str] = None

    fallback_used: bool = False
    primary_provider: str = ""
    primary_model: str = ""
    primary_error: Optional[str] = None

    @classmethod
    def failure(cls, error: str, provider: str = "", model: str = "") -> "ProviderResult":
        return cls(
            severity=7,
            confidence=0,
            description="Moderation could not be completed",
            reason="Automated check failed",
            categories=[],
            raw=None,
            provider=provider,
            model=model,
            error=error,
        )


class ModerationProvider(ABC):
    """Provider-agnostic contract. Implementations must never raise on
    transient failures — return ProviderResult.failure() instead."""

    name: str = "unknown"

    @abstractmethod
    def moderate_text(self, system_prompt: str, user_text: str) -> ProviderResult: ...

    @abstractmethod
    def moderate_image(
        self, system_prompt: str, image_bytes: bytes, mime_type: str,
    ) -> ProviderResult: ...

    def moderate_multimodal(
        self,
        system_prompt: str,
        user_text: str,
        images: list[tuple[bytes, str]],
    ) -> ProviderResult:
        """
        Default implementation: text-only if no images, else falls back
        to single-image call (ignoring text in that case). Subclasses
        with native multi-image support should override this.

        Gemini overrides. Groq uses this default (its vision model accepts
        one image per call in our current implementation).
        """
        if images:
            img_bytes, mime = images[0]
            return self.moderate_image(system_prompt, img_bytes, mime)
        return self.moderate_text(system_prompt, user_text)