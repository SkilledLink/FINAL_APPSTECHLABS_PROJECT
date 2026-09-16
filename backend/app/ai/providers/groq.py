# app/ai/providers/groq.py
import logging
import time
from typing import Optional

import httpx

from app.core.config import settings
from app.ai.providers.base import (
    ChatProvider,
    AITransientError,
    AIPermanentError,
)

logger = logging.getLogger(__name__)

_async_client: Optional[httpx.AsyncClient] = None


def _client() -> httpx.AsyncClient:
    global _async_client
    if _async_client is None:
        _async_client = httpx.AsyncClient(
            base_url=settings.GROQ_CHAT_BASE_URL,
            timeout=settings.GROQ_CHAT_TIMEOUT_SECONDS,
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
        )
    return _async_client


_sync_client: Optional[httpx.Client] = None


def _sync_client_get() -> httpx.Client:
    global _sync_client
    if _sync_client is None:
        _sync_client = httpx.Client(
            base_url=settings.GROQ_CHAT_BASE_URL,
            timeout=settings.GROQ_CHAT_TIMEOUT_SECONDS,
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
        )
    return _sync_client


def _build_payload(
    model: str, prompt: str, system_prompt: str,
    max_tokens: int, temperature: float,
) -> dict:
    return {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": temperature,
        "stream": False,
    }


def _classify_http_status(status: int) -> type:
    if status == 429 or status >= 500:
        return AITransientError
    return AIPermanentError


def _parse_response(resp: httpx.Response) -> tuple[str, dict]:
    if resp.status_code >= 400:
        raise _classify_http_status(resp.status_code)(
            f"groq_http_{resp.status_code}: {resp.text[:200]}"
        )
    try:
        data = resp.json()
        text = (data["choices"][0]["message"]["content"] or "").strip()
    except (KeyError, IndexError, ValueError) as e:
        raise AIPermanentError(f"groq_malformed_response: {e}") from e

    if not text:
        raise AIPermanentError("groq_empty_response")

    usage = data.get("usage") or {}
    return text, {
        "in_tokens": usage.get("prompt_tokens"),
        "out_tokens": usage.get("completion_tokens"),
        "total_tokens": usage.get("total_tokens"),
    }


def _log_usage(model: str, usage: dict, ms: int) -> None:
    logger.info(
        "ai.provider groq model=%s ms=%d in_tokens=%s out_tokens=%s total_tokens=%s",
        model, ms,
        usage.get("in_tokens"),
        usage.get("out_tokens"),
        usage.get("total_tokens"),
    )


class GroqProvider(ChatProvider):
    name = "groq"
    model = settings.GROQ_CHAT_MODEL

    async def generate(
        self,
        *,
        prompt: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float,
        model: Optional[str] = None,
    ) -> str:
        payload = _build_payload(
            model or self.model, prompt, system_prompt, max_tokens, temperature
        )
        started = time.perf_counter()
        try:
            resp = await _client().post("/chat/completions", json=payload)
        except httpx.TimeoutException as e:
            raise AITransientError(f"groq_timeout: {e}") from e
        except httpx.NetworkError as e:
            raise AITransientError(f"groq_network: {e}") from e

        text, usage = _parse_response(resp)
        _log_usage(payload["model"], usage, int((time.perf_counter() - started) * 1000))
        return text

    def generate_sync(
        self,
        *,
        prompt: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float,
        model: Optional[str] = None,
    ) -> str:
        payload = _build_payload(
            model or self.model, prompt, system_prompt, max_tokens, temperature
        )
        started = time.perf_counter()
        try:
            resp = _sync_client_get().post("/chat/completions", json=payload)
        except httpx.TimeoutException as e:
            raise AITransientError(f"groq_timeout: {e}") from e
        except httpx.NetworkError as e:
            raise AITransientError(f"groq_network: {e}") from e

        text, usage = _parse_response(resp)
        _log_usage(payload["model"], usage, int((time.perf_counter() - started) * 1000))
        return text