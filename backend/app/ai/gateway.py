# app/ai/gateway.py
import logging
import time
from typing import Optional

from app.core.config import settings
from app.ai.providers.base import (
    ChatProvider,
    AITransientError,
    AIPermanentError,
)
from app.ai.providers.groq import GroqProvider
from app.ai.providers.gemini import GeminiProvider

logger = logging.getLogger(__name__)

_PROVIDERS: dict[str, ChatProvider] = {
    "groq": GroqProvider(),
    "gemini": GeminiProvider(),
}
 
_GRACEFUL_FALLBACK = (
    "I'm sorry, I'm unable to respond right now. "
    "Please try again shortly."
)


class AIGateway:
    def __init__(
        self,
        primary: Optional[str] = None,
        fallback: Optional[str] = None,
    ):
        self.primary_name = primary or settings.AI_PRIMARY_PROVIDER
        self.fallback_name = fallback or settings.AI_FALLBACK_PROVIDER

    def _resolve_kwargs(
        self, max_tokens: Optional[int], temperature: Optional[float],
    ) -> tuple[int, float]:
        return (
            max_tokens or settings.GROQ_CHAT_MAX_TOKENS,
            temperature if temperature is not None else settings.GROQ_CHAT_TEMPERATURE,
        )

    def _log_success(
        self, provider: ChatProvider, model: str, ms: int, text: str,
    ) -> None:
        logger.info(
            "ai.gateway provider=%s model=%s ms=%d chars=%d",
            provider.name, model, ms, len(text),
        )

    def _log_failure(self, name: str, ms: int, err: Exception) -> None:
        logger.warning(
            "ai.gateway provider=%s failed class=%s ms=%d err=%s",
            name, type(err).__name__, ms, err,
        )

    def generate_text_sync(
        self,
        prompt: str,
        system_prompt: str,
        *,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        model: Optional[str] = None,
    ) -> str:
        max_tokens, temperature = self._resolve_kwargs(max_tokens, temperature)
        deadline = time.monotonic() + settings.AI_TOTAL_BUDGET_SECONDS

        for name in (self.primary_name, self.fallback_name):
            if time.monotonic() >= deadline:
                logger.warning("ai.gateway budget exhausted before provider=%s", name)
                break

            provider = _PROVIDERS.get(name)
            if provider is None:
                continue

            try:
                started = time.perf_counter()
                text = provider.generate_sync(
                    prompt=prompt,
                    system_prompt=system_prompt,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    model=model,
                )
                self._log_success(
                    provider, model or provider.model,
                    int((time.perf_counter() - started) * 1000), text,
                )
                return text

            except AITransientError as e:
                is_429 = "429" in str(e) or "rate_limited" in str(e)
                if is_429 or not settings.AI_RETRY_TRANSIENT:
                    continue
                if time.monotonic() >= deadline:
                    continue
                time.sleep(settings.AI_RETRY_BACKOFF_SECONDS)
                try:
                    started = time.perf_counter()
                    text = provider.generate_sync(
                        prompt=prompt,
                        system_prompt=system_prompt,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        model=model,
                    )
                    self._log_success(
                        provider, model or provider.model,
                        int((time.perf_counter() - started) * 1000), text,
                    )
                    return text
                except Exception as e2:
                    self._log_failure(name, 0, e2)
                    continue

            except AIPermanentError as e:
                self._log_failure(name, 0, e)
                continue

            except Exception as e:
                self._log_failure(name, 0, e)
                continue

        logger.error("ai.gateway all providers failed")
        return _GRACEFUL_FALLBACK

    async def generate_text(
        self,
        prompt: str,
        system_prompt: str,
        *,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        model: Optional[str] = None,
    ) -> str:
        max_tokens, temperature = self._resolve_kwargs(max_tokens, temperature)
        deadline = time.monotonic() + settings.AI_TOTAL_BUDGET_SECONDS

        for name in (self.primary_name, self.fallback_name):
            if time.monotonic() >= deadline:
                break
            provider = _PROVIDERS.get(name)
            if provider is None:
                continue
            started = time.perf_counter()
            try:
                text = await provider.generate(
                    prompt=prompt,
                    system_prompt=system_prompt,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    model=model,
                )
                self._log_success(
                    provider, model or provider.model,
                    int((time.perf_counter() - started) * 1000), text,
                )
                return text
            except Exception as e:
                self._log_failure(
                    name, int((time.perf_counter() - started) * 1000), e,
                )
                continue

        return _GRACEFUL_FALLBACK