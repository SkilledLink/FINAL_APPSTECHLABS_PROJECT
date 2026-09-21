# app/services/ai/gemini_adapter.py
"""Gemini adapter — Google Generative Language REST API.

Gemini is NOT OpenAI-compatible. This adapter translates the same
`generate()` interface into Gemini's contents/parts format and back.
"""

import logging
from typing import Optional

import httpx

from app.services.ai.base import AIProviderConfig, AIResponse

logger = logging.getLogger(__name__)


class GeminiAdapter:
    def __init__(self, config: AIProviderConfig):
        self.config = config

    def generate(
        self,
        prompt: str,
        *,
        system: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        json_mode: bool = False,
    ) -> AIResponse:
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": prompt}]}
            ],
            "generationConfig": {
                "maxOutputTokens": (
                    max_tokens if max_tokens is not None else self.config.max_tokens
                ),
                "temperature": (
                    temperature if temperature is not None else self.config.temperature
                ),
            },
        }
        if system:
            payload["systemInstruction"] = {"parts": [{"text": system}]}
        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        # Model id may arrive as "models/gemini-3.6-flash" or just
        # "gemini-3.6-flash" — normalise so the path is well-formed.
        model_id = self.config.model
        if not model_id.startswith("models/"):
            model_id = f"models/{model_id}"

        url = (
            f"{self.config.base_url.rstrip('/')}/{model_id}:generateContent"
            f"?key={self.config.api_key}"
        )
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        logger.info("[GEMINI] POST %s", url.split("?")[0])

        with httpx.Client(timeout=self.config.timeout_seconds) as client:
            response = client.post(url, json=payload, headers=headers)
            logger.info(
                "[GEMINI] status=%s body=%s",
                response.status_code,
                response.text[:500],
            )
            response.raise_for_status()
            body = response.json()

        candidates = body.get("candidates") or []
        if not candidates:
            raise RuntimeError("Gemini returned no candidates")

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