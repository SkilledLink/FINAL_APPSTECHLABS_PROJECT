# app/services/image_analysis_service.py
import json
import logging
import re
from typing import Optional

from app.ai.schemas import ImageAnalysis
from app.ai.providers.gemini import GeminiProvider

logger = logging.getLogger(__name__)


_IMAGE_ANALYSIS_SYSTEM = """You are a visual assistant for SkilledLink, a
platform connecting customers with skilled workers.

Your job is to look at an image and describe what kind of work, service,
or professional it might relate to. You are NEVER certain — always frame
your output as a hypothesis.

Rules:
- Do NOT claim to know exactly what is wrong. Describe what is visible.
- If the image does not clearly relate to any trade, say so.
- Keep the "description" field to ONE concise sentence (max 30 words).
- Output STRICT JSON only. No prose. No markdown fences.

Output schema:
{
  "description": "short factual description of what is visible",
  "possible_profession": "single trade name or null",
  "possible_services": ["service1", "service2"],
  "skills": ["skill1", "skill2"],
  "work_category": "category or null",
  "search_terms": ["term1", "term2", "term3"],
  "confidence": 0.0,
  "language": "en"
}

confidence is your honest estimate (0.0–1.0) that the profession
hypothesis is correct. If the image is ambiguous, use a low number."""


class ImageAnalysisService:
    """
    Wraps Gemini multimodal for one purpose: turning an image (plus
    optional text) into structured search concepts.

    Never used for moderation — moderation is a separate concern.
    Never used for portfolio embedding — that's a separate pipeline.
    """

    def __init__(self):
        self.gemini = GeminiProvider()

    def analyze(
        self,
        image_bytes: bytes,
        mime_type: str,
        user_text: Optional[str] = None,
    ) -> ImageAnalysis:
        """
        Returns a validated ImageAnalysis. On any failure returns an
        empty ImageAnalysis with confidence=0.0 — callers treat that
        as "image analysis unavailable" and do not fabricate.
        """
        if not image_bytes:
            logger.warning("image_analysis empty input")
            return ImageAnalysis(description="", confidence=0.0)

        try:
            user_prompt = (
                "Analyze this image and return the JSON described in the "
                "system prompt."
            )
            if user_text:
                user_prompt += (
                    f"\nThe user also wrote: {user_text!r}. "
                    f"Use this to guide, but do not trust it blindly."
                )

            raw = self.gemini.analyze_image_sync(
                image_bytes=image_bytes,
                mime_type=mime_type,
                system_prompt=_IMAGE_ANALYSIS_SYSTEM,
                user_prompt=user_prompt,
            )
            return self._parse(raw)

        except Exception as e:
            logger.error("image_analysis failed: %s", e)
            return ImageAnalysis(description="", confidence=0.0)

    @staticmethod
    def _parse(raw: str) -> ImageAnalysis:
        if not raw:
            return ImageAnalysis(confidence=0.0)

        # Strip code fences if the model added them
        cleaned = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.M).strip()

        # Attempt 1: full JSON parse
        try:
            data = json.loads(cleaned)
            return ImageAnalysisService._from_dict(data)
        except Exception:
            pass

        # Attempt 2: salvage a truncated JSON by finding the longest
        # valid prefix and appending closing characters.
        salvaged = ImageAnalysisService._try_salvage(cleaned)
        if salvaged is not None:
            return salvaged

        # Attempt 3: give up gracefully — return an empty analysis
        # instead of dumping raw JSON text into `description`.
        logger.warning(
            "image_analysis could not parse response (%d chars): %s",
            len(raw),
            raw[:200],
        )
        return ImageAnalysis(confidence=0.0)

    @staticmethod
    def _from_dict(data: dict) -> ImageAnalysis:
        try:
            return ImageAnalysis(
                description=str(data.get("description") or "")[:500],
                possible_profession=(data.get("possible_profession") or None),
                possible_services=list(data.get("possible_services") or [])[:5],
                skills=list(data.get("skills") or [])[:8],
                work_category=data.get("work_category") or None,
                search_terms=list(data.get("search_terms") or [])[:8],
                confidence=float(data.get("confidence") or 0.0),
                language=str(data.get("language") or "en")[:5],
            )
        except Exception as e:
            logger.warning("image_analysis schema mismatch: %s", e)
            return ImageAnalysis(confidence=0.0)

    @staticmethod
    def _try_salvage(text: str) -> Optional[ImageAnalysis]:
        """
        Best-effort recovery for a truncated JSON payload.

        Strategy: try to close open quotes/arrays/objects progressively
        until json.loads succeeds, or give up.
        """
        # Only attempt if it looks like we started a JSON object
        if not text.startswith("{"):
            return None

        # Try progressively closing the string
        candidates = []
        base = text.rstrip()

        # Common truncation points: mid-string, mid-array, mid-object
        for suffix in (
            '"}}',
            '"]}}',
            '"]}',
            '"}',
            '}',
        ):
            candidates.append(base + suffix)

        # Also try closing whatever is open
        open_braces = base.count("{") - base.count("}")
        open_brackets = base.count("[") - base.count("]")
        open_quotes = base.count('"') % 2

        fixed = base
        if open_quotes:
            fixed += '"'
        fixed += "]" * open_brackets
        fixed += "}" * open_braces
        candidates.append(fixed)

        for candidate in candidates:
            try:
                data = json.loads(candidate)
                if isinstance(data, dict):
                    logger.info("image_analysis salvaged truncated JSON")
                    return ImageAnalysisService._from_dict(data)
            except Exception:
                continue

        return None