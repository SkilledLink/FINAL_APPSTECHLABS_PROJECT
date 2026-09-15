# app/ai/gateway.py
import logging
import time

from app.core.config import settings
from app.ai.providers.base import (
    ChatProvider,
    AIProviderError,
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
    """
    Single entry point for text generation.

    * Primary provider first.
    * One fast retry only if the failure was transient AND not a 429.
    * Then fallback provider.
    * Wall-clock budget enforced across the whole attempt.
    """

    def __init__(
        self,
        primary: str | None = None,
        fallback: str | None = None,
    ):
        self.primary_name = primary or settings.AI_PRIMARY_PROVIDER
        self.fallback_name = fallback or settings.AI_FALLBACK_PROVIDER

    def _resolve_kwargs(
        self, max_tokens: int | None, temperature: float | None
    ) -> tuple[int, float]:
        return (
            max_tokens or settings.GROQ_CHAT_MAX_TOKENS,
            temperature if temperature is not None else settings.GROQ_CHAT_TEMPERATURE,
        )

    def _log_success(self, provider: ChatProvider, ms: int, text: str) -> None:
        logger.info(
            "ai.gateway provider=%s model=%s ms=%d chars=%d",
            provider.name, provider.model, ms, len(text),
        )

    def _log_failure(self, name: str, ms: int, err: Exception) -> None:
        cls = type(err).__name__
        logger.warning(
            "ai.gateway provider=%s failed class=%s ms=%d err=%s",
            name, cls, ms, err,
        )

    def _attempt(
        self,
        provider: ChatProvider,
        prompt: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float,
    ) -> str:
        started = time.perf_counter()
        try:
            text = provider.generate_sync(
                prompt=prompt,
                system_prompt=system_prompt,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            self._log_success(provider, int((time.perf_counter() - started) * 1000), text)
            return text
        except Exception as e:
            self._log_failure(provider.name, int((time.perf_counter() - started) * 1000), e)
            raise

    def generate_text_sync(
        self,
        prompt: str,
        system_prompt: str,
        *,
        max_tokens: int | None = None,
        temperature: float | None = None,
    ) -> str:
        max_tokens, temperature = self._resolve_kwargs(max_tokens, temperature)
        deadline = time.monotonic() + settings.AI_TOTAL_BUDGET_SECONDS

        for name in (self.primary_name, self.fallback_name):
            if time.monotonic() >= deadline:
                logger.warning(
                    "ai.gateway budget exhausted before provider=%s", name
                )
                break

            provider = _PROVIDERS.get(name)
            if provider is None:
                logger.warning("ai.gateway unknown provider=%s", name)
                continue

            try:
                return self._attempt(
                    provider, prompt, system_prompt, max_tokens, temperature
                )
            except AITransientError as e:
                # Transient — one retry, unless it's a 429 (rate limit).
                is_429 = "429" in str(e) or "rate_limited" in str(e)
                if is_429 or not settings.AI_RETRY_TRANSIENT:
                    continue

                if time.monotonic() >= deadline:
                    continue

                time.sleep(settings.AI_RETRY_BACKOFF_SECONDS)
                try:
                    return self._attempt(
                        provider, prompt, system_prompt, max_tokens, temperature
                    )
                except Exception:
                    continue

            except AIPermanentError:
                continue

            except Exception as e:
                # Unknown error class — log and fall through.
                logger.warning("ai.gateway unexpected error provider=%s err=%s", name, e)
                continue

        logger.error("ai.gateway all providers failed or budget exhausted")
        return _GRACEFUL_FALLBACK

    # ── async version, same semantics ────────────────────────
    async def generate_text(
        self,
        prompt: str,
        system_prompt: str,
        *,
        max_tokens: int | None = None,
        temperature: float | None = None,
    ) -> str:
        max_tokens, temperature = self._resolve_kwargs(max_tokens, temperature)
        deadline = time.monotonic() + settings.AI_TOTAL_BUDGET_SECONDS
        last_err: Exception | None = None

        for name in (self.primary_name, self.fallback_name):
            if time.monotonic() >= deadline:
                logger.warning(
                    "ai.gateway budget exhausted before provider=%s", name
                )
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
                )
                self._log_success(
                    provider, int((time.perf_counter() - started) * 1000), text
                )
                return text
            except Exception as e:
                last_err = e
                self._log_failure(
                    name, int((time.perf_counter() - started) * 1000), e
                )
                continue

        logger.error("ai.gateway all providers failed: %s", last_err)
        return _GRACEFUL_FALLBACK