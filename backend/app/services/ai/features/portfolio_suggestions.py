# app/services/ai/features/portfolio_suggestions.py
"""AI portfolio suggestions — first AI feature on the entitlement system.

Flow:
    1. Check entitlement via ProfessionalAIUsageService.check()
    2. Ground on real professional data (never invent)
    3. Build prompt
    4. Call tier-appropriate AI provider
    5. Parse structured JSON response
    6. Increment usage counter

Runs on Groq for Level 2, Gemini for Level 3 (upgraded prompt + longer
context budget for the higher tier).
"""

import json
import logging
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status as http_status
from sqlmodel import Session

from app.models.professional import Professional
from app.services.ai.base import AIProviderClient
from app.services.ai.grounding import build_portfolio_snapshot
from app.services.professional_ai_usage_service import (
    ProfessionalAIUsageService,
)

logger = logging.getLogger(__name__)

FEATURE_KEY = "ai_portfoliou_sggestions"


# ─── PUBLIC ENTRY ────────────────────────────────────────────────

def generate_portfolio_suggestions(
    *,
    session: Session,
    professional: Professional,
    ai_client: AIProviderClient,
    tier_level: int,
    usage_service: ProfessionalAIUsageService,
) -> dict:
    # 1. Entitlement check
    check = usage_service.check(professional.id, FEATURE_KEY)
    if not check.allowed:
        raise HTTPException(
            status_code=http_status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "AI credit limit reached for this feature on your current "
                "tier. Upgrade or wait until the next period."
            ),
        )

    # 2. Grounding — pull only real data
    snapshot = build_portfolio_snapshot(session, professional)

    # 3. Prompt — tier_level drives verbosity / depth
    system = _SYSTEM_PROMPT
    prompt = _build_user_prompt(snapshot, tier_level)

    # 4. AI call
    response = ai_client.generate(
        prompt,
        system=system,
        json_mode=True,
    )

    # 5. Parse
    suggestions = _parse_suggestions(response.text)

    # 6. Increment usage only after a successful AI call
    usage_service.increment(professional.id, FEATURE_KEY)

    return {
        "suggestions": suggestions,
        "provider": response.provider,
        "model": response.model,
        "prompt_tokens": response.prompt_tokens,
        "completion_tokens": response.completion_tokens,
    }


# ─── PROMPTS ─────────────────────────────────────────────────────

_SYSTEM_PROMPT = """\
You are an assistant that helps skilled professionals improve their \
marketplace profiles on SkilledLink, a Cameroon-focused services platform.

STRICT RULES:
1. ONLY reference facts present in the JSON snapshot provided by the user.
2. NEVER invent prices, availability, reviews, ratings, qualifications, \
guarantees, contracts, service coverage, or experience.
3. If a fact is missing from the snapshot, do not mention it — you may \
suggest the professional ADD it, but never fill it in yourself.
4. Return STRICT JSON only. No markdown, no prose, no code fences.

Output schema:
{
  "suggestions": [
    {
      "title": "Short, imperative title",
      "description": "1-3 sentences describing the concrete change",
      "reason": "Why this helps, grounded in the snapshot"
    }
  ]
}
"""


def _build_user_prompt(snapshot: dict, tier_level: int) -> str:
    max_items = 5 if tier_level >= 3 else 3
    depth = (
        "deep analysis across portfolio, services, works, and availability"
        if tier_level >= 3
        else "focused analysis of profile and services"
    )
    return (
        f"Perform a {depth}. Return at most {max_items} suggestions, "
        "ranked by impact.\n\n"
        f"PROFESSIONAL SNAPSHOT:\n{json.dumps(snapshot, ensure_ascii=False, indent=2)}"
    )


# ─── PARSING ─────────────────────────────────────────────────────

def _parse_suggestions(raw: str) -> list[dict]:
    text = _strip_code_fences(raw.strip())
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        logger.warning(
            "AI returned non-JSON response: %s", text[:300]
        )
        raise HTTPException(
            status_code=http_status.HTTP_502_BAD_GATEWAY,
            detail="AI returned an unparsable response. Please retry.",
        )

    items = data.get("suggestions") if isinstance(data, dict) else None
    if not isinstance(items, list):
        raise HTTPException(
            status_code=http_status.HTTP_502_BAD_GATEWAY,
            detail="AI response did not contain a suggestions list.",
        )

    cleaned: list[dict] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        title = (item.get("title") or "").strip()
        description = (item.get("description") or "").strip()
        reason = (item.get("reason") or "").strip()
        if title and description:
            cleaned.append({
                "title": title[:200],
                "description": description[:1000],
                "reason": reason[:500],
            })

    if not cleaned:
        raise HTTPException(
            status_code=http_status.HTTP_502_BAD_GATEWAY,
            detail="AI returned no usable suggestions. Please retry.",
        )

    return cleaned


def _strip_code_fences(text: str) -> str:
    if text.startswith("```"):
        lines = text.splitlines()
        lines = [ln for ln in lines if not ln.strip().startswith("```")]
        return "\n".join(lines).strip()
    return text