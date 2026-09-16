# app/ai/providers/base.py
from typing import Optional, Protocol


class AIProviderError(Exception):
    retriable: bool = False
    status_code: Optional[int] = None


class AITransientError(AIProviderError):
    retriable = True


class AIPermanentError(AIProviderError):
    retriable = False


class ChatProvider(Protocol):
    name: str
    model: str

    async def generate(
        self,
        *,
        prompt: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float,
        model: Optional[str] = None,
    ) -> str: ...

    def generate_sync(
        self,
        *,
        prompt: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float,
        model: Optional[str] = None,
    ) -> str: ...