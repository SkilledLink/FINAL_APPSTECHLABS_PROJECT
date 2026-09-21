# app/api/v1/professional_subscriptions.py

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status as http_status

from app.api.deps_payments import (
    ActiveUser,
    CurrentProfessional,
    SubscriptionServiceDep,
)
from app.schemas.professional_tier_subscription import (
    ActiveSubscriptionResponse,
    ProfessionalTierSubscriptionListResponse,
    ProfessionalTierSubscriptionWithTierResponse,
    SubscriptionCancelRequest,
)

router = APIRouter(
    prefix="/api/v1/professional-subscriptions",
    tags=["professional-subscriptions"],
)


def _ensure_aware(dt: datetime | None) -> datetime | None:
    """Postgres TIMESTAMP WITHOUT TIME ZONE columns come back as naive
    datetimes from SQLAlchemy. Assume UTC when tzinfo is missing so
    Python-side arithmetic doesn't raise."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


# ─── MY SUBSCRIPTION ────────────────────────────────────────────
@router.get("/me", response_model=ActiveSubscriptionResponse)
def get_my_active_subscription(
    professional: CurrentProfessional,
    service: SubscriptionServiceDep,
) -> ActiveSubscriptionResponse:
    sub = service.get_active(professional.id)
    if not sub:
        return ActiveSubscriptionResponse(is_active=False, subscription=None)

    days_remaining = None
    if sub.expires_at:
        expires_at = _ensure_aware(sub.expires_at)
        delta = expires_at - datetime.now(timezone.utc)
        days_remaining = max(0, delta.days)

    payload = ProfessionalTierSubscriptionWithTierResponse.model_validate(sub)
    return ActiveSubscriptionResponse(
        is_active=True,
        days_remaining=days_remaining,
        subscription=payload,
    )


@router.get(
    "/me/history",
    response_model=ProfessionalTierSubscriptionListResponse,
)
def list_my_subscriptions(
    professional: CurrentProfessional,
    service: SubscriptionServiceDep,
    skip: int = 0,
    limit: int = 20,
) -> ProfessionalTierSubscriptionListResponse:
    subs, total = service.repo.list_for_professional(
        professional.id, skip=skip, limit=limit
    )
    items = [
        ProfessionalTierSubscriptionWithTierResponse.model_validate(s)
        for s in subs
    ]
    return ProfessionalTierSubscriptionListResponse(
        items=items,
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
    )


@router.get("/me/entitlements")
def get_my_entitlements(
    professional: CurrentProfessional,
    service: SubscriptionServiceDep,
) -> dict:
    """Returns {feature_key: feature_value} for the active tier."""
    return service.get_entitlements(professional.id)


# ─── CANCEL ─────────────────────────────────────────────────────
@router.post(
    "/me/cancel",
    response_model=ProfessionalTierSubscriptionWithTierResponse,
)
def cancel_my_subscription(
    payload: SubscriptionCancelRequest,
    professional: CurrentProfessional,
    current_user: ActiveUser,
    service: SubscriptionServiceDep,
) -> ProfessionalTierSubscriptionWithTierResponse:
    sub = service.get_active(professional.id)
    if not sub:
        raise HTTPException(
            http_status.HTTP_404_NOT_FOUND,
            "No active subscription to cancel",
        )
    updated = service.cancel(
        sub,
        reason=payload.reason,
        actor_user_id=current_user.id,
        actor_role="user",
    )
    return ProfessionalTierSubscriptionWithTierResponse.model_validate(updated)