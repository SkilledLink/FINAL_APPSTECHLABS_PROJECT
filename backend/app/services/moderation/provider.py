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