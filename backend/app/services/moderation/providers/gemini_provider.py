import json
import logging
import re
from typing import Optional

from google import genai
from google.genai import types

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


class GeminiModerationProvider(ModerationProvider):
    name = "gemini"

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.MODERATION_GEMINI_MODEL
        self._client: Optional[genai.Client] = None

    def _client_or_none(self) -> Optional[genai.Client]:
        if not self.api_key:
            return None
        if self._client is None:
            try:
                self._client = genai.Client(
                    api_key=self.api_key,
                    http_options={"timeout": settings.MODERATION_TIMEOUT_SECONDS * 1000},
                )
            except Exception as e:
                logger.error(f"Gemini client init failed: {e}")
                return None
        return self._client

    # ─── Public API ─────────────────────────────────────────
    def moderate_text(self, system_prompt: str, user_text: str) -> ProviderResult:
        client = self._client_or_none()
        if client is None:
            return ProviderResult.failure("missing_gemini_api_key", self.name, self.model)

        full_prompt = f"{system_prompt}\n\n{user_text}"
        try:
            response = client.models.generate_content(
                model=self.model,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    temperature=0.0,
                    response_mime_type="application/json",
                ),
            )
        except Exception as e:
            return ProviderResult.failure(f"provider_error: {e}", self.name, self.model)

        return self._parse_response(response, raw_text=None)

    def moderate_image(
        self, system_prompt: str, image_bytes: bytes, mime_type: str,
    ) -> ProviderResult:
        client = self._client_or_none()
        if client is None:
            return ProviderResult.failure("missing_gemini_api_key", self.name, self.model)

        try:
            part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            response = client.models.generate_content(
                model=self.model,
                contents=[
                    system_prompt + "\n\nModerate the attached image.",
                    part,
                ],
                config=types.GenerateContentConfig(
                    temperature=0.0,
                    response_mime_type="application/json",
                ),
            )
        except Exception as e:
            return ProviderResult.failure(f"provider_error: {e}", self.name, self.model)

        return self._parse_response(response, raw_text=None)

    # ─── Internals ──────────────────────────────────────────
    def _parse_response(self, response, raw_text: Optional[str]) -> ProviderResult:
        try:
            content = (response.text or "").strip() if hasattr(response, "text") else ""
        except Exception:
            content = ""
        if not content and raw_text:
            content = raw_text

        parsed = _extract_json(content)
        if parsed is None:
            return ProviderResult.failure(
                "malformed_json_from_provider", self.name, self.model
            )

        try:
            severity = int(parsed.get("severity"))
            confidence = int(parsed.get("confidence"))
        except Exception:
            return ProviderResult.failure(
                "invalid_severity_or_confidence", self.name, self.model
            )
        if not (1 <= severity <= 10):
            return ProviderResult.failure("severity_out_of_range", self.name, self.model)
        if not (0 <= confidence <= 100):
            return ProviderResult.failure("confidence_out_of_range", self.name, self.model)

        description = str(parsed.get("description", ""))[:200]
        reason = str(parsed.get("reason", ""))[:200]
        categories = parsed.get("categories") or []
        if not isinstance(categories, list):
            categories = []
        categories = [str(c) for c in categories if isinstance(c, (str, int))]

        return ProviderResult(
            severity=severity,
            confidence=confidence,
            description=description,
            reason=reason,
            categories=categories,
            raw=parsed,
            provider=self.name,
            model=self.model,
        )