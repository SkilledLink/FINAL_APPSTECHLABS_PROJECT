from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel

from app.models.user import User
from app.enums.professional import DurationUnit, ClientType, PricingType, AvailabilityDay


class ProfessionalCategory(SQLModel, table=True):
    __tablename__ = "professional_categories"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(unique=True, nullable=False, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    specialties: List["ProfessionalSpecialty"] = Relationship(back_populates="category")


# Junction table must be defined before the two main tables
class PortfolioSpecialty(SQLModel, table=True):
    __tablename__ = "portfolio_specialties"

    portfolio_id: UUID = Field(foreign_key="professional_portfolios.id", primary_key=True)
    specialty_id: UUID = Field(foreign_key="professional_specialties.id", primary_key=True)


class ProfessionalSpecialty(SQLModel, table=True):
    __tablename__ = "professional_specialties"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    category_id: UUID = Field(foreign_key="professional_categories.id", nullable=False, index=True)
    name: str = Field(nullable=False, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    category: ProfessionalCategory = Relationship(back_populates="specialties")
    portfolios: List["ProfessionalPortfolio"] = Relationship(
        back_populates="specialties",
        link_model=PortfolioSpecialty
    )


class ProfessionalPortfolio(SQLModel, table=True):
    __tablename__ = "professional_portfolios"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", unique=True, nullable=False, index=True)

    headline: Optional[str] = Field(default=None, max_length=200)
    bio: Optional[str] = Field(default=None, max_length=2000)
    years_experience: Optional[int] = Field(default=None, ge=0)
    business_name: Optional[str] = Field(default=None, max_length=100)
    business_description: Optional[str] = Field(default=None, max_length=1000)
    service_area: Optional[str] = Field(default=None, max_length=200)
    phone: Optional[str] = Field(default=None, max_length=20)
    is_verified: bool = Field(default=False)
    is_public: bool = Field(default=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: "User" = Relationship(back_populates="portfolio")
    specialties: List[ProfessionalSpecialty] = Relationship(
        back_populates="portfolios",
        link_model=PortfolioSpecialty
    )
    works: List["PortfolioWork"] = Relationship(
        back_populates="portfolio",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    services: List["ProfessionalService"] = Relationship(
        back_populates="portfolio",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    availabilities: List["ProfessionalAvailability"] = Relationship(
        back_populates="portfolio",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class PortfolioWork(SQLModel, table=True):
    __tablename__ = "portfolio_works"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    portfolio_id: UUID = Field(foreign_key="professional_portfolios.id", nullable=False, index=True)

    title: str = Field(nullable=False, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    service_category: Optional[str] = Field(default=None, max_length=100)
    location: Optional[str] = Field(default=None, max_length=200)
    completed_at: Optional[datetime] = Field(default=None)
    duration_value: Optional[int] = Field(default=None, ge=0)
    duration_unit: Optional[DurationUnit] = Field(default=None)
    team_size: Optional[int] = Field(default=None, ge=1)
    client_type: Optional[ClientType] = Field(default=None)

    before_image_url: Optional[str] = Field(default=None)
    after_image_url: Optional[str] = Field(default=None)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    portfolio: ProfessionalPortfolio = Relationship(back_populates="works")


class ProfessionalService(SQLModel, table=True):
    __tablename__ = "professional_services"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    portfolio_id: UUID = Field(foreign_key="professional_portfolios.id", nullable=False, index=True)

    title: str = Field(nullable=False, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    category: Optional[str] = Field(default=None, max_length=100)
    starting_price: Optional[float] = Field(default=None)
    pricing_type: Optional[PricingType] = Field(default=None)
    estimated_duration: Optional[str] = Field(default=None, max_length=50)
    service_area: Optional[str] = Field(default=None, max_length=200)
    is_active: bool = Field(default=True)
    is_emergency_service: bool = Field(default=False)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    portfolio: ProfessionalPortfolio = Relationship(back_populates="services")


class ProfessionalAvailability(SQLModel, table=True):
    __tablename__ = "professional_availability"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    portfolio_id: UUID = Field(foreign_key="professional_portfolios.id", nullable=False, index=True)

    day_of_week: AvailabilityDay = Field(nullable=False)
    start_time: Optional[str] = Field(default=None, max_length=10)
    end_time: Optional[str] = Field(default=None, max_length=10)
    is_available: bool = Field(default=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    portfolio: ProfessionalPortfolio = Relationship(back_populates="availabilities")