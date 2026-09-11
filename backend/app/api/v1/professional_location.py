from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.current_user import get_current_user
from app.models.user import User
from app.schemas.location import (
    NearbyProfessionalListResponse,
    ProfessionalLocationCreate,
    ProfessionalLocationResponse,
    ProfessionalLocationUpdate,
    ServiceAreaCreate,
    ServiceAreaListResponse,
    ServiceAreaResponse,
    ServiceAreaUpdate,
)
from app.services.professional_location_service import (
    ProfessionalLocationService,
)

router = APIRouter(prefix="/professionals", tags=["professional-location"])


# ─── Nearby (public) ────────────────────────────────────────
# IMPORTANT: register this BEFORE /{professional_id} in main.py.

@router.get("/nearby", response_model=NearbyProfessionalListResponse)
def find_nearby_professionals(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(10.0, ge=0.5, le=200),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    profession: Optional[str] = Query(None, max_length=100),
    available_only: bool = Query(True),
    verified_only: bool = Query(False),
    session: Session = Depends(get_session),
):
    service = ProfessionalLocationService(session)
    return service.find_nearby(
        latitude=lat,
        longitude=lng,
        radius_km=radius_km,
        skip=skip,
        limit=limit,
        profession=profession,
        available_only=available_only,
        verified_only=verified_only,
    )


# ─── My primary location ────────────────────────────────────

@router.get(
    "/me/location",
    response_model=ProfessionalLocationResponse,
)
def get_my_location(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return ProfessionalLocationService(session).get_my_location(current_user)


@router.put(
    "/me/location",
    response_model=ProfessionalLocationResponse,
)
def set_my_location(
    data: ProfessionalLocationCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return ProfessionalLocationService(session).set_my_location(
        current_user, data
    )


@router.patch(
    "/me/location",
    response_model=ProfessionalLocationResponse,
)
def update_my_location(
    data: ProfessionalLocationUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return ProfessionalLocationService(session).update_my_location(
        current_user, data
    )


@router.delete(
    "/me/location",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_my_location(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    ProfessionalLocationService(session).delete_my_location(current_user)
    return None


# ─── My service areas ───────────────────────────────────────

@router.get(
    "/me/service-areas",
    response_model=ServiceAreaListResponse,
)
def list_service_areas(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return ProfessionalLocationService(session).list_service_areas(current_user)


@router.post(
    "/me/service-areas",
    response_model=ServiceAreaResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_service_area(
    data: ServiceAreaCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return ProfessionalLocationService(session).create_service_area(
        current_user, data
    )


@router.patch(
    "/me/service-areas/{area_id}",
    response_model=ServiceAreaResponse,
)
def update_service_area(
    area_id: UUID,
    data: ServiceAreaUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return ProfessionalLocationService(session).update_service_area(
        current_user, area_id, data
    )


@router.delete(
    "/me/service-areas/{area_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_service_area(
    area_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    ProfessionalLocationService(session).delete_service_area(
        current_user, area_id
    )
    return None