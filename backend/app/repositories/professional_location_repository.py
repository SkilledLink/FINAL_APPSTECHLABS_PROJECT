from datetime import datetime, timezone
from typing import Optional, Tuple
from uuid import UUID

from geoalchemy2 import Geography
from geoalchemy2.elements import WKTElement
from sqlalchemy import cast, func
from sqlmodel import Session, func as sqlfunc, select

from app.enums.location import ServiceAreaStatus
from app.enums.professional import ProfessionalAccountStatus
from app.models.professional import Professional
from app.models.professional_location import ProfessionalLocation
from app.models.professional_service_area import ProfessionalServiceArea
from app.models.user import User


def _point(lat: float, lng: float) -> WKTElement:
    return WKTElement(f"POINT({lng} {lat})", srid=4326)


class ProfessionalLocationRepository:
    def __init__(self, session: Session):
        self.session = session

    # ─── Locations ──────────────────────────────────────────
    def get_primary(self, professional_id: UUID) -> Optional[ProfessionalLocation]:
        stmt = (
            select(ProfessionalLocation)
            .where(
                ProfessionalLocation.professional_id == professional_id,
                ProfessionalLocation.is_primary.is_(True),
                ProfessionalLocation.deleted_at.is_(None),
            )
            .order_by(ProfessionalLocation.created_at.desc())
        )
        return self.session.exec(stmt).first()

    def get_by_id(
        self, location_id: UUID, include_deleted: bool = False
    ) -> Optional[ProfessionalLocation]:
        stmt = select(ProfessionalLocation).where(
            ProfessionalLocation.id == location_id
        )
        if not include_deleted:
            stmt = stmt.where(ProfessionalLocation.deleted_at.is_(None))
        return self.session.exec(stmt).first()

    def list_for_professional(
        self, professional_id: UUID
    ) -> list[ProfessionalLocation]:
        stmt = (
            select(ProfessionalLocation)
            .where(
                ProfessionalLocation.professional_id == professional_id,
                ProfessionalLocation.deleted_at.is_(None),
            )
            .order_by(
                ProfessionalLocation.is_primary.desc(),
                ProfessionalLocation.created_at.desc(),
            )
        )
        return list(self.session.exec(stmt).all())

    def create(self, location: ProfessionalLocation) -> ProfessionalLocation:
        self.session.add(location)
        self.session.flush()
        return location

    def update(self, location: ProfessionalLocation, **kwargs) -> ProfessionalLocation:
        lat = kwargs.pop("latitude", None)
        lng = kwargs.pop("longitude", None)
        for key, value in kwargs.items():
            if hasattr(location, key):
                setattr(location, key, value)
        if lat is not None and lng is not None:
            location.latitude = lat
            location.longitude = lng
            location.location = _point(lat, lng)
        self.session.add(location)
        self.session.flush()
        return location

    def clear_primary(self, professional_id: UUID) -> None:
        stmt = select(ProfessionalLocation).where(
            ProfessionalLocation.professional_id == professional_id,
            ProfessionalLocation.is_primary.is_(True),
            ProfessionalLocation.deleted_at.is_(None),
        )
        for loc in self.session.exec(stmt).all():
            loc.is_primary = False
            self.session.add(loc)

    def soft_delete(self, location: ProfessionalLocation) -> None:
        location.deleted_at = datetime.now(timezone.utc)
        self.session.add(location)
        self.session.flush()

    # ─── Service areas ──────────────────────────────────────
    def get_service_area(
        self, area_id: UUID
    ) -> Optional[ProfessionalServiceArea]:
        return self.session.get(ProfessionalServiceArea, area_id)

    def list_service_areas(
        self, professional_id: UUID
    ) -> list[ProfessionalServiceArea]:
        stmt = (
            select(ProfessionalServiceArea)
            .where(ProfessionalServiceArea.professional_id == professional_id)
            .order_by(ProfessionalServiceArea.created_at.desc())
        )
        return list(self.session.exec(stmt).all())

    def create_service_area(
        self, area: ProfessionalServiceArea
    ) -> ProfessionalServiceArea:
        self.session.add(area)
        self.session.flush()
        return area

    def update_service_area(
        self, area: ProfessionalServiceArea, **kwargs
    ) -> ProfessionalServiceArea:
        lat = kwargs.pop("center_latitude", None)
        lng = kwargs.pop("center_longitude", None)
        for key, value in kwargs.items():
            if hasattr(area, key):
                setattr(area, key, value)
        if lat is not None and lng is not None:
            area.center_latitude = lat
            area.center_longitude = lng
            area.center = _point(lat, lng)
        self.session.add(area)
        self.session.flush()
        return area

    def delete_service_area(self, area: ProfessionalServiceArea) -> None:
        self.session.delete(area)
        self.session.flush()

    # ─── Nearby search (PostGIS) ────────────────────────────
    def find_nearby(
        self,
        latitude: float,
        longitude: float,
        radius_km: float,
        skip: int = 0,
        limit: int = 20,
        profession: Optional[str] = None,
        available_only: bool = True,
        verified_only: bool = False,
    ) -> Tuple[list[dict], int]:
        radius_m = radius_km * 1000.0

        # Build the search point as a proper SQLAlchemy expression.
        # Parameters (longitude, latitude, radius_m) become bound params
        # automatically — no :name syntax needed, no raw SQL.
        search_point = cast(
            func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326),
            Geography,
        )
        location_geog = cast(ProfessionalLocation.location, Geography)

        within_expr = func.ST_DWithin(location_geog, search_point, radius_m)
        distance_expr = func.ST_Distance(location_geog, search_point)

        base_filters = [
            Professional.deleted_at.is_(None),
            Professional.status == ProfessionalAccountStatus.ACTIVE,
            ProfessionalLocation.deleted_at.is_(None),
            ProfessionalLocation.is_primary.is_(True),
        ]
        if available_only:
            base_filters.append(Professional.available.is_(True))
        if verified_only:
            base_filters.append(Professional.is_verified.is_(True))
        if profession:
            base_filters.append(Professional.profession.ilike(f"%{profession}%"))

        # Count
        count_stmt = (
            select(sqlfunc.count(Professional.id))
            .select_from(Professional)
            .join(
                ProfessionalLocation,
                ProfessionalLocation.professional_id == Professional.id,
            )
            .where(*base_filters)
            .where(within_expr)
        )
        total = self.session.exec(count_stmt).first() or 0

        # Fetch
        stmt = (
            select(
                Professional,
                ProfessionalLocation,
                distance_expr.label("distance_m"),
            )
            .join(
                ProfessionalLocation,
                ProfessionalLocation.professional_id == Professional.id,
            )
            .where(*base_filters)
            .where(within_expr)
            .order_by(distance_expr)
            .offset(skip)
            .limit(limit)
        )
        rows = self.session.exec(stmt).all()

        results = []
        for row in rows:
            professional, location, distance_m = row
            results.append(
                {
                    "professional": professional,
                    "location": location,
                    "distance_km": round(float(distance_m) / 1000.0, 2),
                }
            )
        return results, total

    # ─── Load user for a list of professionals ──────────────
    def load_users(self, user_ids: list[UUID]) -> dict[UUID, User]:
        if not user_ids:
            return {}
        stmt = select(User).where(User.id.in_(user_ids))
        users = self.session.exec(stmt).all()
        return {u.id: u for u in users}