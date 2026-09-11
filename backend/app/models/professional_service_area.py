from datetime import datetime, timezone
from typing import Any, Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from geoalchemy2 import Geometry
from sqlalchemy import Column
from sqlmodel import Field, Relationship, SQLModel

from app.enums.location import ServiceAreaStatus

if TYPE_CHECKING:
    from app.models.professional import Professional


class ProfessionalServiceArea(SQLModel, table=True):
    __tablename__ = "professional_service_areas"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    professional_id: UUID = Field(
        foreign_key="professionals.id", index=True, nullable=False
    )

    center: Any = Field(
        sa_column=Column(
            Geometry(geometry_type="POINT", srid=4326, spatial_index=True),
            nullable=False,
        )
    )

    center_latitude: float = Field(nullable=False)
    center_longitude: float = Field(nullable=False)

    radius_km: float = Field(nullable=False, ge=0.5, le=500)
    area_name: str = Field(nullable=False, max_length=255)
    status: ServiceAreaStatus = Field(
        default=ServiceAreaStatus.ACTIVE, nullable=False
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    professional: Optional["Professional"] = Relationship(
        back_populates="service_areas"
    )