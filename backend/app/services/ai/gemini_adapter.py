# app/services/ai/gemini_adapter.py
"""Gemini adapter — Google Generative Language REST API.

Handles transient 503s by:
  1. Retrying with exponential backoff (per Google's guidance)
  2. Falling back through a chain of less-loaded models

Supports both text-only generate() and image generate_with_image().
"""

import logging
import random
import time
from typing import List, Optional

import httpx
from fastapi import HTTPException, status as http_status

from app.core.config import settings
from app.services.ai.base import AIProviderConfig, AIResponse

logger = logging.getLogger(__name__)

_RETRYABLE_STATUS = {500, 502, 503, 504}


class GeminiAdapter:
    def __init__(self, config: AIProviderConfig):
        self.config = config

    # ─── PUBLIC ──────────────────────────────────────────────────

    def generate(
        self,
        prompt: str,
        *,
        system: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        json_mode: bool = False,
    ) -> AIResponse:
        parts = [{"text": prompt}]
        return self._call_gemini(
            parts=parts,
            system=system,
            max_tokens=max_tokens,
            temperature=temperature,
            json_mode=json_mode,
        )

    def generate_with_image(
        self,
        prompt: str,
        *,
        image_base64: str,
        image_mime_type: str,
        system: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        json_mode: bool = False,
    ) -> AIResponse:
        parts = [
            {"inlineData": {"mimeType": image_mime_type, "data": image_base64}},
            {"text": prompt},
        ]
        return self._call_gemini(
            parts=parts,
            system=system,
            max_tokens=max_tokens,
            temperature=temperature,
            json_mode=json_mode,
        )

    # ─── INTERNAL ────────────────────────────────────────────────

    def _call_gemini(
        self,
        *,
        parts: list,
        system: Optional[str],
        max_tokens: Optional[int],
        temperature: Optional[float],
        json_mode: bool,
    ) -> AIResponse:
        payload = {
            "contents": [{"role": "user", "parts": parts}],
            "generationConfig": {
                "maxOutputTokens": (
                    max_tokens if max_tokens is not None
                    else self.config.max_tokens
                ),
                "temperature": (
                    temperature if temperature is not None
                    else self.config.temperature
                ),
            },
        }
        if system:
            payload["systemInstruction"] = {"parts": [{"text": system}]}
        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        model_chain = self._model_chain()
        last_status: Optional[int] = None
        last_text: Optional[str] = None
        last_model: Optional[str] = None

        for model_id in model_chain:
            url = (
                f"{self.config.base_url.rstrip('/')}/{model_id}:generateContent"
                f"?key={self.config.api_key}"
            )
            logger.info("[GEMINI] trying model=%s", model_id)

            for attempt in range(1, 4):
                try:
                    with httpx.Client(timeout=self.config.timeout_seconds) as client:
                        response = client.post(url, json=payload, headers=headers)
                except httpx.HTTPError as exc:
                    logger.warning(
                        "[GEMINI] model=%s attempt=%d transport error: %s",
                        model_id, attempt, exc,
                    )
                    if attempt < 3:
                        _backoff(attempt)
                        continue
                    last_status = None
                    last_text = str(exc)
                    last_model = model_id
                    break

                last_status = response.status_code
                last_text = response.text
                last_model = model_id

                logger.info(
                    "[GEMINI] model=%s attempt=%d status=%s body=%s",
                    model_id, attempt, response.status_code, response.text[:400],
                )

                if response.status_code < 400:
                    return self._parse_success(response.json(), model_id)

                if response.status_code in _RETRYABLE_STATUS:
                    if attempt < 3:
                        _backoff(attempt)
                        continue
                    logger.warning(
                        "[GEMINI] model=%s exhausted retries (last=%s); "
                        "falling through to next model",
                        model_id, response.status_code,
                    )
                    break

                raise HTTPException(
                    status_code=http_status.HTTP_502_BAD_GATEWAY,
                    detail=(
                        f"Gemini error {response.status_code} on {model_id}: "
                        f"{response.text[:400]}"
                    ),
                )

        raise HTTPException(
            status_code=http_status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                f"Gemini is temporarily overloaded across all available models. "
                f"Tried: {', '.join(model_chain)}. "
                f"Last status: {last_status} on {last_model}. "
                f"Last body: {(last_text or '')[:300]}"
            ),
        )

    def _model_chain(self) -> List[str]:
        primary = self.config.model
        if not primary.startswith("models/"):
            primary = f"models/{primary}"

        chain = [primary]
        raw = getattr(settings, "AI_TIER_3_MODEL_FALLBACKS", "") or ""
        for m in raw.split(","):
            m = m.strip()
            if not m:
                continue
            if not m.startswith("models/"):
                m = f"models/{m}"
            if m not in chain:
                chain.append(m)
        return chain

    def _parse_success(self, body: dict, model_id: str) -> AIResponse:
        candidates = body.get("candidates") or []
        if not candidates:
            raise HTTPException(
                status_code=http_status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini model {model_id} returned no candidates.",
            )
        parts = candidates[0].get("content", {}).get("parts") or []
        text = "".join(p.get("text", "") for p in parts).strip()
        usage = body.get("usageMetadata") or {}
        return AIResponse(
            text=text,
            provider="gemini",
            model=model_id,
            prompt_tokens=usage.get("promptTokenCount"),
            completion_tokens=usage.get("candidatesTokenCount"),
            raw=body,
        )


def _backoff(attempt: int) -> None:
    base = 2 ** (attempt - 1)
    jitter = random.uniform(0, 0.5 * base)
    sleep_for = base + jitter
    logger.info("[GEMINI] backoff %.2fs", sleep_for)
    time.sleep(sleep_for)