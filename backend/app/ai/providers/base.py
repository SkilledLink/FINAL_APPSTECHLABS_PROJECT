# app/ai/providers/base.py
from typing import Protocol


class AIProviderError(Exception):
    """Base for every provider-level failure."""
    retriable: bool = False
    status_code: int | None = None


class AITransientError(AIProviderError):
    """
    Recoverable: timeouts, connection errors, 5xx, 429.
    Gateway may retry once or fall back.
    """
    retriable = True


class AIPermanentError(AIProviderError):
    """
    Not recoverable within this request: 4xx (auth, bad request),
    empty response, malformed payload.
    Gateway falls back but never retries the same provider.
    """
    retriable = False


class ChatProvider(Protocol):
    """Common interface every text-generation provider must implement."""

    name: str
    model: str

    async def generate(
        self,
        *,
        prompt: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float,
    ) -> str:
        ...

    def generate_sync(
        self,
        *,
        prompt: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float,
    ) -> str:
        ...