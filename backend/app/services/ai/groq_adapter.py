# app/services/ai/groq_adapter.py
"""Groq adapter — OpenAI-compatible chat completions endpoint."""

import logging
from typing import Optional

import httpx
from fastapi import HTTPException, status as http_status

from app.services.ai.base import AIProviderConfig, AIResponse

logger = logging.getLogger(__name__)


class GroqAdapter:
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
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        # Groq deprecated `max_tokens` in favour of `max_completion_tokens`.
        payload = {
            "model": self.config.model,
            "messages": messages,
            "max_completion_tokens": (
                max_tokens
                if max_tokens is not None
                else self.config.max_tokens
            ),
            "temperature": (
                temperature
                if temperature is not None
                else self.config.temperature
            ),
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        url = f"{self.config.base_url.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        logger.info("[GROQ] POST %s model=%s", url, self.config.model)
        logger.info("[GROQ] payload=%s", payload)

        try:
            with httpx.Client(timeout=self.config.timeout_seconds) as client:
                response = client.post(url, json=payload, headers=headers)
                logger.info(
                    "[GROQ] status=%s body=%s",
                    response.status_code,
                    response.text[:800],
                )
                if response.status_code >= 400:
                    raise HTTPException(
                        status_code=http_status.HTTP_502_BAD_GATEWAY,
                        detail=f"Groq error {response.status_code}: {response.text[:500]}",
                    )
                body = response.json()
        except httpx.HTTPError as exc:
            logger.error("[GROQ] transport error: %s", exc)
            raise HTTPException(
                status_code=http_status.HTTP_502_BAD_GATEWAY,
                detail=f"Could not reach Groq: {exc}",
            )

        choices = body.get("choices") or []
        if not choices:
            raise HTTPException(
                status_code=http_status.HTTP_502_BAD_GATEWAY,
                detail="Groq returned no choices",
            )

        text = choices[0].get("message", {}).get("content", "").strip()
        usage = body.get("usage") or {}

        return AIResponse(
            text=text,
            provider="groq",
            model=self.config.model,
            prompt_tokens=usage.get("prompt_tokens"),
            completion_tokens=usage.get("completion_tokens"),
            raw=body,
        )