# app/api/v1/professionals.py

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.current_user import get_current_user
from app.enums.professional import DeletionType, ProfessionalAccountStatus
from app.models.user import User
from app.schemas.professional import (
    ProfessionalCreate,
    ProfessionalListResponse,
    ProfessionalResponse,
    ProfessionalUpdate,
)
from app.services.professional_service import ProfessionalService

router = APIRouter(prefix="/professionals", tags=["professionals"])


@router.post("/", response_model=ProfessionalResponse, status_code=status.HTTP_201_CREATED)
def create_professional(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    data: ProfessionalCreate,
):
    service = ProfessionalService(session)
    professional = service.create_professional(current_user, data.model_dump())
    return service.to_response(professional)


@router.get("/me", response_model=ProfessionalResponse)
def get_my_professional(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    service = ProfessionalService(session)
    professional = service.get_by_user(current_user)
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional profile not found",
        )
    return service.to_response(professional)


@router.patch("/me", response_model=ProfessionalResponse)
def update_my_professional(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    data: ProfessionalUpdate,
):
    service = ProfessionalService(session)
    update_data = data.model_dump(exclude_unset=True, exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )
    professional = service.update_professional(current_user, update_data)
    return service.to_response(professional)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_professional(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    service = ProfessionalService(session)
    professional = service.get_by_user(current_user)
    if not professional:
        raise HTTPException(status_code=404, detail="Professional profile not found")

    service.soft_delete(
        professional,
        deletion_type=DeletionType.SELF,
        reason="user self-deleted",
        actor_user_id=current_user.id,
        actor_role="user",
        snapshot={
            "email": current_user.email,
            "username": current_user.username,
        },
    )
    return None


@router.get("/", response_model=ProfessionalListResponse)
def list_professionals(
    *,
    session: Session = Depends(get_session),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    profession: Optional[str] = None,
    city: Optional[str] = None,
    country: Optional[str] = None,
    verified_only: bool = False,
    available_only: bool = True,
    search: Optional[str] = None,
    sort: str = Query("rating_desc", pattern="^(rating_desc|newest|completed_desc)$"),
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
        sort=sort,
    )
    return ProfessionalListResponse(
        items=service.list_to_public_responses(items),
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
    )


@router.get("/{professional_id}", response_model=ProfessionalResponse)
def get_professional_by_id(
    *,
    session: Session = Depends(get_session),
    professional_id: UUID,
):
    service = ProfessionalService(session)
    professional = service.get_by_id(professional_id, include_deleted=False)
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")
    if professional.status == ProfessionalAccountStatus.DELETED:
        raise HTTPException(status_code=404, detail="Professional not found")
    return service.to_response(professional)