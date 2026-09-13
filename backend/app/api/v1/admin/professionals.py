from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.permissions import has_capability
from app.enums.admin import Capability
from app.enums.professional import (
    DeletionType,
    ProfessionalAccountStatus,
    VerificationStatus,
)
from app.models.user import User
from app.schemas.professional import (
    FlagProfessionalRequest,
    ProfessionalAdminListResponse,
    ProfessionalAdminResponse,
    SuspendProfessionalRequest,
    TrustScoreUpdateRequest,
    VerificationOverrideRequest,
)
from app.services.professional_service import ProfessionalService

router = APIRouter(
    prefix="/admin/professionals",
    tags=["admin-professionals"],
    dependencies=[Depends(has_capability(Capability.VIEW_PROFESSIONALS))],
)


def _load_or_404(service: ProfessionalService, professional_id: UUID):
    prof = service.get_by_id(professional_id, include_deleted=True)
    if not prof:
        raise HTTPException(status_code=404, detail="Professional not found")
    return prof


@router.get("", response_model=ProfessionalAdminListResponse)
def list_professionals(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    include_deleted: bool = Query(True),
    status_filter: Optional[ProfessionalAccountStatus] = Query(None, alias="status"),
    verification_status: Optional[VerificationStatus] = Query(None),
    flagged_only: bool = Query(False),
    session: Session = Depends(get_session),
):
    service = ProfessionalService(session)
    items, total = service.repo.list_all_admin(
        skip=skip,
        limit=limit,
        include_deleted=include_deleted,
        status=status_filter,
        verification_status=verification_status,
        flagged_only=flagged_only,
    )
    return ProfessionalAdminListResponse(
        items=[ProfessionalAdminResponse.model_validate(p) for p in items],
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
    )


@router.get("/{professional_id}", response_model=ProfessionalAdminResponse)
def get_professional(
    professional_id: UUID,
    session: Session = Depends(get_session),
):
    return _load_or_404(ProfessionalService(session), professional_id)


@router.post(
    "/{professional_id}/verify",
    response_model=ProfessionalAdminResponse,
)
def override_verification(
    professional_id: UUID,
    data: VerificationOverrideRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_VERIFICATION)),
):
    service = ProfessionalService(session)
    prof = _load_or_404(service, professional_id)
    return service.admin_override_verification(
        prof,
        new_status=data.new_status,
        admin_user_id=current_user.id,
        reason=data.reason,
    )


@router.post(
    "/{professional_id}/suspend",
    response_model=ProfessionalAdminResponse,
)
def suspend_professional(
    professional_id: UUID,
    data: SuspendProfessionalRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.SUSPEND_PROFESSIONALS)),
):
    service = ProfessionalService(session)
    prof = _load_or_404(service, professional_id)
    if prof.status == ProfessionalAccountStatus.DELETED:
        raise HTTPException(
            status_code=400, detail="Cannot suspend a deleted professional"
        )
    return service.admin_suspend(prof, current_user.id, data.reason)


@router.post(
    "/{professional_id}/reactivate",
    response_model=ProfessionalAdminResponse,
)
def reactivate_professional(
    professional_id: UUID,
    data: SuspendProfessionalRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.SUSPEND_PROFESSIONALS)),
):
    service = ProfessionalService(session)
    prof = _load_or_404(service, professional_id)
    if prof.status == ProfessionalAccountStatus.DELETED:
        raise HTTPException(
            status_code=400, detail="Cannot reactivate a deleted professional"
        )
    return service.admin_reactivate(prof, current_user.id, data.reason)


@router.post("/{professional_id}/flag", response_model=ProfessionalAdminResponse)
def flag_professional(
    professional_id: UUID,
    data: FlagProfessionalRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_VERIFICATION)),
):
    service = ProfessionalService(session)
    prof = _load_or_404(service, professional_id)
    return service.admin_flag(prof, current_user.id, data.reason, data.notes)


@router.post("/{professional_id}/unflag", response_model=ProfessionalAdminResponse)
def unflag_professional(
    professional_id: UUID,
    data: SuspendProfessionalRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_VERIFICATION)),
):
    service = ProfessionalService(session)
    prof = _load_or_404(service, professional_id)
    return service.admin_unflag(prof, current_user.id, data.reason)


@router.post(
    "/{professional_id}/trust-score",
    response_model=ProfessionalAdminResponse,
)
def update_trust_score(
    professional_id: UUID,
    data: TrustScoreUpdateRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_VERIFICATION)),
):
    service = ProfessionalService(session)
    prof = _load_or_404(service, professional_id)
    return service.admin_update_trust_score(
        prof, current_user.id, data.new_score, data.reason
    )


@router.delete("/{professional_id}", response_model=ProfessionalAdminResponse)
def soft_delete_professional(
    professional_id: UUID,
    reason: str = Query(..., min_length=5, max_length=500),
    deletion_type: DeletionType = Query(DeletionType.ADMIN),
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.DELETE_USERS)),
):
    service = ProfessionalService(session)
    prof = _load_or_404(service, professional_id)
    if prof.deleted_at is not None:
        raise HTTPException(status_code=400, detail="Professional already deleted")

    user = session.get(User, prof.user_id)
    snapshot = {}
    if user:
        snapshot = {"email": user.email, "username": user.username}

    return service.soft_delete(
        prof,
        deletion_type=deletion_type,
        reason=reason,
        actor_user_id=current_user.id,
        actor_role="admin" if current_user.is_admin else "moderator",
        snapshot=snapshot,
    )