# app/api/deps_payments.py
"""Dependency wiring for tier / subscription / payment / AI-usage routes.

Auth is imported from app.dependencies.current_user. Purchase-grade
operations use `get_current_active_user` — an inactive/suspended account
cannot buy a tier.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status as http_status
from sqlmodel import Session, select

from app.database.session import get_session
from app.dependencies.current_user import (
    get_current_active_user,
    get_current_user,
)
from app.models.professional import Professional
from app.models.user import User
from app.services.professional_ai_usage_service import (
    ProfessionalAIUsageService,
)
from app.services.professional_payment_service import (
    ProfessionalPaymentService,
)
from app.services.professional_subscription_service import (
    ProfessionalSubscriptionService,
)
from app.services.professional_tier_service import (
    ProfessionalTierCatalogService,
)


# ─── SESSION ────────────────────────────────────────────────────
SessionDep = Annotated[Session, Depends(get_session)]


# ─── AUTH ───────────────────────────────────────────────────────
CurrentUser = Annotated[User, Depends(get_current_user)]
ActiveUser = Annotated[User, Depends(get_current_active_user)]


def require_admin(current_user: CurrentUser) -> User:
    """Admin guard. If app.dependencies.permissions already exposes an
    equivalent, replace this body with that dependency instead."""
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


AdminUser = Annotated[User, Depends(require_admin)]


# ─── SERVICES ───────────────────────────────────────────────────
def get_tier_service(session: SessionDep) -> ProfessionalTierCatalogService:
    return ProfessionalTierCatalogService(session)


def get_subscription_service(
    session: SessionDep,
) -> ProfessionalSubscriptionService:
    return ProfessionalSubscriptionService(session)


def get_payment_service(
    session: SessionDep,
) -> ProfessionalPaymentService:
    return ProfessionalPaymentService(session)


def get_ai_usage_service(
    session: SessionDep,
) -> ProfessionalAIUsageService:
    return ProfessionalAIUsageService(session)


TierServiceDep = Annotated[
    ProfessionalTierCatalogService, Depends(get_tier_service)
]
SubscriptionServiceDep = Annotated[
    ProfessionalSubscriptionService, Depends(get_subscription_service)
]
PaymentServiceDep = Annotated[
    ProfessionalPaymentService, Depends(get_payment_service)
]
AIUsageServiceDep = Annotated[
    ProfessionalAIUsageService, Depends(get_ai_usage_service)
]


# ─── CURRENT PROFESSIONAL ───────────────────────────────────────
def get_current_professional(
    current_user: ActiveUser, session: SessionDep
) -> Professional:
    """Resolves the authenticated active user to their Professional profile.
    404 if the user has no professional profile or it is soft-deleted."""
    stmt = select(Professional).where(
        Professional.user_id == current_user.id,
        Professional.deleted_at.is_(None),
    )
    professional = session.exec(stmt).first()
    if not professional:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="You must have a professional profile to use this feature",
        )
    return professional


CurrentProfessional = Annotated[Professional, Depends(get_current_professional)]