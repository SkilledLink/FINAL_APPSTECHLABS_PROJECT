import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.config import settings
from app.enums.location import ServiceAreaStatus
from app.models.professional import Professional
from app.models.professional_location import ProfessionalLocation
from app.models.professional_service_area import ProfessionalServiceArea
from app.models.user import User
from app.repositories.professional_location_repository import (
    ProfessionalLocationRepository,
    _point,
)
from app.repositories.professional_repository import ProfessionalRepository
from app.schemas.location import (
    NearbyProfessional,
    NearbyProfessionalListResponse,
    NearbyProfessionalUser,
    ProfessionalLocationCreate,
    ProfessionalLocationResponse,
    ProfessionalLocationUpdate,
    PublicLocationResponse,
    ServiceAreaCreate,
    ServiceAreaListResponse,
    ServiceAreaResponse,
    ServiceAreaUpdate,
)

logger = logging.getLogger(__name__)


class ProfessionalLocationService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = ProfessionalLocationRepository(session)
        self.prof_repo = ProfessionalRepository(session)

    # ─── Auth guard ─────────────────────────────────────────
    def _get_my_professional(self, user: User) -> Professional:
        professional = self.prof_repo.get_by_user_id(user.id)
        if not professional:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="You do not have a professional profile",
            )
        return professional

    # ─── Primary location ───────────────────────────────────
    def get_my_location(self, user: User) -> ProfessionalLocationResponse:
        professional = self._get_my_professional(user)
        location = self.repo.get_primary(professional.id)
        if not location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No primary location set",
            )
        return ProfessionalLocationResponse.model_validate(location)

    def set_my_location(
        self, user: User, data: ProfessionalLocationCreate
    ) -> ProfessionalLocationResponse:
        professional = self._get_my_professional(user)

        existing = self.repo.get_primary(professional.id)

        if existing:
            updated = self.repo.update(
                existing,
                latitude=data.latitude,
                longitude=data.longitude,
                location_name=data.location_name,
                location_type=data.location_type,
                country=data.country,
                country_code=data.country_code,
                region=data.region,
                city=data.city,
                area=data.area,
                postcode=data.postcode,
                is_primary=True,
                updated_at=datetime.now(timezone.utc),
            )
            self._sync_professional_summary(professional, updated)
            self.session.commit()
            self.session.refresh(updated)
            return ProfessionalLocationResponse.model_validate(updated)

        location = ProfessionalLocation(
            professional_id=professional.id,
            location=_point(data.latitude, data.longitude),
            latitude=data.latitude,
            longitude=data.longitude,
            location_name=data.location_name,
            location_type=data.location_type,
            is_primary=True,
            country=data.country,
            country_code=data.country_code,
            region=data.region,
            city=data.city,
            area=data.area,
            postcode=data.postcode,
        )
        self.repo.create(location)
        self._sync_professional_summary(professional, location)
        self.session.commit()
        self.session.refresh(location)
        return ProfessionalLocationResponse.model_validate(location)

    def update_my_location(
        self, user: User, data: ProfessionalLocationUpdate
    ) -> ProfessionalLocationResponse:
        professional = self._get_my_professional(user)
        location = self.repo.get_primary(professional.id)
        if not location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No primary location set — create one first",
            )

        update_kwargs = data.model_dump(exclude_unset=True, exclude_none=True)
        updated = self.repo.update(
            location,
            updated_at=datetime.now(timezone.utc),
            **update_kwargs,
        )
        self._sync_professional_summary(professional, updated)
        self.session.commit()
        self.session.refresh(updated)
        return ProfessionalLocationResponse.model_validate(updated)

    def delete_my_location(self, user: User) -> None:
        professional = self._get_my_professional(user)
        location = self.repo.get_primary(professional.id)
        if not location:
            return
        self.repo.soft_delete(location)
        self.session.commit()

    # ─── Service areas ──────────────────────────────────────
    def list_service_areas(self, user: User) -> ServiceAreaListResponse:
        professional = self._get_my_professional(user)
        areas = self.repo.list_service_areas(professional.id)
        return ServiceAreaListResponse(
            items=[ServiceAreaResponse.model_validate(a) for a in areas],
            total=len(areas),
        )

    def create_service_area(
        self, user: User, data: ServiceAreaCreate
    ) -> ServiceAreaResponse:
        professional = self._get_my_professional(user)
        area = ProfessionalServiceArea(
            professional_id=professional.id,
            center=_point(data.center_latitude, data.center_longitude),
            center_latitude=data.center_latitude,
            center_longitude=data.center_longitude,
            radius_km=data.radius_km,
            area_name=data.area_name,
            status=ServiceAreaStatus.ACTIVE,
        )
        self.repo.create_service_area(area)
        self.session.commit()
        self.session.refresh(area)
        return ServiceAreaResponse.model_validate(area)

    def update_service_area(
        self, user: User, area_id: UUID, data: ServiceAreaUpdate
    ) -> ServiceAreaResponse:
        professional = self._get_my_professional(user)
        area = self.repo.get_service_area(area_id)
        if not area or area.professional_id != professional.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service area not found",
            )
        kwargs = data.model_dump(exclude_unset=True, exclude_none=True)
        updated = self.repo.update_service_area(
            area,
            updated_at=datetime.now(timezone.utc),
            **kwargs,
        )
        self.session.commit()
        self.session.refresh(updated)
        return ServiceAreaResponse.model_validate(updated)

    def delete_service_area(self, user: User, area_id: UUID) -> None:
        professional = self._get_my_professional(user)
        area = self.repo.get_service_area(area_id)
        if not area or area.professional_id != professional.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service area not found",
            )
        self.repo.delete_service_area(area)
        self.session.commit()

    # ─── Nearby search ──────────────────────────────────────
    def find_nearby(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 10.0,
        skip: int = 0,
        limit: int = 20,
        profession: Optional[str] = None,
        available_only: bool = True,
        verified_only: bool = False,
    ) -> NearbyProfessionalListResponse:
        if not (settings.LOCATION_MIN_RADIUS_KM <= radius_km <= settings.LOCATION_MAX_RADIUS_KM):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"radius_km must be between "
                    f"{settings.LOCATION_MIN_RADIUS_KM} and "
                    f"{settings.LOCATION_MAX_RADIUS_KM}"
                ),
            )
        limit = min(limit, settings.NEARBY_MAX_RESULTS)

        rows, total = self.repo.find_nearby(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            skip=skip,
            limit=limit,
            profession=profession,
            available_only=available_only,
            verified_only=verified_only,
        )

        user_ids = [r["professional"].user_id for r in rows]
        users = self.repo.load_users(user_ids)

        items: list[NearbyProfessional] = []
        for r in rows:
            professional: Professional = r["professional"]
            location: ProfessionalLocation = r["location"]
            user = users.get(professional.user_id)
            if not user:
                continue

            items.append(
                NearbyProfessional(
                    id=professional.id,
                    profession=professional.profession,
                    headline=professional.headline,
                    company_name=professional.company_name,
                    years_of_experience=professional.years_of_experience,
                    skills=professional.skills,
                    services=professional.services,
                    hourly_rate=float(professional.hourly_rate)
                    if professional.hourly_rate is not None
                    else None,
                    currency=professional.currency or "XAF",
                    available=professional.available,
                    is_verified=professional.is_verified,
                    rating=float(professional.rating or 0.0),
                    total_reviews=professional.total_reviews,
                    completed_jobs=professional.completed_jobs,
                    profile_completeness=professional.profile_completeness,
                    user=NearbyProfessionalUser(
                        id=user.id,
                        username=f"{user.first_name} {user.last_name}".strip() or user.email,
                        first_name=user.first_name,
                        last_name=user.last_name,
                        profile_image_url=user.profile_image_url,
                    ),
                    public_location=self._fuzz_location(location),
                    distance_km=r["distance_km"],
                )
            )

        search_center = PublicLocationResponse(
            display_name=f"{round(latitude, 2)}, {round(longitude, 2)}",
            latitude=round(latitude, settings.LOCATION_PUBLIC_FUZZ_DECIMALS),
            longitude=round(longitude, settings.LOCATION_PUBLIC_FUZZ_DECIMALS),
        )

        return NearbyProfessionalListResponse(
            items=items,
            total=total,
            page=skip // limit + 1 if limit else 1,
            size=limit,
            search_center=search_center,
        )

    # ─── Helpers ────────────────────────────────────────────
    def _fuzz_location(
        self, location: ProfessionalLocation
    ) -> PublicLocationResponse:
        decimals = settings.LOCATION_PUBLIC_FUZZ_DECIMALS
        display = ", ".join(
            [p for p in [location.area, location.city, location.region] if p]
        ) or location.location_name
        return PublicLocationResponse(
            display_name=display,
            latitude=round(location.latitude, decimals),
            longitude=round(location.longitude, decimals),
            city=location.city,
            region=location.region,
            country=location.country,
        )

    def _sync_professional_summary(
        self, professional: Professional, location: ProfessionalLocation
    ) -> None:
        """Keep the denormalized fields on Professional in sync for fast listing."""
        professional.country = location.country or professional.country
        professional.region = location.region or professional.region
        professional.city = location.city or professional.city
        professional.updated_at = datetime.now(timezone.utc)
        self.session.add(professional)