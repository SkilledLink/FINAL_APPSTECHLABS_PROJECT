# app/services/ai/features/image_analysis.py
"""AI image analysis — Level 3 exclusive.

Accepts an image URL or base64 and returns:
  - description: what the model sees
  - quality_score: 1-10
  - suggested_caption: a caption for the work card
  - suggestions: list of actionable improvements

Runs on Gemini (vision) — Level 2 gets a 402 upstream in the resolver.
"""

import base64
import json
import logging
from typing import Optional
from uuid import UUID

import httpx
from fastapi import HTTPException, status as http_status
from sqlmodel import Session

from app.models.professional import Professional
from app.models.professional_portfolio import PortfolioWork
from app.services.ai.base import AIProviderClient
from app.services.professional_ai_usage_service import (
    ProfessionalAIUsageService,
)

logger = logging.getLogger(__name__)

FEATURE_KEY = "ai_image_analysis"
_MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8 MB hard cap
_ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_DEFAULT_MIME = "image/jpeg"


# ─── PUBLIC ──────────────────────────────────────────────────────

def analyze_portfolio_image(
    *,
    session: Session,
    professional: Professional,
    image_source: dict,
    context: Optional[dict],
    ai_client: AIProviderClient,
    usage_service: ProfessionalAIUsageService,
) -> dict:
    # 1. Entitlement check
    check = usage_service.check(professional.id, FEATURE_KEY)
    if not check.allowed:
        raise HTTPException(
            status_code=http_status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "AI image analysis limit reached for this period. "
                "Upgrade or wait until the next month."
            ),
        )

    # 2. Resolve the image to base64 + mime type
    b64, mime = _prepare_image(session, image_source)

    # 3. Build prompt
    prompt = _build_prompt(context)
    system = _SYSTEM_PROMPT

    # 4. Call Gemini vision
    response = ai_client.generate_with_image(  # type: ignore[attr-defined]
        prompt=prompt,
        system=system,
        image_base64=b64,
        image_mime_type=mime,
        json_mode=True,
    )

    # 5. Parse
    parsed = _parse_response(response.text)

    # 6. Increment usage
    usage_service.increment(professional.id, FEATURE_KEY)

    return {
        "description": parsed["description"],
        "quality_score": parsed["quality_score"],
        "suggested_caption": parsed["suggested_caption"],
        "suggestions": parsed["suggestions"],
        "provider": response.provider,
        "model": response.model,
        "prompt_tokens": response.prompt_tokens,
        "completion_tokens": response.completion_tokens,
    }


# ─── IMAGE RESOLUTION ────────────────────────────────────────────

def _prepare_image(session: Session, source: dict) -> tuple[str, str]:
    """Return (base64_data, mime_type) from one of:
        - {"base64": "...", "mime_type": "image/jpeg"}
        - {"url": "https://..."}
        - {"work_id": UUID(...)}  → uses work.after_image_url or before_image_url
    """
    if source.get("base64"):
        mime = (source.get("mime_type") or _DEFAULT_MIME).lower()
        if mime not in _ALLOWED_MIME:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image mime type: {mime}",
            )
        return source["base64"], mime

    url = source.get("url")
    if not url and source.get("work_id"):
        work = session.get(PortfolioWork, source["work_id"])
        if not work:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Work not found",
            )
        url = work.after_image_url or work.before_image_url

    if not url:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=(
                "Provide one of: image_base64, image_url, or work_id "
                "with an attached image."
            ),
        )

    return _download_image(url)


def _download_image(url: str) -> tuple[str, str]:
    try:
        with httpx.Client(timeout=15.0, follow_redirects=True) as client:
            response = client.get(url)
            response.raise_for_status()
            content = response.content
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Could not download image: {exc}",
        )

    if len(content) > _MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=http_status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds {_MAX_IMAGE_BYTES // (1024 * 1024)} MB",
        )

    mime = (response.headers.get("content-type") or _DEFAULT_MIME).split(";")[0].strip().lower()
    if mime not in _ALLOWED_MIME:
        # Fall back to JPEG if header lied; Gemini will still try
        mime = _DEFAULT_MIME

    return base64.b64encode(content).decode("ascii"), mime


# ─── PROMPTS ─────────────────────────────────────────────────────

_SYSTEM_PROMPT = """\
You analyze photos that a professional has uploaded as part of their
portfolio on SkilledLink, a Cameroon services marketplace.

For each image, evaluate honestly and specifically. Do NOT invent
facts. Base everything on what you can actually see in the image.

Return STRICT JSON only. No markdown, no prose.

Output schema:
{
  "description": "<2-4 sentences describing exactly what is in the photo>",
  "quality_score": <integer 1-10, how good this photo is as a portfolio piece>,
  "suggested_caption": "<1-2 sentence caption the professional could use, factual, 200 chars max>",
  "suggestions": [
    "<actionable improvement, 150 chars max>",
    "<actionable improvement, 150 chars max>"
  ]
}

Rules:
- quality_score: 10 = pristine pro photo with great composition/lighting.
  1 = unusable blurry shot.
- suggestions must be actionable: lighting, framing, angle, background,
  missing context, or what to photograph next time.
- If the image does not appear to show any professional work, say so
  clearly in the description and suggest reuploading.
- suggested_caption must describe what is VISIBLE, not invented services.
"""


def _build_prompt(context: Optional[dict]) -> str:
    if not context:
        return "Analyze this portfolio photo."

    hints = []
    if context.get("work_title"):
        hints.append(f"Work title: {context['work_title']}")
    if context.get("service_title"):
        hints.append(f"Related service: {context['service_title']}")
    if context.get("profession"):
        hints.append(f"Professional's trade: {context['profession']}")
    if context.get("location"):
        hints.append(f"Location: {context['location']}")

    if not hints:
        return "Analyze this portfolio photo."

    return (
        "Analyze this portfolio photo. Context from the professional's "
        "record (use it to interpret what you see, but do not invent "
        "details that aren't visible):\n"
        + "\n".join(f"- {h}" for h in hints)
    )


# ─── PARSING ─────────────────────────────────────────────────────

def _parse_response(raw: str) -> dict:
    text = _strip_fences(raw.strip())
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        logger.warning("Image analysis returned non-JSON: %s", text[:300])
        raise HTTPException(
            status_code=http_status.HTTP_502_BAD_GATEWAY,
            detail="AI returned an unparsable response. Please retry.",
        )

    if not isinstance(data, dict):
        raise HTTPException(
            status_code=http_status.HTTP_502_BAD_GATEWAY,
            detail="AI response was not a JSON object.",
        )

    description = (data.get("description") or "").strip()
    suggested_caption = (data.get("suggested_caption") or "").strip()
    raw_score = data.get("quality_score")

    try:
        quality_score = int(raw_score)
    except (TypeError, ValueError):
        quality_score = 5
    quality_score = max(1, min(10, quality_score))

    suggestions = data.get("suggestions") or []
    if not isinstance(suggestions, list):
        suggestions = []
    suggestions = [
        str(s).strip()[:200] for s in suggestions if str(s).strip()
    ][:6]

    if not description:
        raise HTTPException(
            status_code=http_status.HTTP_502_BAD_GATEWAY,
            detail="AI returned no description for the image.",
        )

    return {
        "description": description[:1000],
        "quality_score": quality_score,
        "suggested_caption": suggested_caption[:300],
        "suggestions": suggestions,
    }


def _strip_fences(text: str) -> str:
    if text.startswith("```"):
        lines = [
            ln for ln in text.splitlines()
            if not ln.strip().startswith("```")
        ]
        return "\n".join(lines).strip()
    return text