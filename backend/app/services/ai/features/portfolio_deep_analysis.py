# app/services/ai/features/portfolio_deep_analysis.py
"""AI portfolio deep analysis — Level 3 exclusive.

Analyzes the ENTIRE portfolio (bio, services, works, availability,
trust signals) in one Gemini call. Returns a completeness score with
per-section breakdown, gaps, and prioritized recommendations.

The prompt enforces a strict JSON schema so the response is always
parseable and every field is present.
"""

import json
import logging
from typing import Optional

from fastapi import HTTPException, status as http_status
from sqlmodel import Session

from app.models.professional import Professional
from app.services.ai.base import AIProviderClient
from app.services.ai.grounding import build_portfolio_snapshot
from app.services.professional_ai_usage_service import (
    ProfessionalAIUsageService,
)

logger = logging.getLogger(__name__)

FEATURE_KEY = "ai_portfolio_deep_analysis"

# Section weights — used by the deterministic pre-scorer.
_SECTION_WEIGHTS = {
    "identity": 0.15,
    "services": 0.25,
    "works": 0.25,
    "availability": 0.10,
    "trust": 0.15,
    "completeness": 0.10,
}


# ─── PUBLIC ──────────────────────────────────────────────────────

def generate_deep_analysis(
    *,
    session: Session,
    professional: Professional,
    ai_client: AIProviderClient,
    usage_service: ProfessionalAIUsageService,
) -> dict:
    # 1. Entitlement check
    check = usage_service.check(professional.id, FEATURE_KEY)
    if not check.allowed:
        raise HTTPException(
            status_code=http_status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "AI deep analysis limit reached for this period. "
                "Upgrade or wait until the next month."
            ),
        )

    # 2. Grounding — the entire portfolio
    snapshot = build_portfolio_snapshot(session, professional)

    # 3. Deterministic pre-score — grounded signal passed to Gemini
    prescores = _compute_prescores(snapshot)

    # 4. Ask Gemini for a grounded analysis
    prompt = _build_user_prompt(snapshot, prescores)
    response = ai_client.generate(prompt, system=_SYSTEM_PROMPT, json_mode=True)

    # 5. Parse and normalise
    parsed = _parse_response(response.text, prescores)

    # 6. Increment usage
    usage_service.increment(professional.id, FEATURE_KEY)

    return {
        **parsed,
        "provider": response.provider,
        "model": response.model,
        "prompt_tokens": response.prompt_tokens,
        "completion_tokens": response.completion_tokens,
    }


# ─── PRE-SCORER ──────────────────────────────────────────────────

def _compute_prescores(snapshot: dict) -> dict:
    """Deterministic pre-score from snapshot. Passed to Gemini so the
    AI grounds its numeric scores against real data instead of inventing."""
    p = snapshot.get("professional", {})
    pf = snapshot.get("portfolio", {}) or {}
    services = snapshot.get("services", []) or []
    works = snapshot.get("works", []) or []
    availability = snapshot.get("availability", {}) or {}

    # Identity (0-100)
    identity_points = 0
    if p.get("profession"): identity_points += 20
    if p.get("headline"): identity_points += 15
    if p.get("bio") and len(p["bio"]) > 80: identity_points += 25
    if p.get("years_of_experience"): identity_points += 10
    if p.get("skills"): identity_points += 15
    if p.get("languages"): identity_points += 5
    if pf.get("headline"): identity_points += 5
    if pf.get("tagline"): identity_points += 5
    identity = min(100, identity_points)

    # Services
    svc_count = len(services)
    svc_count_score = min(60, svc_count * 20)  # 3+ services = full count score
    svc_quality = 0
    if svc_count:
        described = sum(1 for s in services if (s.get("description") or "").strip())
        with_price = sum(1 for s in services if s.get("starting_price") is not None)
        svc_quality = int(
            (described / svc_count) * 25 + (with_price / svc_count) * 15
        )
    services_score = min(100, svc_count_score + svc_quality)

    # Works
    work_count = len(works)
    work_count_score = min(50, work_count * 12)  # ~4+ works = full
    work_quality = 0
    if work_count:
        described = sum(1 for w in works if (w.get("description") or "").strip())
        has_image = sum(
            1 for w in works
            if w.get("before_image_url") or w.get("after_image_url")
        )
        has_testimonial = sum(
            1 for w in works if (w.get("client_testimonial") or "").strip()
        )
        work_quality = int(
            (described / work_count) * 20
            + (has_image / work_count) * 20
            + (has_testimonial / work_count) * 10
        )
    works_score = min(100, work_count_score + work_quality)

    # Availability
    days = availability.get("days_available") or []
    availability_score = min(100, len(days) * 14) if days else 0

    # Trust
    trust_points = 0
    if p.get("is_verified"): trust_points += 30
    if pf.get("license_number"): trust_points += 20
    if pf.get("insurance_provider"): trust_points += 20
    if p.get("total_reviews", 0) >= 3: trust_points += 20
    if p.get("trust_score", 0) >= 70: trust_points += 10
    trust = min(100, trust_points)

    # Completeness
    completeness_points = 0
    if pf.get("mission_statement"): completeness_points += 20
    if pf.get("business_description"): completeness_points += 20
    if pf.get("tags"): completeness_points += 20
    if pf.get("languages"): completeness_points += 20
    if p.get("certifications"): completeness_points += 10
    if p.get("education"): completeness_points += 10
    completeness = min(100, completeness_points)

    section_scores = {
        "identity": identity,
        "services": services_score,
        "works": works_score,
        "availability": availability_score,
        "trust": trust,
        "completeness": completeness,
    }

    overall = round(
        sum(section_scores[k] * w for k, w in _SECTION_WEIGHTS.items())
    )

    return {
        "section_scores": section_scores,
        "overall_score": overall,
        "weights": _SECTION_WEIGHTS,
        "raw_counts": {
            "services": svc_count,
            "works": work_count,
            "availability_days": len(days),
        },
    }


def _grade(score: int) -> str:
    if score >= 90: return "A+"
    if score >= 85: return "A"
    if score >= 80: return "A-"
    if score >= 75: return "B+"
    if score >= 70: return "B"
    if score >= 65: return "B-"
    if score >= 60: return "C+"
    if score >= 55: return "C"
    if score >= 50: return "C-"
    if score >= 40: return "D"
    return "F"


# ─── PROMPTS ─────────────────────────────────────────────────────

_SYSTEM_PROMPT = """\
You are an expert portfolio reviewer for SkilledLink, a Cameroon
services marketplace for skilled professionals.

You will receive:
  1. The professional's ENTIRE portfolio (real data — bio, services,
     works, availability, trust signals).
  2. A DETERMINISTIC PRE-SCORE computed from the data.

Your job:
  - Produce a narrative SUMMARY (3-5 sentences) that honestly
    assesses the portfolio's current state.
  - Refine the SECTION SCORES if the pre-score missed nuance, but do
    NOT invent facts. If a section has no data, keep its score low.
  - Identify GAPS with severity (high/medium/low) and area.
  - Produce RECOMMENDATIONS with priority and concrete actions.
  - Produce SUGGESTED_NEXT_ACTIONS — 3-6 concrete things the
    professional should do this week.

STRICT RULES:
1. NEVER invent prices, availability, reviews, ratings, qualifications,
   certifications, guarantees, or experience.
2. Base every claim on the data provided.
3. Return STRICT JSON only. No markdown, no prose.
4. Every field in the schema MUST be present.

Output schema:
{
  "summary": "<3-5 sentence honest assessment>",
  "section_scores": {
    "identity":     { "score": <0-100>, "notes": "<1 sentence>" },
    "services":     { "score": <0-100>, "notes": "<1 sentence>" },
    "works":        { "score": <0-100>, "notes": "<1 sentence>" },
    "availability": { "score": <0-100>, "notes": "<1 sentence>" },
    "trust":        { "score": <0-100>, "notes": "<1 sentence>" },
    "completeness": { "score": <0-100>, "notes": "<1 sentence>" }
  },
  "gaps": [
    { "severity": "high" | "medium" | "low",
      "area": "identity" | "services" | "works" | "availability" | "trust" | "completeness",
      "message": "<one sentence>" }
  ],
  "recommendations": [
    { "priority": "high" | "medium" | "low",
      "action": "<one concrete sentence, imperative>" }
  ],
  "suggested_next_actions": [
    "<short concrete action>"
  ]
}
"""


def _build_user_prompt(snapshot: dict, prescores: dict) -> str:
    return (
        "Analyze this professional's portfolio and return the strict "
        "JSON schema.\n\n"
        "PORTFOLIO SNAPSHOT (real data):\n"
        f"{json.dumps(snapshot, ensure_ascii=False, indent=2)}\n\n"
        "DETERMINISTIC PRE-SCORE (already computed):\n"
        f"{json.dumps(prescores, ensure_ascii=False, indent=2)}"
    )


# ─── PARSER ──────────────────────────────────────────────────────

def _parse_response(raw: str, prescores: dict) -> dict:
    text = _strip_fences(raw.strip())
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        logger.warning("Deep analysis returned non-JSON: %s", text[:300])
        raise HTTPException(
            status_code=http_status.HTTP_502_BAD_GATEWAY,
            detail="AI returned an unparsable response. Please retry.",
        )

    if not isinstance(data, dict):
        raise HTTPException(
            status_code=http_status.HTTP_502_BAD_GATEWAY,
            detail="AI response was not a JSON object.",
        )

    # Fallback section scores = pre-scores
    pre_sections = prescores.get("section_scores", {})
    raw_sections = data.get("section_scores") or {}
    section_scores: dict[str, dict] = {}
    for key in _SECTION_WEIGHTS:
        entry = raw_sections.get(key) or {}
        try:
            score = int(entry.get("score"))
        except (TypeError, ValueError):
            score = int(pre_sections.get(key, 0))
        score = max(0, min(100, score))
        section_scores[key] = {
            "score": score,
            "weight": _SECTION_WEIGHTS[key],
            "notes": str(entry.get("notes") or "").strip()[:300],
        }

    overall = round(
        sum(section_scores[k]["score"] * _SECTION_WEIGHTS[k] for k in _SECTION_WEIGHTS)
    )

    summary = str(data.get("summary") or "").strip()
    if not summary:
        raise HTTPException(
            status_code=http_status.HTTP_502_BAD_GATEWAY,
            detail="AI returned no summary.",
        )

    gaps = _clean_list(data.get("gaps"), ("severity", "area", "message"))
    recommendations = _clean_list(
        data.get("recommendations"), ("priority", "action")
    )
    next_actions = [
        str(a).strip()[:200]
        for a in (data.get("suggested_next_actions") or [])
        if str(a).strip()
    ][:8]

    return {
        "summary": summary[:1200],
        "overall_score": overall,
        "grade": _grade(overall),
        "section_scores": section_scores,
        "gaps": gaps,
        "recommendations": recommendations,
        "suggested_next_actions": next_actions,
    }


def _clean_list(items, required_keys: tuple) -> list[dict]:
    if not isinstance(items, list):
        return []
    out: list[dict] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        cleaned: dict = {}
        ok = True
        for k in required_keys:
            v = item.get(k)
            if v is None or str(v).strip() == "":
                ok = False
                break
            cleaned[k] = str(v).strip()[:400]
        if ok:
            out.append(cleaned)
    return out[:20]


def _strip_fences(text: str) -> str:
    if text.startswith("```"):
        lines = [
            ln for ln in text.splitlines()
            if not ln.strip().startswith("```")
        ]
        return "\n".join(lines).strip()
    return text