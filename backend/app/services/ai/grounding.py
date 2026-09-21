# app/services/ai/grounding.py
"""Builds a factual, structured snapshot of a professional's real data.

The AI must never invent prices, availability, reviews, ratings,
qualifications, or experience. Everything it references must come from
this snapshot — nothing else.
"""

from typing import Optional
from uuid import UUID

from sqlmodel import Session, select

from app.models.professional import Professional
from app.models.professional_portfolio import (
    ProfessionalPortfolio,
    ProfessionalService,
    PortfolioWork,
    ProfessionalAvailability,
)


def build_portfolio_snapshot(
    session: Session, professional: Professional
) -> dict:
    """Return a plain dict of the professional's real data, suitable for
    embedding in an AI prompt. Fields with no value are omitted so the
    model can't hallucinate filler."""

    snapshot: dict = {
        "professional": _professional_block(professional),
    }

    portfolio = _get_portfolio(session, professional.user_id)
    if portfolio:
        snapshot["portfolio"] = _portfolio_block(portfolio)
        snapshot["services"] = _services_block(session, portfolio.id)
        snapshot["works"] = _works_block(session, portfolio.id)
        snapshot["availability"] = _availability_block(session, portfolio.id)

    return snapshot


# ─── BLOCKS ──────────────────────────────────────────────────────

def _professional_block(p: Professional) -> dict:
    return _compact({
        "profession": p.profession,
        "headline": p.headline,
        "bio": p.bio,
        "experience_level": _enum_value(p.experience_level),
        "years_of_experience": p.years_of_experience,
        "company_name": p.company_name,
        "job_title": p.job_title,
        "skills": p.skills,
        "services": p.services,
        "certifications": p.certifications,
        "education": p.education,
        "languages": p.languages,
        "hourly_rate": float(p.hourly_rate) if p.hourly_rate is not None else None,
        "currency": p.currency,
        "country": p.country,
        "region": p.region,
        "city": p.city,
        "available": p.available,
        "availability_notes": p.availability_notes,
        "response_time_hours": p.response_time_hours,
        "is_verified": p.is_verified,
        "rating": float(p.rating) if p.rating is not None else None,
        "total_reviews": p.total_reviews,
        "completed_jobs": p.completed_jobs,
        "trust_score": p.trust_score,
    })


def _portfolio_block(pf: ProfessionalPortfolio) -> dict:
    return _compact({
        "headline": pf.headline,
        "tagline": pf.tagline,
        "bio": pf.bio,
        "mission_statement": pf.mission_statement,
        "business_name": pf.business_name,
        "business_description": pf.business_description,
        "years_experience": pf.years_experience,
        "years_in_business": pf.years_in_business,
        "team_size": pf.team_size,
        "country": pf.country,
        "region": pf.region,
        "city": pf.city,
        "service_area": pf.service_area,
        "service_radius_km": (
            float(pf.service_radius_km)
            if pf.service_radius_km is not None
            else None
        ),
        "travels_to_client": pf.travels_to_client,
        "works_remotely": pf.works_remotely,
        "license_number": pf.license_number,
        "license_authority": pf.license_authority,
        "insurance_provider": pf.insurance_provider,
        "currency": pf.currency,
        "payment_methods": pf.payment_methods,
        "accepts_negotiation": pf.accepts_negotiation,
        "tags": pf.tags,
        "languages": pf.languages,
        "average_rating": (
            float(pf.average_rating) if pf.average_rating is not None else None
        ),
        "total_reviews": pf.total_reviews,
        "is_verified": pf.is_verified,
        "is_featured": pf.is_featured,
    })


def _services_block(
    session: Session, portfolio_id: UUID, limit: int = 20
) -> list[dict]:
    stmt = (
        select(ProfessionalService)
        .where(ProfessionalService.portfolio_id == portfolio_id)
        .where(ProfessionalService.is_active.is_(True))
        .limit(limit)
    )
    return [
        _compact({
            "title": s.title,
            "description": s.description,
            "category": s.category,
            "starting_price": s.starting_price,
            "pricing_type": _enum_value(s.pricing_type),
            "estimated_duration": s.estimated_duration,
            "service_area": s.service_area,
            "is_emergency_service": s.is_emergency_service,
            "whats_included": s.whats_included,
            "whats_excluded": s.whats_excluded,
            "warranty_days": s.warranty_days,
            "lead_time_days": s.lead_time_days,
        })
        for s in session.exec(stmt).all()
    ]


def _works_block(
    session: Session, portfolio_id: UUID, limit: int = 15
) -> list[dict]:
    stmt = (
        select(PortfolioWork)
        .where(PortfolioWork.portfolio_id == portfolio_id)
        .order_by(PortfolioWork.created_at.desc())
        .limit(limit)
    )
    return [
        _compact({
            "title": w.title,
            "description": w.description,
            "service_category": w.service_category,
            "location": w.location,
            "duration_value": w.duration_value,
            "duration_unit": _enum_value(w.duration_unit),
            "team_size": w.team_size,
            "client_type": _enum_value(w.client_type),
            "cost": w.cost,
            "client_testimonial": w.client_testimonial,
            "rating": w.rating,
        })
        for w in session.exec(stmt).all()
    ]


def _availability_block(session: Session, portfolio_id: UUID) -> dict:
    stmt = select(ProfessionalAvailability).where(
        ProfessionalAvailability.portfolio_id == portfolio_id
    )
    rows = session.exec(stmt).all()
    if not rows:
        return {}
    days_available = [
        _enum_value(r.day_of_week)
        for r in rows
        if r.is_available
    ]
    return _compact({
        "days_available": days_available,
        "timezone": next(
            (r.timezone for r in rows if r.timezone), None
        ),
    })


# ─── HELPERS ─────────────────────────────────────────────────────

def _compact(d: dict) -> dict:
    """Drop keys with None/empty values so the prompt stays tight and
    the model has no empty slots to fill in."""
    return {
        k: v for k, v in d.items()
        if v not in (None, "", [], {}, 0) or isinstance(v, bool)
    }


def _enum_value(v) -> Optional[str]:
    if v is None:
        return None
    return v.value if hasattr(v, "value") else str(v)


def _get_portfolio(
    session: Session, user_id: UUID
) -> Optional[ProfessionalPortfolio]:
    stmt = select(ProfessionalPortfolio).where(
        ProfessionalPortfolio.user_id == user_id
    )
    return session.exec(stmt).first()