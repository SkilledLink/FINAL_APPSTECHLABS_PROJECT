from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID, uuid4

from sqlalchemy import JSON, DECIMAL
from sqlmodel import Column, Field, Relationship, SQLModel

from app.models.user import User
from app.enums.professional import (
    DurationUnit,
    ClientType,
    PricingType,
    AvailabilityDay,
)


class ProfessionalCategory(SQLModel, table=True):
    __tablename__ = "professional_categories"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(unique=True, nullable=False, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    specialties: List["ProfessionalSpecialty"] = Relationship(back_populates="category")


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
        link_model=PortfolioSpecialty,
    )


class ProfessionalPortfolio(SQLModel, table=True):
    __tablename__ = "professional_portfolios"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", unique=True, nullable=False, index=True)

    # ── Core identity ────────────────────────────────────
    headline: Optional[str] = Field(default=None, max_length=200)
    tagline: Optional[str] = Field(default=None, max_length=160)
    bio: Optional[str] = Field(default=None, max_length=2000)
    mission_statement: Optional[str] = Field(default=None, max_length=1000)

    # ── Business ─────────────────────────────────────────
    business_name: Optional[str] = Field(default=None, max_length=100)
    business_description: Optional[str] = Field(default=None, max_length=1000)
    years_experience: Optional[int] = Field(default=None, ge=0)
    years_in_business: Optional[int] = Field(default=None, ge=0)
    team_size: Optional[int] = Field(default=None, ge=1)

    # ── Media ────────────────────────────────────────────
    cover_image_url: Optional[str] = Field(default=None, max_length=500)
    intro_video_url: Optional[str] = Field(default=None, max_length=500)

    # ── Contact ──────────────────────────────────────────
    phone: Optional[str] = Field(default=None, max_length=20)
    whatsapp: Optional[str] = Field(default=None, max_length=30)
    email: Optional[str] = Field(default=None, max_length=255)

    # ── Social links ─────────────────────────────────────
    website_url: Optional[str] = Field(default=None, max_length=300)
    linkedin_url: Optional[str] = Field(default=None, max_length=300)
    facebook_url: Optional[str] = Field(default=None, max_length=300)
    instagram_url: Optional[str] = Field(default=None, max_length=300)
    tiktok_url: Optional[str] = Field(default=None, max_length=300)

    # ── Coverage ─────────────────────────────────────────
    country: Optional[str] = Field(default=None, max_length=100)
    region: Optional[str] = Field(default=None, max_length=100)
    city: Optional[str] = Field(default=None, max_length=100)
    service_area: Optional[str] = Field(default=None, max_length=200)
    service_radius_km: Optional[float] = Field(
        default=None, sa_column=Column(DECIMAL(6, 2))
    )
    travels_to_client: bool = Field(default=True, nullable=False)
    works_remotely: bool = Field(default=False, nullable=False)

    # ── Trust & credibility ──────────────────────────────
    license_number: Optional[str] = Field(default=None, max_length=100)
    license_authority: Optional[str] = Field(default=None, max_length=150)
    insurance_provider: Optional[str] = Field(default=None, max_length=150)

    # ── Pricing ──────────────────────────────────────────
    currency: str = Field(default="XAF", max_length=3, nullable=False)
    payment_methods: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    accepts_negotiation: bool = Field(default=True, nullable=False)

    # ── Discovery ────────────────────────────────────────
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    languages: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))

    # ── Reputation ───────────────────────────────────────
    average_rating: Optional[float] = Field(
        default=None, sa_column=Column(DECIMAL(3, 2))
    )
    total_reviews: int = Field(default=0, nullable=False)

    # ── Flags ────────────────────────────────────────────
    is_verified: bool = Field(default=False, nullable=False)
    is_public: bool = Field(default=True, nullable=False)

    # ── Marketing ────────────────────────────────────────
    is_featured: bool = Field(default=False, nullable=False)
    featured_until: Optional[datetime] = Field(default=None)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # ── Relationships ────────────────────────────────────
    user: "User" = Relationship(back_populates="portfolio")
    specialties: List[ProfessionalSpecialty] = Relationship(
        back_populates="portfolios",
        link_model=PortfolioSpecialty,
    )
    works: List["PortfolioWork"] = Relationship(
        back_populates="portfolio",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    services: List["ProfessionalService"] = Relationship(
        back_populates="portfolio",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    availabilities: List["ProfessionalAvailability"] = Relationship(
        back_populates="portfolio",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class PortfolioWork(SQLModel, table=True):
    __tablename__ = "portfolio_works"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    portfolio_id: UUID = Field(
        foreign_key="professional_portfolios.id", nullable=False, index=True
    )

    title: str = Field(nullable=False, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    service_category: Optional[str] = Field(default=None, max_length=100)
    location: Optional[str] = Field(default=None, max_length=200)
    completed_at: Optional[datetime] = Field(default=None)
    duration_value: Optional[int] = Field(default=None, ge=0)
    duration_unit: Optional[DurationUnit] = Field(default=None)
    team_size: Optional[int] = Field(default=None, ge=1)
    client_type: Optional[ClientType] = Field(default=None)

    # ── New: rich case study ─────────────────────────────
    gallery: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    cost: Optional[float] = Field(default=None, sa_column=Column(DECIMAL(12, 2)))
    client_name: Optional[str] = Field(default=None, max_length=150)
    client_testimonial: Optional[str] = Field(default=None, max_length=1500)
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    service_id: Optional[UUID] = Field(
        default=None,
        foreign_key="professional_services.id",
        nullable=True,
        index=True,
    )

    # ── Legacy before/after (kept) ───────────────────────
    before_image_url: Optional[str] = Field(default=None)
    after_image_url: Optional[str] = Field(default=None)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    portfolio: ProfessionalPortfolio = Relationship(back_populates="works")


class ProfessionalService(SQLModel, table=True):
    __tablename__ = "professional_services"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    portfolio_id: UUID = Field(
        foreign_key="professional_portfolios.id", nullable=False, index=True
    )

    title: str = Field(nullable=False, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    category: Optional[str] = Field(default=None, max_length=100)
    starting_price: Optional[float] = Field(default=None)
    pricing_type: Optional[PricingType] = Field(default=None)
    estimated_duration: Optional[str] = Field(default=None, max_length=50)
    service_area: Optional[str] = Field(default=None, max_length=200)
    is_active: bool = Field(default=True)
    is_emergency_service: bool = Field(default=False)

    # ── New: richer service detail ───────────────────────
    banner_image_url: Optional[str] = Field(default=None, max_length=500)
    gallery: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    whats_included: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    whats_excluded: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    warranty_days: Optional[int] = Field(default=None, ge=0)
    lead_time_days: Optional[int] = Field(default=None, ge=0)
    promo_price: Optional[float] = Field(default=None, sa_column=Column(DECIMAL(12, 2)))
    promo_until: Optional[datetime] = Field(default=None)
    faqs: Optional[List[dict]] = Field(default=None, sa_column=Column(JSON))

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    portfolio: ProfessionalPortfolio = Relationship(back_populates="services")


class ProfessionalAvailability(SQLModel, table=True):
    __tablename__ = "professional_availability"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    portfolio_id: UUID = Field(
        foreign_key="professional_portfolios.id", nullable=False, index=True
    )

    day_of_week: AvailabilityDay = Field(nullable=False)
    start_time: Optional[str] = Field(default=None, max_length=10)
    end_time: Optional[str] = Field(default=None, max_length=10)
    is_available: bool = Field(default=True)

    # ── New: finer schedule ──────────────────────────────
    break_start: Optional[str] = Field(default=None, max_length=10)
    break_end: Optional[str] = Field(default=None, max_length=10)
    timezone: Optional[str] = Field(default=None, max_length=50)
    notes: Optional[str] = Field(default=None, max_length=300)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    portfolio: ProfessionalPortfolio = Relationship(back_populates="availabilities")