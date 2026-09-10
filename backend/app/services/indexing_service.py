import logging
from typing import List, Optional
from uuid import UUID

from sqlmodel import Session, select
from app.models.professional import Professional
from app.models.professional_portfolio import (
    ProfessionalPortfolio, ProfessionalService, PortfolioWork,
    ProfessionalSpecialty
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
        generate an embedding, and store it in professionals.embedding.
        Never raises – sets embedding_stale=True on failure.
        """
        professional: Optional[Professional] = None
        try:
            # 1. Fetch professional
            professional = self.prof_repo.get_by_user_id(user_id)
            if not professional:
                logger.warning(f"No professional found for user {user_id}, skipping")
                return

            # 2. Fetch portfolio + related data
            portfolio = self.portfolio_repo.get_by_user_id(user_id)
            services: List[ProfessionalService] = []
            works: List[PortfolioWork] = []
            specialties: List[ProfessionalSpecialty] = []

            if portfolio:
                services = self.portfolio_repo.get_services(portfolio)
                works = self.portfolio_repo.get_works(portfolio)
                specialty_ids = self.portfolio_repo.get_specialty_ids(portfolio)
                if specialty_ids:
                    stmt = select(ProfessionalSpecialty).where(
                        ProfessionalSpecialty.id.in_(specialty_ids)
                    )
                    specialties = self.session.exec(stmt).all()

            # 3. Build the text blob
            text_parts: List[str] = []

            if professional.profession:
                text_parts.append(f"Profession: {professional.profession}")
            if professional.bio:
                text_parts.append(f"Bio: {professional.bio}")
            if professional.skills and isinstance(professional.skills, list):
                skills_str = ", ".join(str(s) for s in professional.skills if s)
                if skills_str:
                    text_parts.append(f"Skills: {skills_str}")

            if portfolio:
                if portfolio.headline:
                    text_parts.append(f"Portfolio Headline: {portfolio.headline}")
                if portfolio.bio:
                    text_parts.append(f"Portfolio Bio: {portfolio.bio}")

            if specialties:
                names = [s.name for s in specialties if s.name]
                if names:
                    text_parts.append(f"Specialties: {', '.join(names)}")

            if services:
                svc_descs = []
                for svc in services:
                    if svc.is_active:
                        desc = svc.title or ""
                        if svc.description:
                            desc += f" - {svc.description}"
                        if desc.strip():
                            svc_descs.append(desc)
                if svc_descs:
                    text_parts.append(f"Services: {'; '.join(svc_descs)}")

            if works:
                work_descs = []
                for work in works:
                    desc = work.title or ""
                    if work.description:
                        desc += f" - {work.description}"
                    if desc.strip():
                        work_descs.append(desc)
                if work_descs:
                    text_parts.append(f"Works: {'; '.join(work_descs)}")

            full_text = ". ".join(text_parts)

            if not full_text.strip():
                logger.info(f"No searchable text for user {user_id}, clearing embedding")
                professional.embedding = None
                professional.embedding_stale = False
                self.session.add(professional)
                self.session.commit()
                return

            # 4. Generate embedding
            logger.info(f"Generating embedding for user {user_id} (text len: {len(full_text)})")
            vector = self.embedding_service.generate_embedding(full_text)

            # 5. Save
            professional.embedding = vector
            professional.embedding_stale = False
            self.session.add(professional)
            self.session.commit()
            logger.info(f"✅ Indexed user {user_id}")

        except Exception as e:
            logger.error(f"❌ Failed to index user {user_id}: {e}")
            # Mark stale so search falls back to keyword for this user
            try:
                if professional:
                    professional.embedding_stale = True
                    self.session.add(professional)
                    self.session.commit()
            except Exception as inner:
                logger.error(f"Failed to mark stale for {user_id}: {inner}")
                self.session.rollback()