# app/ai/providers/gemini.py
import asyncio
import logging
import time

from google import genai
from google.genai import types

from app.core.config import settings
from app.ai.providers.base import (
    ChatProvider,
    AITransientError,
    AIPermanentError,
)

logger = logging.getLogger(__name__)

_gemini_client: genai.Client | None = None


def _client() -> genai.Client:
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options={
                "timeout": int(settings.GEMINI_CHAT_TIMEOUT_SECONDS * 1000),
            },
        )
    return _gemini_client


def _classify_gemini_error(e: Exception) -> type:
    s = str(e).lower()
    if any(x in s for x in ("timeout", "deadline", "connection", "unavailable")):
        return AITransientError
    if any(x in s for x in ("429", "resource_exhausted", "quota")):
        return AITransientError
    if any(code in s for code in ("500", "502", "503", "504")):
        return AITransientError
    return AIPermanentError


class GeminiProvider(ChatProvider):
    name = "gemini"
    model = settings.GEMINI_CHAT_MODEL

    # ── Text ────────────────────────────────────────────────
    async def generate(
        self,
        *,
        prompt: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float,
    ) -> str:
        return await asyncio.to_thread(
            self.generate_sync,
            prompt=prompt,
            system_prompt=system_prompt,
            max_tokens=max_tokens,
            temperature=temperature,
        )

    def generate_sync(
        self,
        *,
        prompt: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float,
    ) -> str:
        full = f"{system_prompt}\n\n{prompt}"
        started = time.perf_counter()
        try:
            resp = _client().models.generate_content(
                model=self.model,
                contents=full,
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                ),
            )
        except Exception as e:
            raise _classify_gemini_error(e)(f"gemini_error: {e}") from e

        if not resp or not getattr(resp, "text", None):
            raise AIPermanentError("gemini_empty_response")

        ms = int((time.perf_counter() - started) * 1000)
        usage_meta = getattr(resp, "usage_metadata", None)
        logger.info(
            "ai.provider gemini model=%s ms=%d in_tokens=%s out_tokens=%s total_tokens=%s",
            self.model,
            ms,
            getattr(usage_meta, "prompt_token_count", None) if usage_meta else None,
            getattr(usage_meta, "candidates_token_count", None) if usage_meta else None,
            getattr(usage_meta, "total_token_count", None) if usage_meta else None,
        )
        return resp.text.strip()

    # ── Image ───────────────────────────────────────────────
    def analyze_image_sync(
        self,
        *,
        image_bytes: bytes,
        mime_type: str,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        """
        Multimodal call. Sends system instruction + user text + image
        to Gemini and returns the raw text response.

        Uses a generous output budget because Gemini 3.x consumes
        reasoning tokens before emitting the final JSON.
        """
        if not image_bytes:
            raise AIPermanentError("gemini_image_empty")

        model = getattr(
            settings, "GEMINI_IMAGE_MODEL", settings.GEMINI_CHAT_MODEL
        )

        started = time.perf_counter()
        try:
            resp = _client().models.generate_content(
                model=model,
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                    user_prompt,
                ],
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.2,
                    # ⬆️ Changed from 512 → 2048.
                    # Gemini 3.x consumes reasoning tokens before emitting
                    # the JSON payload, so 512 was truncating the response.
                    max_output_tokens=2048,
                    response_mime_type="application/json",
                ),
            )
        except Exception as e:
            raise _classify_gemini_error(e)(f"gemini_image_error: {e}") from e

        if not resp or not getattr(resp, "text", None):
            raise AIPermanentError("gemini_image_empty_response")

        ms = int((time.perf_counter() - started) * 1000)
        logger.info(
            "ai.provider gemini.vision model=%s ms=%d chars=%d",
            model,
            ms,
            len(resp.text),
        )
        return resp.text.strip()