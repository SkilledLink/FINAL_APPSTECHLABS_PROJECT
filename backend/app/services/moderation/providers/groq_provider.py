import base64
import json
import logging
import re
import time
from typing import Any, Optional

import httpx

from app.core.config import settings
from app.services.moderation.provider import ModerationProvider, ProviderResult

logger = logging.getLogger(__name__)


_JSON_BLOCK_RE = re.compile(r"\{.*\}", re.DOTALL)


def _extract_json(content: str) -> Optional[dict]:
    if not content:
        return None
    try:
        return json.loads(content)
    except Exception:
        pass
    m = _JSON_BLOCK_RE.search(content)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            return None
    return None


class GroqModerationProvider(ModerationProvider):
    name = "groq"

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.base_url = settings.MODERATION_GROQ_BASE_URL.rstrip("/")
        self.text_model = settings.MODERATION_GROQ_TEXT_MODEL
        self.vision_model = settings.MODERATION_GROQ_VISION_MODEL
        self.timeout = settings.MODERATION_TIMEOUT_SECONDS
        self.max_retries = settings.MODERATION_MAX_RETRIES

    # ─── Public API ─────────────────────────────────────────
    def moderate_text(self, system_prompt: str, user_text: str) -> ProviderResult:
        payload = {
            "model": self.text_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_text},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.0,
        }
        return self._call(payload, model=self.text_model)

    def moderate_image(
        self, system_prompt: str, image_bytes: bytes, mime_type: str,
    ) -> ProviderResult:
        b64 = base64.b64encode(image_bytes).decode("ascii")
        data_url = f"data:{mime_type};base64,{b64}"
        payload = {
            "model": self.vision_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Moderate the attached image."},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                },
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.0,
        }
        return self._call(payload, model=self.vision_model)

    # ─── Internals ──────────────────────────────────────────
    def _call(self, payload: dict, model: str) -> ProviderResult:
        if not self.api_key:
            return ProviderResult.failure("missing_groq_api_key", self.name, model)

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        last_error: Optional[str] = None

        for attempt in range(self.max_retries + 1):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    r = client.post(url, headers=headers, json=payload)
            except httpx.TimeoutException:
                last_error = "provider_timeout"
                self._sleep(attempt)
                continue
            except httpx.HTTPError as e:
                last_error = f"provider_error: {e}"
                self._sleep(attempt)
                continue

            if r.status_code == 429:
                last_error = "provider_rate_limited"
                retry_after = r.headers.get("retry-after")
                wait = min(float(retry_after), 5.0) if retry_after else None
                self._sleep(attempt, override=wait)
                continue

            if 500 <= r.status_code < 600:
                last_error = f"provider_5xx: {r.status_code}"
                self._sleep(attempt)
                continue

            if r.status_code >= 400:
                return ProviderResult.failure(
                    f"provider_4xx: {r.status_code}", self.name, model
                )

            try:
                body = r.json()
                content = body["choices"][0]["message"]["content"]
            except Exception as e:
                return ProviderResult.failure(
                    f"malformed_provider_response: {e}", self.name, model
                )

            parsed = _extract_json(content)
            if parsed is None:
                return ProviderResult.failure(
                    "malformed_json_from_provider", self.name, model
                )

            return self._validate(parsed, model=model, raw=parsed)

        return ProviderResult.failure(last_error or "provider_error", self.name, model)

    def _sleep(self, attempt: int, override: Optional[float] = None) -> None:
        if attempt >= self.max_retries:
            return
        wait = override if override is not None else (1.0 * (3 ** attempt))
        time.sleep(min(wait, 5.0))

    def _validate(
        self, data: dict, model: str, raw: dict,
    ) -> ProviderResult:
        try:
            severity = int(data.get("severity"))
            confidence = int(data.get("confidence"))
        except Exception:
            return ProviderResult.failure(
                "invalid_severity_or_confidence", self.name, model
            )

        if not (1 <= severity <= 10):
            return ProviderResult.failure("severity_out_of_range", self.name, model)
        if not (0 <= confidence <= 100):
            return ProviderResult.failure(
                "confidence_out_of_range", self.name, model
            )

        description = str(data.get("description", ""))[:200]
        reason = str(data.get("reason", ""))[:200]
        categories = data.get("categories") or []
        if not isinstance(categories, list):
            categories = []
        categories = [str(c) for c in categories if isinstance(c, (str, int))]

        return ProviderResult(
            severity=severity,
            confidence=confidence,
            description=description,
            reason=reason,
            categories=categories,
            raw=raw,
            provider=self.name,
            model=model,
        )