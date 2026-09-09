import logging
from typing import List, Optional, Set
from uuid import UUID

from sqlmodel import Session, select
from app.models.professional import Professional
from app.models.professional_portfolio import (
    ProfessionalPortfolio, ProfessionalService, PortfolioWork,
    ProfessionalSpecialty, PortfolioSpecialty
)
from app.repositories.professional_repository import ProfessionalRepository
from app.repositories.professional_portfolio_repository import ProfessionalPortfolioRepository
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)

class IndexingService:
    def __init__(self, session: Session):
        self.session = session
        self.prof_repo = ProfessionalRepository(session)
        self.portfolio_repo = ProfessionalPortfolioRepository(session)
        self.embedding_service = EmbeddingService()

    def regenerate_vector(self, user_id: UUID) -> None:
        """
        Fetch all relevant data for a professional, compile a text blob,
        generate an embedding via OpenAI, and store it in the professionals table.
        If any error occurs, we set embedding_stale=True but do NOT raise.
        """
        try:
            # 1. Get the professional record
            professional = self.prof_repo.get_by_user_id(user_id)
            if not professional:
                logger.warning(f"No professional profile found for user {user_id}, skipping indexing")
                return

            # 2. Get the portfolio (if exists)
            portfolio = self.portfolio_repo.get_by_user_id(user_id)

            # 3. Get services and works if portfolio exists
            services: List[ProfessionalService] = []
            works: List[PortfolioWork] = []
            specialties: List[ProfessionalSpecialty] = []
            if portfolio:
                services = self.portfolio_repo.get_services(portfolio)
                works = self.portfolio_repo.get_works(portfolio)
                # Specialties are loaded via relationship, but we need to fetch them explicitly
                # We'll get them from the portfolio.specialties (already loaded if we use eager loading)
                # However, our repo method might not load them. We'll query them directly.
                # We'll use the repo to get the specialty IDs and then fetch names.
                specialty_ids = self.portfolio_repo.get_specialty_ids(portfolio)
                if specialty_ids:
                    stmt = select(ProfessionalSpecialty).where(ProfessionalSpecialty.id.in_(specialty_ids))
                    specialties = self.session.exec(stmt).all()

            # 4. Compile the text blob
            text_parts = []

            # Professional fields
            if professional.profession:
                text_parts.append(f"Profession: {professional.profession}")
            if professional.bio:
                text_parts.append(f"Bio: {professional.bio}")

            # Skills from professional (JSON list)
            if professional.skills and isinstance(professional.skills, list):
                skills_str = ", ".join([str(s) for s in professional.skills if s])
                if skills_str:
                    text_parts.append(f"Skills: {skills_str}")

            # Portfolio fields
            if portfolio:
                if portfolio.headline:
                    text_parts.append(f"Portfolio Headline: {portfolio.headline}")
                if portfolio.bio:
                    text_parts.append(f"Portfolio Bio: {portfolio.bio}")

            # Specialties (from portfolio)
            if specialties:
                specialty_names = [s.name for s in specialties if s.name]
                if specialty_names:
                    text_parts.append(f"Specialties: {', '.join(specialty_names)}")

            # Services
            if services:
                service_descs = []
                for svc in services:
                    # Only include active services
                    if svc.is_active:
                        desc = f"{svc.title}"
                        if svc.description:
                            desc += f" - {svc.description}"
                        service_descs.append(desc)
                if service_descs:
                    text_parts.append(f"Services: {'; '.join(service_descs)}")

            # Works
            if works:
                work_descs = []
                for work in works:
                    desc = f"{work.title}"
                    if work.description:
                        desc += f" - {work.description}"
                    work_descs.append(desc)
                if work_descs:
                    text_parts.append(f"Works: {'; '.join(work_descs)}")

            # Join all parts with a period separator
            full_text = ". ".join(text_parts)

            if not full_text.strip():
                # No text to embed — maybe set embedding to None?
                logger.info(f"No searchable text for user {user_id}, clearing embedding")
                # We'll set embedding to NULL and mark stale=False (since there's nothing to embed)
                professional.embedding = None
                professional.embedding_stale = False
                self.session.add(professional)
                self.session.commit()
                return

            # 5. Generate embedding
            logger.info(f"Generating embedding for user {user_id}, text length: {len(full_text)}")
            embedding_vector = self.embedding_service.generate_embedding(full_text)

            # 6. Update the professional record
            professional.embedding = embedding_vector
            professional.embedding_stale = False
            self.session.add(professional)
            self.session.commit()
            logger.info(f"Successfully indexed user {user_id}")

        except ValueError as e:
            # This can happen if text is empty; we handle above but keep for safety
            logger.warning(f"ValueError in indexing for user {user_id}: {e}")
            self._mark_stale(professional)
        except Exception as e:
            logger.error(f"Failed to generate embedding for user {user_id}: {e}")
            # Mark stale so search falls back to keyword
            self._mark_stale(professional)

    def _mark_stale(self, professional: Optional[Professional]) -> None:
        """Helper to set embedding_stale=True and commit."""
        if professional:
            professional.embedding_stale = True
            self.session.add(professional)
            self.session.commit()
            logger.info(f"Marked embedding stale for user {professional.user_id}")