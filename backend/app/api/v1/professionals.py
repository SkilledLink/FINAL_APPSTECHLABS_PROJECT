from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.current_user import get_current_user
from app.models.user import User
from app.schemas.professional import ProfessionalCreate, ProfessionalUpdate, ProfessionalResponse
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
    professional = service.create_professional(current_user, data.dict())
    return professional


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
            detail="Professional profile not found"
        )
    return professional


@router.get("/{professional_id}", response_model=ProfessionalResponse)
def get_professional_by_id(
    *,
    session: Session = Depends(get_session),
    professional_id: str,
):
    # Convert to UUID, handle error
    try:
        from uuid import UUID
        prof_uuid = UUID(professional_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid professional ID format"
        )

    service = ProfessionalService(session)
    professional = service.get_by_id(prof_uuid)
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found"
        )
    return professional


@router.patch("/me", response_model=ProfessionalResponse)
def update_my_professional(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    data: ProfessionalUpdate,
):
    service = ProfessionalService(session)
    # Filter out None values from the update data
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update"
        )
    professional = service.update_professional(current_user, update_data)
    return professional