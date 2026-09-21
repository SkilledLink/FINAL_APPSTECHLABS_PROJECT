# app/api/v1/professional_tiers.py

from uuid import UUID

from fastapi import APIRouter, status as http_status

from app.api.deps_payments import AdminUser, TierServiceDep
from app.schemas.professional_tier import (
    ProfessionalTierCreate,
    ProfessionalTierDetailResponse,
    ProfessionalTierListResponse,
    ProfessionalTierResponse,
    ProfessionalTierUpdate,
    TierFeatureCreate,
    TierFeatureResponse,
    TierFeatureUpdate,
)

router = APIRouter(
    prefix="/api/v1/professional-tiers", tags=["professional-tiers"]
)


# ─── PUBLIC ─────────────────────────────────────────────────────
@router.get("", response_model=ProfessionalTierListResponse)
def list_public_tiers(
    service: TierServiceDep,
) -> ProfessionalTierListResponse:
    """Public pricing list — only active & public tiers."""
    return service.list_public_tiers()


@router.get("/{tier_id}", response_model=ProfessionalTierDetailResponse)
def get_tier(
    tier_id: UUID, service: TierServiceDep
) -> ProfessionalTierDetailResponse:
    return service.get_tier_detail(tier_id)


# ─── ADMIN — TIERS ──────────────────────────────────────────────
@router.get("/admin/all", response_model=ProfessionalTierListResponse)
def admin_list_tiers(
    admin: AdminUser,
    service: TierServiceDep,
    skip: int = 0,
    limit: int = 50,
    include_inactive: bool = True,
) -> ProfessionalTierListResponse:
    return service.list_tiers(
        skip=skip, limit=limit, include_inactive=include_inactive
    )


@router.post(
    "/admin",
    response_model=ProfessionalTierResponse,
    status_code=http_status.HTTP_201_CREATED,
)
def admin_create_tier(
    payload: ProfessionalTierCreate,
    admin: AdminUser,
    service: TierServiceDep,
) -> ProfessionalTierResponse:
    tier = service.create_tier(payload)
    return ProfessionalTierResponse.model_validate(tier)


@router.patch(
    "/admin/{tier_id}",
    response_model=ProfessionalTierResponse,
)
def admin_update_tier(
    tier_id: UUID,
    payload: ProfessionalTierUpdate,
    admin: AdminUser,
    service: TierServiceDep,
) -> ProfessionalTierResponse:
    tier = service.update_tier(tier_id, payload)
    return ProfessionalTierResponse.model_validate(tier)


@router.delete(
    "/admin/{tier_id}",
    status_code=http_status.HTTP_204_NO_CONTENT,
)
def admin_delete_tier(
    tier_id: UUID,
    admin: AdminUser,
    service: TierServiceDep,
) -> None:
    service.delete_tier(tier_id)


# ─── ADMIN — FEATURES ───────────────────────────────────────────
@router.post(
    "/admin/{tier_id}/features",
    response_model=TierFeatureResponse,
    status_code=http_status.HTTP_201_CREATED,
)
def admin_create_feature(
    tier_id: UUID,
    payload: TierFeatureCreate,
    admin: AdminUser,
    service: TierServiceDep,
) -> TierFeatureResponse:
    feature = service.create_feature(tier_id, payload)
    return TierFeatureResponse.model_validate(feature)


@router.patch(
    "/admin/features/{feature_id}",
    response_model=TierFeatureResponse,
)
def admin_update_feature(
    feature_id: UUID,
    payload: TierFeatureUpdate,
    admin: AdminUser,
    service: TierServiceDep,
) -> TierFeatureResponse:
    feature = service.update_feature(feature_id, payload)
    return TierFeatureResponse.model_validate(feature)


@router.delete(
    "/admin/features/{feature_id}",
    status_code=http_status.HTTP_204_NO_CONTENT,
)
def admin_delete_feature(
    feature_id: UUID,
    admin: AdminUser,
    service: TierServiceDep,
) -> None:
    service.delete_feature(feature_id)