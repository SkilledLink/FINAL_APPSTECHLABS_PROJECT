from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.current_user import get_current_user
from app.enums.professional import (
    AuditAction,
    DeletionType,
    ProfessionalAccountStatus,
    VerificationStatus,
)
from app.models.user import User
from app.schemas.professional import (
    FlagProfessionalRequest,
    ProfessionalAdminListResponse,
    ProfessionalAdminResponse,
    ProfessionalAuditLogListResponse,
    ProfessionalAuditLogResponse,
    SuspendProfessionalRequest,
    TrustScoreUpdateRequest,
    VerificationOverrideRequest,
)
from app.services.professional_service import ProfessionalService

router = APIRouter(prefix="/professionals/admin", tags=["professionals-admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


def _get_or_404(service: ProfessionalService, professional_id: UUID):
    professional = service.get_by_id(professional_id, include_deleted=True)
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")
    return professional


# ─── List / read ────────────────────────────────────────────

@router.get("/list", response_model=ProfessionalAdminListResponse)
def admin_list_professionals(
    *,
    session: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    include_deleted: bool = True,
    status_filter: Optional[ProfessionalAccountStatus] = Query(None, alias="status"),
    verification_status: Optional[VerificationStatus] = None,
    flagged_only: bool = False,
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
def admin_get_professional(
    *,
    session: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
    professional_id: UUID,
):
    service = ProfessionalService(session)
    return _get_or_404(service, professional_id)


# ─── Verification override ──────────────────────────────────

@router.post("/{professional_id}/override-verification", response_model=ProfessionalAdminResponse)
def admin_override_verification(
    *,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
    professional_id: UUID,
    data: VerificationOverrideRequest,
):
    service = ProfessionalService(session)
    professional = _get_or_404(service, professional_id)
    return service.admin_override_verification(
        professional,
        new_status=data.new_status,
        admin_user_id=admin.id,
        reason=data.reason,
    )


# ─── Suspend / reactivate ───────────────────────────────────

@router.post("/{professional_id}/suspend", response_model=ProfessionalAdminResponse)
def admin_suspend(
    *,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
    professional_id: UUID,
    data: SuspendProfessionalRequest,
):
    service = ProfessionalService(session)
    professional = _get_or_404(service, professional_id)
    if professional.status == ProfessionalAccountStatus.DELETED:
        raise HTTPException(400, "Cannot suspend a deleted professional")
    return service.admin_suspend(professional, admin.id, data.reason)


@router.post("/{professional_id}/reactivate", response_model=ProfessionalAdminResponse)
def admin_reactivate(
    *,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
    professional_id: UUID,
    data: SuspendProfessionalRequest,
):
    service = ProfessionalService(session)
    professional = _get_or_404(service, professional_id)
    if professional.status == ProfessionalAccountStatus.DELETED:
        raise HTTPException(400, "Cannot reactivate a deleted professional")
    return service.admin_reactivate(professional, admin.id, data.reason)


# ─── Flag / unflag ──────────────────────────────────────────

@router.post("/{professional_id}/flag", response_model=ProfessionalAdminResponse)
def admin_flag(
    *,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
    professional_id: UUID,
    data: FlagProfessionalRequest,
):
    service = ProfessionalService(session)
    professional = _get_or_404(service, professional_id)
    return service.admin_flag(
        professional, admin.id, data.reason, data.notes
    )


@router.post("/{professional_id}/unflag", response_model=ProfessionalAdminResponse)
def admin_unflag(
    *,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
    professional_id: UUID,
    data: SuspendProfessionalRequest,
):
    service = ProfessionalService(session)
    professional = _get_or_404(service, professional_id)
    return service.admin_unflag(professional, admin.id, data.reason)


# ─── Trust score ────────────────────────────────────────────

@router.post("/{professional_id}/trust-score", response_model=ProfessionalAdminResponse)
def admin_update_trust_score(
    *,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
    professional_id: UUID,
    data: TrustScoreUpdateRequest,
):
    service = ProfessionalService(session)
    professional = _get_or_404(service, professional_id)
    return service.admin_update_trust_score(
        professional, admin.id, data.new_score, data.reason
    )


# ─── Admin soft delete ──────────────────────────────────────

@router.delete("/{professional_id}", response_model=ProfessionalAdminResponse)
def admin_soft_delete(
    *,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
    professional_id: UUID,
    reason: str = Query(..., min_length=5, max_length=500),
    deletion_type: DeletionType = Query(DeletionType.ADMIN),
):
    service = ProfessionalService(session)
    professional = _get_or_404(service, professional_id)
    if professional.deleted_at is not None:
        raise HTTPException(400, "Professional already deleted")

    user = session.get(User, professional.user_id)
    snapshot = {}
    if user:
        snapshot = {"email": user.email, "username": user.username}

    return service.soft_delete(
        professional,
        deletion_type=deletion_type,
        reason=reason,
        actor_user_id=admin.id,
        actor_role="admin",
        snapshot=snapshot,
    )


# ─── Audit logs ─────────────────────────────────────────────

@router.get(
    "/{professional_id}/audit-logs",
    response_model=ProfessionalAuditLogListResponse,
)
def admin_list_audit_logs(
    *,
    session: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
    professional_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    action: Optional[AuditAction] = None,
):
    service = ProfessionalService(session)
    _get_or_404(service, professional_id)
    items, total = service.audit_repo.list_for_professional(
        professional_id, skip=skip, limit=limit, action=action
    )
    return ProfessionalAuditLogListResponse(
        items=[ProfessionalAuditLogResponse.model_validate(x) for x in items],
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
    )


@router.get("/audit-logs/all", response_model=ProfessionalAuditLogListResponse)
def admin_list_all_audit_logs(
    *,
    session: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    action: Optional[AuditAction] = None,
):
    service = ProfessionalService(session)
    items, total = service.audit_repo.list_all(skip=skip, limit=limit, action=action)
    return ProfessionalAuditLogListResponse(
        items=[ProfessionalAuditLogResponse.model_validate(x) for x in items],
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
    )