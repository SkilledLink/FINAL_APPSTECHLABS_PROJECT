from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlmodel import Session

from app.dependencies.current_user import get_current_user, get_current_active_user
from app.database.session import get_session
from app.models.user import User
from app.schemas.professional_portfolio import (
    PortfolioCreate,
    PortfolioUpdate,
    PortfolioResponse,
    WorkCreate,
    WorkUpdate,
    WorkResponse,
    ServiceCreate,
    ServiceUpdate,
    ServiceResponse,
    AvailabilityCreate,
    AvailabilityResponse,
    PublicPortfolioResponse,
    CategoryResponse,
)
from app.services.professional_portfolio_service import ProfessionalPortfolioService
from app.enums.user import AccountType

router = APIRouter(prefix="/professionals", tags=["Professional Portfolio"])


# ============================================================
# 1. STATIC ROUTES (no path parameters)
# ============================================================

# ---------- Portfolio (owner) ----------
@router.post("/portfolio", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
def create_portfolio(
    data: PortfolioCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Create a portfolio for the authenticated professional."""
    service = ProfessionalPortfolioService(session)
    return service.create_portfolio(current_user, data)


@router.get("/portfolio", response_model=Optional[PortfolioResponse])
def get_my_portfolio(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get the authenticated professional's own portfolio."""
    service = ProfessionalPortfolioService(session)
    try:
        return service.get_portfolio(current_user.id, current_user)
    except HTTPException as e:
        if e.status_code == 404:
            return None
        raise


@router.put("/portfolio", response_model=PortfolioResponse)
def update_portfolio(
    data: PortfolioUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Update the authenticated professional's portfolio."""
    service = ProfessionalPortfolioService(session)
    return service.update_portfolio(current_user, data)


@router.delete("/portfolio", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Delete the authenticated professional's portfolio."""
    service = ProfessionalPortfolioService(session)
    service.delete_portfolio(current_user)


# ---------- Works (owner) ----------
@router.post("/portfolio/works", response_model=WorkResponse, status_code=status.HTTP_201_CREATED)
def create_work(
    data: WorkCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = ProfessionalPortfolioService(session)
    return service.create_work(current_user, data)


@router.get("/portfolio/works", response_model=List[WorkResponse])
def list_works(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = ProfessionalPortfolioService(session)
    portfolio = service.repo.get_by_user_id(current_user.id)
    if not portfolio:
        return []
    works = service.repo.get_works(portfolio)
    return [WorkResponse.model_validate(w) for w in works]


@router.get("/portfolio/works/{work_id}", response_model=WorkResponse)
def get_work(
    work_id: UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = ProfessionalPortfolioService(session)
    return service.get_work(work_id, current_user)


@router.put("/portfolio/works/{work_id}", response_model=WorkResponse)
def update_work(
    work_id: UUID,
    data: WorkUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = ProfessionalPortfolioService(session)
    return service.update_work(work_id, current_user, data)


@router.delete("/portfolio/works/{work_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_work(
    work_id: UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = ProfessionalPortfolioService(session)
    service.delete_work(work_id, current_user)


@router.post("/portfolio/works/{work_id}/images", response_model=WorkResponse)
def upload_work_images(
    work_id: UUID,
    before: Optional[UploadFile] = File(None),
    after: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    if not before and not after:
        raise HTTPException(400, "At least one image (before or after) must be provided")
    service = ProfessionalPortfolioService(session)
    return service.upload_work_images(work_id, current_user, before, after)


# ---------- Services (owner) ----------
@router.post("/portfolio/services", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(
    data: ServiceCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = ProfessionalPortfolioService(session)
    return service.create_service(current_user, data)


@router.get("/portfolio/services", response_model=List[ServiceResponse])
def list_services(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = ProfessionalPortfolioService(session)
    portfolio = service.repo.get_by_user_id(current_user.id)
    if not portfolio:
        return []
    svcs = service.repo.get_services(portfolio)
    return [ServiceResponse.model_validate(s) for s in svcs]


@router.put("/portfolio/services/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: UUID,
    data: ServiceUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = ProfessionalPortfolioService(session)
    return service.update_service(service_id, current_user, data)


@router.delete("/portfolio/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = ProfessionalPortfolioService(session)
    service.delete_service(service_id, current_user)


# ---------- Availability (owner) ----------
@router.put("/portfolio/availability", response_model=List[AvailabilityResponse])
def set_availability(
    data: List[AvailabilityCreate],
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = ProfessionalPortfolioService(session)
    return service.set_availability(current_user, data)


@router.get("/portfolio/availability", response_model=List[AvailabilityResponse])
def get_availability(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = ProfessionalPortfolioService(session)
    return service.get_availability(current_user)


# ---------- Categories (read‑only) ----------
@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(
    session: Session = Depends(get_session),
):
    service = ProfessionalPortfolioService(session)
    categories = service.repo.get_categories()
    return [CategoryResponse.model_validate(c) for c in categories]


# ============================================================
# 2. DYNAMIC ROUTES (with path parameters)
# ============================================================

@router.get("/{professional_id}/portfolio", response_model=PublicPortfolioResponse)
def get_public_portfolio(
    professional_id: UUID,
    session: Session = Depends(get_session),
):
    """Get a public portfolio for any professional (by user ID)."""
    service = ProfessionalPortfolioService(session)
    return service.get_public_portfolio(professional_id)