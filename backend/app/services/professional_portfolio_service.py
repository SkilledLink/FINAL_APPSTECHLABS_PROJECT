import logging
from typing import Optional, List, Tuple
from uuid import UUID, uuid4
from fastapi import HTTPException, UploadFile
from sqlmodel import Session
from app.models.user import User
from app.services.indexing_service import IndexingService
from app.models.professional_portfolio import (
    ProfessionalPortfolio, PortfolioWork, ProfessionalService, ProfessionalAvailability
)
from app.repositories.professional_portfolio_repository import ProfessionalPortfolioRepository
from app.schemas.professional_portfolio import (
    PortfolioCreate, PortfolioUpdate, PortfolioResponse,
    WorkCreate, WorkUpdate, WorkResponse,
    ServiceCreate, ServiceUpdate, ServiceResponse,
    AvailabilityCreate, AvailabilityUpdate, AvailabilityResponse,
    PublicPortfolioResponse, SpecialtyResponse
)
from app.schemas.user import UserResponse
from app.services.storage_service import StorageService
from app.enums.user import AccountType

logger = logging.getLogger(__name__)


class ProfessionalPortfolioService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = ProfessionalPortfolioRepository(session)
        self.storage = StorageService()

    # ---------- Portfolio CRUD ----------
    def create_portfolio(self, user: User, data: PortfolioCreate) -> PortfolioResponse:
        if user.account_type != AccountType.PROFESSIONAL:
            raise HTTPException(403, "Only professional accounts can create a portfolio")

        existing = self.repo.get_by_user_id(user.id)
        if existing:
            raise HTTPException(400, "Portfolio already exists for this user")

        try:
            portfolio_data = data.model_dump(exclude={"specialty_ids"})
            portfolio = self.repo.create(user, portfolio_data)

            if data.specialty_ids:
                self.repo.add_specialties(portfolio, data.specialty_ids)

            response = self._build_portfolio_response(portfolio, user)
            self.session.commit()

            # Trigger AI reindexing after portfolio creation
            try:
                IndexingService(self.session).regenerate_vector(user.id)
            except Exception as e:
                logger.error(f"Failed to reindex after creating portfolio for user {user.id}: {e}")

            return response

        except Exception as e:
            self.session.rollback()
            logger.error(f"Portfolio creation failed: {e}")
            raise

    def get_portfolio(self, user_id: UUID, current_user: Optional[User] = None) -> PortfolioResponse:
        """Get portfolio for a user. Raises 404 if not found, 403 if private."""
        logger.info(f"get_portfolio called with user_id: {user_id} (type: {type(user_id)})")

        if not isinstance(user_id, UUID):
            try:
                user_id = UUID(str(user_id))
            except Exception:
                raise HTTPException(400, "Invalid user ID format")

        try:
            portfolio = self.repo.get_by_user_id(user_id)
        except Exception as e:
            logger.error(f"Database error in get_by_user_id: {e}")
            raise HTTPException(400, f"Invalid professional ID format: {str(e)}")

        if not portfolio:
            raise HTTPException(404, "Portfolio not found")

        if not portfolio.is_public and (not current_user or current_user.id != user_id):
            raise HTTPException(403, "Portfolio is private")

        return self._build_portfolio_response(portfolio, portfolio.user)

    def update_portfolio(self, user: User, data: PortfolioUpdate) -> PortfolioResponse:
        portfolio = self.repo.get_by_user_id(user.id)
        if not portfolio:
            raise HTTPException(404, "Portfolio not found")

        try:
            update_data = data.model_dump(exclude_unset=True, exclude={"specialty_ids"})
            if update_data:
                self.repo.update(portfolio, update_data)

            if data.specialty_ids is not None:
                self.repo.remove_specialties(portfolio)
                if data.specialty_ids:
                    self.repo.add_specialties(portfolio, data.specialty_ids)

            self.session.commit()

            try:
                IndexingService(self.session).regenerate_vector(user.id)
            except Exception as e:
                logger.error(f"Failed to reindex after updating portfolio for user {user.id}: {e}")

            return self._build_portfolio_response(portfolio, user)
        except Exception as e:
            self.session.rollback()
            logger.error(f"Portfolio update failed: {e}")
            raise

    def delete_portfolio(self, user: User) -> None:
        portfolio = self.repo.get_by_user_id(user.id)
        if not portfolio:
            raise HTTPException(404, "Portfolio not found")
        try:
            self.session.delete(portfolio)
            self.session.commit()

            try:
                IndexingService(self.session).regenerate_vector(user.id)
            except Exception as e:
                logger.error(f"Failed to reindex after deleting portfolio for user {user.id}: {e}")

        except Exception as e:
            self.session.rollback()
            logger.error(f"Portfolio deletion failed: {e}")
            raise

    # ---------- Works ----------
    def create_work(self, user: User, data: WorkCreate) -> WorkResponse:
        portfolio = self._get_owner_portfolio(user)
        try:
            work = self.repo.create_work(portfolio, data.model_dump())
            self.session.commit()

            try:
                IndexingService(self.session).regenerate_vector(user.id)
            except Exception as e:
                logger.error(f"Failed to reindex after creating work for user {user.id}: {e}")

            return WorkResponse.model_validate(work)
        except Exception as e:
            self.session.rollback()
            logger.error(f"Work creation failed: {e}")
            raise

    def get_work(self, work_id: UUID, user: User) -> WorkResponse:
        work = self.repo.get_work(work_id)
        if not work:
            raise HTTPException(404, "Work not found")
        portfolio = self.repo.get_by_id(work.portfolio_id)
        if not portfolio or (not portfolio.is_public and portfolio.user_id != user.id):
            raise HTTPException(403, "Access denied")
        return WorkResponse.model_validate(work)

    def update_work(self, work_id: UUID, user: User, data: WorkUpdate) -> WorkResponse:
        work = self._get_work_for_owner(work_id, user)
        try:
            update_data = data.model_dump(exclude_unset=True)
            if update_data:
                self.repo.update_work(work, update_data)
            self.session.commit()

            try:
                IndexingService(self.session).regenerate_vector(user.id)
            except Exception as e:
                logger.error(f"Failed to reindex after updating work for user {user.id}: {e}")

            return WorkResponse.model_validate(work)
        except Exception as e:
            self.session.rollback()
            logger.error(f"Work update failed: {e}")
            raise

    def delete_work(self, work_id: UUID, user: User) -> None:
        work = self._get_work_for_owner(work_id, user)
        try:
            self.repo.delete_work(work)
            self.session.commit()

            try:
                IndexingService(self.session).regenerate_vector(user.id)
            except Exception as e:
                logger.error(f"Failed to reindex after deleting work for user {user.id}: {e}")

        except Exception as e:
            self.session.rollback()
            logger.error(f"Work deletion failed: {e}")
            raise

    def upload_work_images(
        self,
        work_id: UUID,
        user: User,
        before: Optional[UploadFile],
        after: Optional[UploadFile],
    ) -> WorkResponse:
        work = self._get_work_for_owner(work_id, user)
        try:
            if before:
                url = self.storage.upload_image(
                    before,
                    folder=f"professionals/{user.id}/portfolio/works/{work_id}/before",
                    public_id=f"before_{uuid4()}",
                    resource_type="image",
                    allowed_mime_types=[
                        "image/jpeg", "image/jpg", "image/png",
                        "image/webp", "image/gif",
                    ],
                )
                work.before_image_url = url
            if after:
                url = self.storage.upload_image(
                    after,
                    folder=f"professionals/{user.id}/portfolio/works/{work_id}/after",
                    public_id=f"after_{uuid4()}",
                    resource_type="image",
                    allowed_mime_types=[
                        "image/jpeg", "image/jpg", "image/png",
                        "image/webp", "image/gif",
                    ],
                )
                work.after_image_url = url

            self.repo.update_work(work, {})
            self.session.commit()

            # Images don't affect search text, so we skip reindexing here.
            return WorkResponse.model_validate(work)
        except HTTPException:
            self.session.rollback()
            raise
        except Exception as e:
            self.session.rollback()
            logger.error(f"Image upload failed: {e}")
            raise

    def upload_work_gallery(
        self,
        work_id: UUID,
        user: User,
        images: List[UploadFile],
    ) -> WorkResponse:
        if not images:
            raise HTTPException(400, "At least one image must be provided")

        work = self._get_work_for_owner(work_id, user)
        try:
            new_urls: List[str] = []
            for image in images:
                url = self.storage.upload_image(
                    image,
                    folder=f"professionals/{user.id}/portfolio/works/{work_id}/gallery",
                    public_id=f"gallery_{uuid4()}",
                    resource_type="image",
                    allowed_mime_types=[
                        "image/jpeg", "image/jpg", "image/png",
                        "image/webp", "image/gif",
                    ],
                )
                new_urls.append(url)

            # Reassign to force SQLAlchemy to detect the JSON change
            work.gallery = list(work.gallery or []) + new_urls

            self.repo.update_work(work, {})
            self.session.commit()
            return WorkResponse.model_validate(work)

        except HTTPException:
            self.session.rollback()
            raise
        except Exception as e:
            self.session.rollback()
            logger.error(f"Work gallery upload failed: {e}")
            raise

    # ---------- Services ----------
    def create_service(self, user: User, data: ServiceCreate) -> ServiceResponse:
        portfolio = self._get_owner_portfolio(user)
        try:
            service = self.repo.create_service(portfolio, data.model_dump())
            self.session.commit()

            try:
                IndexingService(self.session).regenerate_vector(user.id)
            except Exception as e:
                logger.error(f"Failed to reindex after creating service for user {user.id}: {e}")

            return ServiceResponse.model_validate(service)
        except Exception as e:
            self.session.rollback()
            logger.error(f"Service creation failed: {e}")
            raise

    def update_service(self, service_id: UUID, user: User, data: ServiceUpdate) -> ServiceResponse:
        service = self._get_service_for_owner(service_id, user)
        try:
            update_data = data.model_dump(exclude_unset=True)
            if update_data:
                self.repo.update_service(service, update_data)
            self.session.commit()

            try:
                IndexingService(self.session).regenerate_vector(user.id)
            except Exception as e:
                logger.error(f"Failed to reindex after updating service for user {user.id}: {e}")

            return ServiceResponse.model_validate(service)
        except Exception as e:
            self.session.rollback()
            logger.error(f"Service update failed: {e}")
            raise

    def delete_service(self, service_id: UUID, user: User) -> None:
        service = self._get_service_for_owner(service_id, user)
        try:
            self.repo.delete_service(service)
            self.session.commit()

            try:
                IndexingService(self.session).regenerate_vector(user.id)
            except Exception as e:
                logger.error(f"Failed to reindex after deleting service for user {user.id}: {e}")

        except Exception as e:
            self.session.rollback()
            logger.error(f"Service deletion failed: {e}")
            raise

    def upload_service_banner(
        self,
        service_id: UUID,
        user: User,
        banner: UploadFile,
    ) -> ServiceResponse:
        service = self._get_service_for_owner(service_id, user)
        try:
            url = self.storage.upload_image(
                banner,
                folder=f"professionals/{user.id}/portfolio/services/{service_id}/banner",
                public_id=f"banner_{uuid4()}",
                resource_type="image",
                allowed_mime_types=[
                    "image/jpeg", "image/jpg", "image/png",
                    "image/webp", "image/gif",
                ],
            )

            service.banner_image_url = url
            self.repo.update_service(service, {})
            self.session.commit()
            return ServiceResponse.model_validate(service)

        except HTTPException:
            self.session.rollback()
            raise
        except Exception as e:
            self.session.rollback()
            logger.error(f"Service banner upload failed: {e}")
            raise

    def upload_service_gallery(
        self,
        service_id: UUID,
        user: User,
        images: List[UploadFile],
    ) -> ServiceResponse:
        if not images:
            raise HTTPException(400, "At least one image must be provided")

        service = self._get_service_for_owner(service_id, user)
        try:
            new_urls: List[str] = []
            for image in images:
                url = self.storage.upload_image(
                    image,
                    folder=f"professionals/{user.id}/portfolio/services/{service_id}/gallery",
                    public_id=f"gallery_{uuid4()}",
                    resource_type="image",
                    allowed_mime_types=[
                        "image/jpeg", "image/jpg", "image/png",
                        "image/webp", "image/gif",
                    ],
                )
                new_urls.append(url)

            service.gallery = list(service.gallery or []) + new_urls

            self.repo.update_service(service, {})
            self.session.commit()
            return ServiceResponse.model_validate(service)

        except HTTPException:
            self.session.rollback()
            raise
        except Exception as e:
            self.session.rollback()
            logger.error(f"Service gallery upload failed: {e}")
            raise

    # ---------- Availability ----------
    def set_availability(self, user: User, availabilities: List[AvailabilityCreate]) -> List[AvailabilityResponse]:
        portfolio = self._get_owner_portfolio(user)
        try:
            self.repo.clear_availability(portfolio)
            created = []
            for item in availabilities:
                av = self.repo.create_availability(portfolio, item.model_dump())
                created.append(av)
            self.session.commit()
            return [AvailabilityResponse.model_validate(a) for a in created]
        except Exception as e:
            self.session.rollback()
            logger.error(f"Availability set failed: {e}")
            raise

    def get_availability(self, user: User) -> List[AvailabilityResponse]:
        portfolio = self.repo.get_by_user_id(user.id)
        if not portfolio:
            return []
        avails = self.repo.get_availability(portfolio)
        return [AvailabilityResponse.model_validate(a) for a in avails]

    # ---------- Public Discovery ----------
    def get_public_portfolio(self, user_id: UUID) -> PublicPortfolioResponse:
        portfolio = self.repo.get_by_user_id(user_id)
        if not portfolio or not portfolio.is_public:
            raise HTTPException(404, "Portfolio not found or private")
        user = portfolio.user
        works = [WorkResponse.model_validate(w) for w in self.repo.get_works(portfolio)]
        services = [ServiceResponse.model_validate(s) for s in self.repo.get_services(portfolio)]
        availability = [AvailabilityResponse.model_validate(a) for a in self.repo.get_availability(portfolio)]
        portfolio_resp = self._build_portfolio_response(portfolio, user, include_nested=False)
        return PublicPortfolioResponse(
            professional=UserResponse.model_validate(user),
            portfolio=portfolio_resp,
            services=services,
            works=works,
            availability=availability,
            average_rating=None,
            total_reviews=0
        )

    # ---------- Helpers ----------
    def _get_owner_portfolio(self, user: User) -> ProfessionalPortfolio:
        portfolio = self.repo.get_by_user_id(user.id)
        if not portfolio:
            raise HTTPException(404, "Portfolio not found")
        return portfolio

    def _get_work_for_owner(self, work_id: UUID, user: User) -> PortfolioWork:
        work = self.repo.get_work(work_id)
        if not work:
            raise HTTPException(404, "Work not found")
        portfolio = self.repo.get_by_id(work.portfolio_id)
        if not portfolio or portfolio.user_id != user.id:
            raise HTTPException(403, "Not authorized to modify this work")
        return work

    def _get_service_for_owner(self, service_id: UUID, user: User) -> ProfessionalService:
        service = self.repo.get_service(service_id)
        if not service:
            raise HTTPException(404, "Service not found")
        portfolio = self.repo.get_by_id(service.portfolio_id)
        if not portfolio or portfolio.user_id != user.id:
            raise HTTPException(403, "Not authorized to modify this service")
        return service

    def _build_portfolio_response(
        self,
        portfolio: ProfessionalPortfolio,
        user: User,
        include_nested: bool = True,
    ) -> PortfolioResponse:
        if not include_nested:
            return PortfolioResponse.model_validate(portfolio)

        specialties = [SpecialtyResponse.model_validate(ps) for ps in portfolio.specialties]
        services = [ServiceResponse.model_validate(s) for s in self.repo.get_services(portfolio)]
        works = [WorkResponse.model_validate(w) for w in self.repo.get_works(portfolio)]
        availability = [AvailabilityResponse.model_validate(a) for a in self.repo.get_availability(portfolio)]

        resp = PortfolioResponse.model_validate(portfolio)
        resp.specialties = specialties
        resp.services = services
        resp.works = works
        resp.availabilities = availability
        resp.user = UserResponse.model_validate(user)
        return resp