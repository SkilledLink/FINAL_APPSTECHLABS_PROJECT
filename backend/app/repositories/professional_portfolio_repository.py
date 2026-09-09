from typing import Optional, List, Tuple
from uuid import UUID
from sqlmodel import Session, select, func
from sqlalchemy import cast
from sqlalchemy.types import UUID as SQL_UUID
from app.models.professional_portfolio import (
    ProfessionalPortfolio, PortfolioWork, ProfessionalService,
    ProfessionalAvailability, ProfessionalCategory, ProfessionalSpecialty,
    PortfolioSpecialty
)
from app.models.user import User
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


class ProfessionalPortfolioRepository:
    def __init__(self, session: Session):
        self.session = session

    # ---------- Portfolio ----------
    def create(self, user: User, data: dict) -> ProfessionalPortfolio:
        portfolio = ProfessionalPortfolio(user_id=user.id, **data)
        self.session.add(portfolio)
        self.session.flush()
        return portfolio

    def get_by_user_id(self, user_id: UUID) -> Optional[ProfessionalPortfolio]:
        """
        Fetch a portfolio by user ID.
        Ensures the query uses the correct UUID type.
        """
        # If user_id is a string, convert to UUID
        if not isinstance(user_id, UUID):
            try:
                user_id = UUID(str(user_id))
            except Exception as e:
                logger.error(f"Invalid user_id format: {user_id} -> {e}")
                raise ValueError(f"Invalid user_id format: {user_id}") from e

        logger.info(f"Repository: querying portfolio for user_id={user_id} (type={type(user_id)})")
        try:
            # Explicitly cast to UUID in the query to avoid type mismatch
            stmt = select(ProfessionalPortfolio).where(
                ProfessionalPortfolio.user_id == cast(user_id, SQL_UUID)
            )
            return self.session.exec(stmt).first()
        except Exception as e:
            logger.error(f"Database error in get_by_user_id: {e}")
            raise

    def get_by_id(self, portfolio_id: UUID) -> Optional[ProfessionalPortfolio]:
        stmt = select(ProfessionalPortfolio).where(ProfessionalPortfolio.id == portfolio_id)
        return self.session.exec(stmt).first()

    def update(self, portfolio: ProfessionalPortfolio, data: dict) -> ProfessionalPortfolio:
        for key, value in data.items():
            setattr(portfolio, key, value)
        portfolio.updated_at = datetime.now(timezone.utc)
        self.session.add(portfolio)
        self.session.flush()
        return portfolio

    # ---------- Specialties ----------
    def add_specialties(self, portfolio: ProfessionalPortfolio, specialty_ids: List[UUID]) -> None:
        for sid in specialty_ids:
            ps = PortfolioSpecialty(portfolio_id=portfolio.id, specialty_id=sid)
            self.session.add(ps)
        self.session.flush()

    def remove_specialties(self, portfolio: ProfessionalPortfolio) -> None:
        stmt = select(PortfolioSpecialty).where(PortfolioSpecialty.portfolio_id == portfolio.id)
        existing = self.session.exec(stmt).all()
        for ps in existing:
            self.session.delete(ps)
        self.session.flush()

    # ---------- Works ----------
    def create_work(self, portfolio: ProfessionalPortfolio, data: dict) -> PortfolioWork:
        work = PortfolioWork(portfolio_id=portfolio.id, **data)
        self.session.add(work)
        self.session.flush()
        return work

    def get_work(self, work_id: UUID) -> Optional[PortfolioWork]:
        return self.session.get(PortfolioWork, work_id)

    def get_works(self, portfolio: ProfessionalPortfolio) -> List[PortfolioWork]:
        stmt = select(PortfolioWork).where(PortfolioWork.portfolio_id == portfolio.id).order_by(PortfolioWork.created_at.desc())
        return self.session.exec(stmt).all()

    def update_work(self, work: PortfolioWork, data: dict) -> PortfolioWork:
        for key, value in data.items():
            setattr(work, key, value)
        work.updated_at = datetime.now(timezone.utc)
        self.session.add(work)
        self.session.flush()
        return work

    def delete_work(self, work: PortfolioWork) -> None:
        self.session.delete(work)
        self.session.flush()

    # ---------- Services ----------
    def create_service(self, portfolio: ProfessionalPortfolio, data: dict) -> ProfessionalService:
        service = ProfessionalService(portfolio_id=portfolio.id, **data)
        self.session.add(service)
        self.session.flush()
        return service

    def get_service(self, service_id: UUID) -> Optional[ProfessionalService]:
        return self.session.get(ProfessionalService, service_id)

    def get_services(self, portfolio: ProfessionalPortfolio) -> List[ProfessionalService]:
        stmt = select(ProfessionalService).where(ProfessionalService.portfolio_id == portfolio.id)
        return self.session.exec(stmt).all()

    def update_service(self, service: ProfessionalService, data: dict) -> ProfessionalService:
        for key, value in data.items():
            setattr(service, key, value)
        service.updated_at = datetime.now(timezone.utc)
        self.session.add(service)
        self.session.flush()
        return service

    def delete_service(self, service: ProfessionalService) -> None:
        self.session.delete(service)
        self.session.flush()

    # ---------- Availability ----------
    def create_availability(self, portfolio: ProfessionalPortfolio, data: dict) -> ProfessionalAvailability:
        avail = ProfessionalAvailability(portfolio_id=portfolio.id, **data)
        self.session.add(avail)
        self.session.flush()
        return avail

    def get_availability(self, portfolio: ProfessionalPortfolio) -> List[ProfessionalAvailability]:
        stmt = select(ProfessionalAvailability).where(ProfessionalAvailability.portfolio_id == portfolio.id)
        return self.session.exec(stmt).all()

    def update_availability(self, avail: ProfessionalAvailability, data: dict) -> ProfessionalAvailability:
        for key, value in data.items():
            setattr(avail, key, value)
        avail.updated_at = datetime.now(timezone.utc)
        self.session.add(avail)
        self.session.flush()
        return avail

    def delete_availability(self, avail: ProfessionalAvailability) -> None:
        self.session.delete(avail)
        self.session.flush()

    def clear_availability(self, portfolio: ProfessionalPortfolio) -> None:
        stmt = select(ProfessionalAvailability).where(ProfessionalAvailability.portfolio_id == portfolio.id)
        avails = self.session.exec(stmt).all()
        for a in avails:
            self.session.delete(a)
        self.session.flush()

    # ---------- Categories & Specialties (read‑only) ----------
    def get_categories(self) -> List[ProfessionalCategory]:
        stmt = select(ProfessionalCategory).order_by(ProfessionalCategory.name)
        return self.session.exec(stmt).all()

    def get_specialties(self, category_id: Optional[UUID] = None) -> List[ProfessionalSpecialty]:
        stmt = select(ProfessionalSpecialty)
        if category_id:
            stmt = stmt.where(ProfessionalSpecialty.category_id == category_id)
        return self.session.exec(stmt).all()

    def get_specialty_ids(self, portfolio: ProfessionalPortfolio) -> List[UUID]:
        stmt = select(PortfolioSpecialty.specialty_id).where(PortfolioSpecialty.portfolio_id == portfolio.id)
        return self.session.exec(stmt).all()