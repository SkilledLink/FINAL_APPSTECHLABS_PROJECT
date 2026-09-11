from datetime import datetime, timezone
from typing import Any, Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from geoalchemy2 import Geometry
from sqlalchemy import Column
from sqlmodel import Field, Relationship, SQLModel

from app.enums.location import LocationType

if TYPE_CHECKING:
    from app.models.professional import Professional


class ProfessionalLocation(SQLModel, table=True):
    __tablename__ = "professional_locations"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    professional_id: UUID = Field(
        foreign_key="professionals.id", index=True, nullable=False
    )

    location: Any = Field(
        sa_column=Column(
            Geometry(geometry_type="POINT", srid=4326, spatial_index=True),
            nullable=False,
        )
    )

    latitude: float = Field(nullable=False)
    longitude: float = Field(nullable=False)

    location_name: str = Field(nullable=False, max_length=255)
    location_type: LocationType = Field(default=LocationType.HOME, nullable=False)
    is_primary: bool = Field(default=False, nullable=False)

    country: Optional[str] = Field(default=None, max_length=100)
    country_code: Optional[str] = Field(default=None, max_length=2)
    region: Optional[str] = Field(default=None, max_length=100)
    city: Optional[str] = Field(default=None, max_length=100)
    area: Optional[str] = Field(default=None, max_length=150)
    postcode: Optional[str] = Field(default=None, max_length=20)

    deleted_at: Optional[datetime] = Field(default=None, nullable=True)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    professional: Optional["Professional"] = Relationship(
        back_populates="locations"
    )