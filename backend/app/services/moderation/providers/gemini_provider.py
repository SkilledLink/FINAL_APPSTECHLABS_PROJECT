# app/services/moderation/providers/gemini_provider.py
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


_gemini_client: Optional[genai.Client] = None


def _client() -> Optional[genai.Client]:
    global _gemini_client
    if _gemini_client is None:
        if not settings.GEMINI_API_KEY:
            return None
        try:
            _gemini_client = genai.Client(
                api_key=settings.GEMINI_API_KEY,
                http_options={
                    "timeout": settings.MODERATION_TIMEOUT_SECONDS * 1000,
                },
            )
        except Exception as e:
            logger.error("Gemini moderation client init failed: %s", e)
            return None
    return _gemini_client


class GeminiModerationProvider(ModerationProvider):
    name = "gemini"

    def __init__(self):
        self.model = settings.MODERATION_GEMINI_MODEL
        self.max_images = 4  # cap images per multimodal call

    # ─── Public API ─────────────────────────────────────────
    def moderate_text(self, system_prompt: str, user_text: str) -> ProviderResult:
        client = _client()
        if client is None:
            return ProviderResult.failure(
                "missing_gemini_api_key", self.name, self.model
            )
        try:
            response = client.models.generate_content(
                model=self.model,
                contents=user_text,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.0,
                    max_output_tokens=1024,
                    response_mime_type="application/json",
                ),
            )
        except Exception as e:
            return ProviderResult.failure(
                f"provider_error: {e}", self.name, self.model
            )
        return self._parse_response(response)

    def moderate_image(
        self, system_prompt: str, image_bytes: bytes, mime_type: str,
    ) -> ProviderResult:
        client = _client()
        if client is None:
            return ProviderResult.failure(
                "missing_gemini_api_key", self.name, self.model
            )
        try:
            part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            response = client.models.generate_content(
                model=self.model,
                contents=["Moderate the attached image.", part],
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.0,
                    max_output_tokens=1024,
                    response_mime_type="application/json",
                ),
            )
        except Exception as e:
            return ProviderResult.failure(
                f"provider_error: {e}", self.name, self.model
            )
        return self._parse_response(response)

    def moderate_multimodal(
        self,
        system_prompt: str,
        user_text: str,
        images: list[tuple[bytes, str]],
    ) -> ProviderResult:
        """
        Native Gemini path: text + N images in ONE call.

        Uses Gemini's 1M TPM budget instead of burning multiple RPM slots.
        This is the free-tier win.
        """
        client = _client()
        if client is None:
            return ProviderResult.failure(
                "missing_gemini_api_key", self.name, self.model
            )

        contents: list = [user_text]
        for img_bytes, mime in images[: self.max_images]:
            if not img_bytes:
                continue
            contents.append(types.Part.from_bytes(data=img_bytes, mime_type=mime))

        try:
            response = client.models.generate_content(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.0,
                    max_output_tokens=1024,
                    response_mime_type="application/json",
                ),
            )
        except Exception as e:
            return ProviderResult.failure(
                f"provider_error: {e}", self.name, self.model
            )
        return self._parse_response(response)

    # ─── Internals ──────────────────────────────────────────
    def _parse_response(self, response) -> ProviderResult:
        try:
            content = (response.text or "").strip() if hasattr(response, "text") else ""
        except Exception:
            content = ""

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
            return ProviderResult.failure(
                "severity_out_of_range", self.name, self.model
            )
        if not (0 <= confidence <= 100):
            return ProviderResult.failure(
                "confidence_out_of_range", self.name, self.model
            )

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