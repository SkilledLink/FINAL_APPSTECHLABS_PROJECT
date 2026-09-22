# app/services/ai/proposal_targets.py
"""Whitelist of fields the AI is allowed to propose changes to.

Supports two shapes of field path:

  Static  — "professional.bio", "portfolio.headline"
            Target is a single known row (professional or portfolio).

  Dynamic — "service:<uuid>.description", "work:<uuid>.title"
            Target is a specific row inside the professional's portfolio.

The AI never edits arbitrary fields — only paths returned by
`list_allowed_paths()` for the given professional.
"""

from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from sqlmodel import Session, select

from app.models.professional import Professional
from app.models.professional_portfolio import (
    PortfolioWork,
    ProfessionalPortfolio,
    ProfessionalService,
)


@dataclass
class ProposalTarget:
    model_cls: type
    field_name: str
    max_length: int
    invalidates_embedding: bool = False


# Static targets — always resolvable from the professional row
STATIC_TARGETS: dict[str, ProposalTarget] = {
    "professional.headline": ProposalTarget(
        Professional, "headline", 150, invalidates_embedding=True
    ),
    "professional.bio": ProposalTarget(
        Professional, "bio", 1500, invalidates_embedding=True
    ),
    "professional.availability_notes": ProposalTarget(
        Professional, "availability_notes", 500
    ),
    "portfolio.headline": ProposalTarget(
        ProfessionalPortfolio, "headline", 200, invalidates_embedding=True
    ),
    "portfolio.tagline": ProposalTarget(
        ProfessionalPortfolio, "tagline", 160, invalidates_embedding=True
    ),
    "portfolio.bio": ProposalTarget(
        ProfessionalPortfolio, "bio", 2000, invalidates_embedding=True
    ),
    "portfolio.mission_statement": ProposalTarget(
        ProfessionalPortfolio, "mission_statement", 1000,
        invalidates_embedding=True,
    ),
    "portfolio.business_name": ProposalTarget(
        ProfessionalPortfolio, "business_name", 100,
        invalidates_embedding=True,
    ),
    "portfolio.business_description": ProposalTarget(
        ProfessionalPortfolio, "business_description", 1000,
        invalidates_embedding=True,
    ),
}


# Sub-entity targets — one per row, addressed by <scope>:<uuid>.<field>
SUB_ENTITY_TARGETS: dict[str, ProposalTarget] = {
    "service.title": ProposalTarget(
        ProfessionalService, "title", 200, invalidates_embedding=True
    ),
    "service.description": ProposalTarget(
        ProfessionalService, "description", 2000, invalidates_embedding=True
    ),
    "work.title": ProposalTarget(
        PortfolioWork, "title", 200, invalidates_embedding=True
    ),
    "work.description": ProposalTarget(
        PortfolioWork, "description", 2000, invalidates_embedding=True
    ),
}


# ─── PATH PARSING ────────────────────────────────────────────────

def parse_field_path(field_path: str):
    """Returns (scope, target_uuid_or_None, field_name).

    Examples:
        "professional.bio"                → ("professional", None, "bio")
        "portfolio.headline"              → ("portfolio", None, "headline")
        "service:<uuid>.description"      → ("service", UUID(...), "description")
        "work:<uuid>.title"               → ("work", UUID(...), "title")
    """
    if field_path.startswith("service:") or field_path.startswith("work:"):
        scope, rest = field_path.split(":", 1)
        uuid_str, field_name = rest.split(".", 1)
        return scope, UUID(uuid_str), field_name

    scope, field_name = field_path.split(".", 1)
    return scope, None, field_name


def list_allowed_paths(
    session: Session, professional: Professional
) -> list[str]:
    """Returns all field paths the AI may target for this professional."""
    paths = list(STATIC_TARGETS.keys())

    portfolio = _get_portfolio(session, professional.user_id)
    if portfolio is None:
        return paths

    services = session.exec(
        select(ProfessionalService).where(
            ProfessionalService.portfolio_id == portfolio.id,
            ProfessionalService.is_active.is_(True),
        )
    ).all()
    for s in services:
        paths.append(f"service:{s.id}.title")
        paths.append(f"service:{s.id}.description")

    works = session.exec(
        select(PortfolioWork).where(
            PortfolioWork.portfolio_id == portfolio.id
        )
    ).all()
    for w in works:
        paths.append(f"work:{w.id}.title")
        paths.append(f"work:{w.id}.description")

    return paths


# ─── READ / WRITE ────────────────────────────────────────────────

def get_current_value(
    session: Session,
    *,
    professional: Professional,
    field_path: str,
) -> Optional[str]:
    scope, target_id, field_name = parse_field_path(field_path)

    # Static
    if target_id is None:
        static_key = f"{scope}.{field_name}"
        target = STATIC_TARGETS.get(static_key)
        if target is None:
            return None

        if target.model_cls is Professional:
            return getattr(professional, target.field_name, None)

        if target.model_cls is ProfessionalPortfolio:
            portfolio = _get_portfolio(session, professional.user_id)
            if portfolio is None:
                return None
            return getattr(portfolio, target.field_name, None)

        return None

    # Dynamic
    if scope == "service":
        service = session.get(ProfessionalService, target_id)
        if service is None or not _owns_service(
            session, professional, service
        ):
            return None
        return getattr(service, field_name, None)

    if scope == "work":
        work = session.get(PortfolioWork, target_id)
        if work is None or not _owns_work(session, professional, work):
            return None
        return getattr(work, field_name, None)

    return None


def apply_value(
    session: Session,
    *,
    professional: Professional,
    field_path: str,
    new_value: str,
) -> str:
    scope, target_id, field_name = parse_field_path(field_path)

    # Static
    if target_id is None:
        static_key = f"{scope}.{field_name}"
        target = STATIC_TARGETS.get(static_key)
        if target is None:
            raise ValueError(f"Unsupported field_path: {field_path}")
        _enforce_length(field_path, new_value, target.max_length)

        if target.model_cls is Professional:
            setattr(professional, target.field_name, new_value)
            session.add(professional)
            return new_value

        if target.model_cls is ProfessionalPortfolio:
            portfolio = _get_portfolio(session, professional.user_id)
            if portfolio is None:
                raise ValueError(
                    f"Cannot apply {field_path}: no portfolio for this user"
                )
            setattr(portfolio, target.field_name, new_value)
            session.add(portfolio)
            return new_value

        raise ValueError(f"Unsupported target for {field_path}")

    # Dynamic — service
    if scope == "service":
        target = SUB_ENTITY_TARGETS.get(f"service.{field_name}")
        if target is None:
            raise ValueError(f"Unsupported field_path: {field_path}")
        _enforce_length(field_path, new_value, target.max_length)

        service = session.get(ProfessionalService, target_id)
        if service is None or not _owns_service(
            session, professional, service
        ):
            raise ValueError("Service not found for this professional")
        setattr(service, field_name, new_value)
        session.add(service)
        return new_value

    # Dynamic — work
    if scope == "work":
        target = SUB_ENTITY_TARGETS.get(f"work.{field_name}")
        if target is None:
            raise ValueError(f"Unsupported field_path: {field_path}")
        _enforce_length(field_path, new_value, target.max_length)

        work = session.get(PortfolioWork, target_id)
        if work is None or not _owns_work(session, professional, work):
            raise ValueError("Work not found for this professional")
        setattr(work, field_name, new_value)
        session.add(work)
        return new_value

    raise ValueError(f"Unsupported scope: {scope}")


# ─── HELPERS ─────────────────────────────────────────────────────

def _get_portfolio(
    session: Session, user_id: UUID
) -> Optional[ProfessionalPortfolio]:
    return session.exec(
        select(ProfessionalPortfolio).where(
            ProfessionalPortfolio.user_id == user_id
        )
    ).first()


def _owns_service(
    session: Session,
    professional: Professional,
    service: ProfessionalService,
) -> bool:
    portfolio = _get_portfolio(session, professional.user_id)
    return portfolio is not None and service.portfolio_id == portfolio.id


def _owns_work(
    session: Session,
    professional: Professional,
    work: PortfolioWork,
) -> bool:
    portfolio = _get_portfolio(session, professional.user_id)
    return portfolio is not None and work.portfolio_id == portfolio.id


def _enforce_length(path: str, value: str, max_length: int) -> None:
    if len(value) > max_length:
        raise ValueError(
            f"Value too long for {path}: {len(value)} > {max_length}"
        )