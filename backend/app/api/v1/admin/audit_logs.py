from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.permissions import require_admin
from app.schemas.admin import AuditLogListResponse, AuditLogResponse
from app.services.audit_service import AuditService

router = APIRouter(
    prefix="/admin/audit-logs",
    tags=["admin-audit-logs"],
    dependencies=[Depends(require_admin)],
)


@router.get("", response_model=AuditLogListResponse)
def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    actor_user_id: Optional[UUID] = Query(None),
    entity_type: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    items, total = AuditService(session).list_logs(
        skip=skip,
        limit=limit,
        actor_user_id=actor_user_id,
        entity_type=entity_type,
        action=action,
    )
    return AuditLogListResponse(
        items=[AuditLogResponse.model_validate(x) for x in items],
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
    )


@router.get("/{log_id}", response_model=AuditLogResponse)
def get_audit_log(log_id: UUID, session: Session = Depends(get_session)):
    log = AuditService(session).get_by_id(log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Audit log not found")
    return log