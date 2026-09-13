from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.permissions import has_capability
from app.enums.admin import Capability
from app.enums.professional import (
    ProfessionalAccountStatus,
    VerificationStatus,
)
from app.models.user import User
from app.schemas.professional import (
    ProfessionalListResponse,
    ProfessionalPublicResponse,
    ProfessionalResponse,
    SuspendProfessionalRequest,
)
from app.services.professional_service import ProfessionalService

router = APIRouter(
    prefix="/moderator/professionals",
    tags=["moderator-professionals"],
    dependencies=[Depends(has_capability(Capability.VIEW_PROFESSIONALS))],
)


@router.get("", response_model=ProfessionalListResponse)
def list_professionals(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    profession: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    verified_only: bool = Query(False),
    available_only: bool = Query(False),
    search: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    service = ProfessionalService(session)
    items, total = service.repo.list_active(
        skip=skip,
        limit=limit,
        profession=profession,
        city=city,
        country=country,
        verified_only=verified_only,
        available_only=available_only,
        search=search,
    )
    return ProfessionalListResponse(
        items=[ProfessionalPublicResponse.model_validate(p) for p in items],
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
    )


@router.get("/{professional_id}", response_model=ProfessionalResponse)
def get_professional(
    professional_id: UUID,
    session: Session = Depends(get_session),
):
    service = ProfessionalService(session)
    prof = service.get_by_id(professional_id, include_deleted=False)
    if not prof:
        raise HTTPException(status_code=404, detail="Professional not found")
    if prof.status == ProfessionalAccountStatus.DELETED:
        raise HTTPException(status_code=404, detail="Professional not found")
    return prof


@router.post("/{professional_id}/suspend", response_model=ProfessionalResponse)
def suspend_professional(
    professional_id: UUID,
    data: SuspendProfessionalRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.SUSPEND_PROFESSIONALS)),
):
    service = ProfessionalService(session)
    prof = service.get_by_id(professional_id, include_deleted=True)
    if not prof:
        raise HTTPException(status_code=404, detail="Professional not found")
    if prof.status == ProfessionalAccountStatus.DELETED:
        raise HTTPException(
            status_code=400, detail="Cannot suspend a deleted professional"
        )
    return service.admin_suspend(prof, current_user.id, data.reason)


@router.post("/{professional_id}/reactivate", response_model=ProfessionalResponse)
def reactivate_professional(
    professional_id: UUID,
    data: SuspendProfessionalRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.SUSPEND_PROFESSIONALS)),
):
    service = ProfessionalService(session)
    prof = service.get_by_id(professional_id, include_deleted=True)
    if not prof:
        raise HTTPException(status_code=404, detail="Professional not found")
    if prof.status == ProfessionalAccountStatus.DELETED:
        raise HTTPException(
            status_code=400, detail="Cannot reactivate a deleted professional"
        )
    return service.admin_reactivate(prof, current_user.id, data.reason)