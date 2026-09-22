# app/services/ai/features/profile_optimization.py
"""AI profile optimization — generates before/after proposals for
whitelisted text fields on the professional's profile, portfolio,
services, and works.
"""

import json
import logging
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status as http_status
from sqlmodel import Session, select

from app.enums.ai_proposal import ProposalStatus
from app.enums.professional import AuditAction
from app.models.professional import Professional
from app.models.professional_ai_proposal import ProfessionalAIProposal
from app.models.professional_audit_log import ProfessionalAuditLog
from app.models.professional_portfolio import (
    PortfolioWork,
    ProfessionalPortfolio,
    ProfessionalService,
)
from app.repositories.professional_audit_repository import (
    ProfessionalAuditRepository,
)
from app.services.ai.base import AIProviderClient
from app.services.ai.grounding import build_portfolio_snapshot
from app.services.ai.proposal_targets import (
    STATIC_TARGETS,
    get_current_value,
    list_allowed_paths,
    parse_field_path,
)
from app.services.professional_ai_usage_service import (
    ProfessionalAIUsageService,
)

logger = logging.getLogger(__name__)

FEATURE_KEY = "ai_profile_optimization"
PROPOSAL_TTL_DAYS = 7


def generate_profile_proposals(
    *,
    session: Session,
    professional: Professional,
    ai_client: AIProviderClient,
    tier_level: int,
    usage_service: ProfessionalAIUsageService,
) -> tuple[list[ProfessionalAIProposal], dict]:
    # 1. Entitlement check
    check = usage_service.check(professional.id, FEATURE_KEY)
    if not check.allowed:
        raise HTTPException(
            status_code=http_status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "AI credit limit reached for profile optimization on "
                "your current tier."
            ),
        )

    # 2. Supersede any existing pending proposals for this professional
    _supersede_pending(session, professional.id)

    # 3. Grounding
    snapshot = build_portfolio_snapshot(session, professional)

    # 4. Enumerate allowed paths, annotated with row titles + current
    #    values so the AI can't confuse IDs across rows.
    allowed_paths = list_allowed_paths(session, professional)
    annotated_paths = _annotate_paths(session, professional, allowed_paths)

    # 5. Ask the AI
    max_items = 5 if tier_level >= 3 else 3
    system = _SYSTEM_PROMPT
    prompt = _build_user_prompt(snapshot, annotated_paths, max_items)

    response = ai_client.generate(prompt, system=system, json_mode=True)

    # 6. Parse and persist
    raw_proposals = _parse_proposals(response.text)

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=PROPOSAL_TTL_DAYS)
    audit_repo = ProfessionalAuditRepository(session)

    persisted: list[ProfessionalAIProposal] = []
    for raw in raw_proposals:
        field_path = raw["field_path"]
        if field_path not in allowed_paths:
            continue

        current_value = get_current_value(
            session, professional=professional, field_path=field_path
        )
        if (current_value or "") == raw["proposed_value"]:
            continue

        proposal = ProfessionalAIProposal(
            professional_id=professional.id,
            feature_key=FEATURE_KEY,
            field_path=field_path,
            current_value=current_value,
            proposed_value=raw["proposed_value"],
            reason=raw.get("reason"),
            impact=raw.get("impact", "medium"),
            status=ProposalStatus.PENDING,
            expires_at=expires_at,
        )
        session.add(proposal)
        persisted.append(proposal)

    session.commit()
    for proposal in persisted:
        session.refresh(proposal)
        audit_repo.create(
            ProfessionalAuditLog(
                professional_id=professional.id,
                actor_role="system",
                action=AuditAction.AI_PROPOSAL_CREATED,
                new_value={
                    "proposal_id": str(proposal.id),
                    "field_path": proposal.field_path,
                    "impact": proposal.impact,
                },
            )
        )
    session.commit()

    usage_service.increment(professional.id, FEATURE_KEY)

    return persisted, {
        "provider": response.provider,
        "model": response.model,
        "prompt_tokens": response.prompt_tokens,
        "completion_tokens": response.completion_tokens,
    }


# ─── INTERNALS ────────────────────────────────────────────────────

def _supersede_pending(session: Session, professional_id) -> None:
    """Mark all currently pending proposals for this professional as
    superseded. Called at generate time so regenerating replaces the
    previous batch instead of piling up stale rows."""
    stale = session.exec(
        select(ProfessionalAIProposal).where(
            ProfessionalAIProposal.professional_id == professional_id,
            ProfessionalAIProposal.status == ProposalStatus.PENDING.value,
        )
    ).all()
    if not stale:
        return
    now = datetime.now(timezone.utc)
    for row in stale:
        row.status = ProposalStatus.SUPERSEDED
        row.updated_at = now
        session.add(row)
    session.commit()


def _annotate_paths(session: Session, professional, allowed_paths: list[str]) -> str:
    """Render each allowed path with a title hint and current value so
    the AI can never confuse which UUID maps to which row."""
    lines: list[str] = []

    for path in allowed_paths:
        scope, target_id, field_name = parse_field_path(path)

        if target_id is None:
            label = f"{scope}.{field_name}"
        elif scope == "service":
            svc = session.get(ProfessionalService, target_id)
            label = f"service row title: {svc.title!r}" if svc else "service row (missing)"
        elif scope == "work":
            work = session.get(PortfolioWork, target_id)
            label = f"work row title: {work.title!r}" if work else "work row (missing)"
        else:
            label = scope

        current = get_current_value(
            session, professional=professional, field_path=path
        )
        current_display = (
            "null" if current is None
            else (repr(current) if current == "" else repr(current[:120] + ("..." if len(current) > 120 else "")))
        )

        lines.append(
            f"- {path}\n    ({label})\n    (current value: {current_display})"
        )

    return "\n".join(lines)


# ─── PROMPTS ─────────────────────────────────────────────────────

_SYSTEM_PROMPT = """\
You help skilled professionals on SkilledLink (a Cameroon services \
marketplace) improve specific text fields on their profile and the rows \
that make up their portfolio (services and works).

ABSOLUTE RULES:
1. You may ONLY target field paths listed in ALLOWED_FIELD_PATHS. Each
   path is complete and self-contained — copy it verbatim.
2. For each proposal, return the FIELD PATH, a COMPLETE replacement
   text value, a short reason, and an impact rating.
3. NEVER invent prices, availability, reviews, ratings, qualifications,
   certifications, guarantees, or experience. If a fact is not present
   in the snapshot, do not add it.
4. Preserve every real fact from the current value — location, years of
   experience, trade, languages — unless the current value itself is
   wrong.
5. Prefer HIGH-IMPACT fields first: empty or weak service/work
   descriptions are usually the biggest wins.
6. Return STRICT JSON only. No markdown. No prose.

CRITICAL RULE — PREVENT CROSS-ROW MISTAKES:
- Each ALLOWED_FIELD_PATH entry is annotated with a "row title" and a
  "current value".
- When you target a `service:<uuid>.description` or `work:<uuid>.description`
  path, the proposed_value MUST describe the SAME row whose title is
  annotated next to that path.
- DO NOT write a description for one service/work when targeting a
  different service/work's UUID.
- Before returning, verify: does the proposed_value refer to the same
  subject as the annotated row title? If not, rewrite it.

Output schema:
{
  "proposals": [
    {
      "field_path": "<one of ALLOWED_FIELD_PATHS, verbatim>",
      "proposed_value": "<complete replacement text, 500 chars max>",
      "reason": "<why this helps, grounded in the snapshot, 200 chars max>",
      "impact": "high" | "medium" | "low"
    }
  ]
}
"""


def _build_user_prompt(
    snapshot: dict, annotated_paths: str, max_items: int
) -> str:
    return (
        f"Propose up to {max_items} concrete improvements. Rank by impact.\n"
        "Prioritise service and work descriptions that are missing or weak.\n\n"
        "ALLOWED_FIELD_PATHS (use these exact strings — do not invent new ones):\n"
        f"{annotated_paths}\n\n"
        "PROFESSIONAL SNAPSHOT (real data, never invent):\n"
        f"{json.dumps(snapshot, ensure_ascii=False, indent=2)}"
    )


# ─── PARSING ─────────────────────────────────────────────────────

def _parse_proposals(raw: str) -> list[dict]:
    text = _strip_code_fences(raw.strip())
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        logger.warning("AI returned non-JSON: %s", text[:300])
        raise HTTPException(
            status_code=http_status.HTTP_502_BAD_GATEWAY,
            detail="AI returned an unparsable response. Please retry.",
        )

    items = data.get("proposals") if isinstance(data, dict) else None
    if not isinstance(items, list):
        raise HTTPException(
            status_code=http_status.HTTP_502_BAD_GATEWAY,
            detail="AI response did not contain a proposals list.",
        )

    cleaned: list[dict] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        field_path = (item.get("field_path") or "").strip()
        proposed_value = (item.get("proposed_value") or "").strip()
        if not field_path or not proposed_value:
            continue
        cleaned.append({
            "field_path": field_path,
            "proposed_value": proposed_value[:800],
            "reason": (item.get("reason") or "").strip()[:200],
            "impact": (item.get("impact") or "medium").strip().lower(),
        })
    return cleaned


def _strip_code_fences(text: str) -> str:
    if text.startswith("```"):
        lines = [
            ln for ln in text.splitlines()
            if not ln.strip().startswith("```")
        ]
        return "\n".join(lines).strip()
    return text