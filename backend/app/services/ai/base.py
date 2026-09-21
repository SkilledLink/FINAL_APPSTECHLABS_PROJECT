# app/services/ai/base.py
"""Provider-agnostic AI client contract.

Both Groq (OpenAI-compatible) and Gemini (its own REST format) implement
the same `generate()` interface so feature code never knows which
provider ran.
"""

from dataclasses import dataclass, field
from typing import Optional, Protocol, runtime_checkable


@dataclass
class AIResponse:
    text: str
    provider: str
    model: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    raw: Optional[dict] = None


@dataclass
class AIProviderConfig:
    provider: str          # "groq" | "gemini"
    api_key: str
    model: str
    base_url: str
    max_tokens: int = 350
    temperature: float = 0.4
    timeout_seconds: float = 15.0
    extra: dict = field(default_factory=dict)


@runtime_checkable
class AIProviderClient(Protocol):
    def generate(
        self,
        prompt: str,
        *,
        system: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        json_mode: bool = False,
    ) -> AIResponse: ...