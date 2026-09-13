from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.permissions import has_capability
from app.enums.admin import Capability
from app.models.user import User
from app.schemas.admin import AuditLogListResponse, AuditLogResponse
from app.services.audit_service import AuditService

router = APIRouter(
    prefix="/moderator/audit-logs",
    tags=["moderator-audit-logs"],
    dependencies=[Depends(has_capability(Capability.VIEW_AUDIT_LOG))],
)


@router.get("/me", response_model=AuditLogListResponse)
def list_my_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    action: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.VIEW_AUDIT_LOG)),
):
    # Forced actor filter: moderators see only their own entries.
    items, total = AuditService(session).list_logs(
        skip=skip,
        limit=limit,
        actor_user_id=current_user.id,
        entity_type=entity_type,
        action=action,
    )
    return AuditLogListResponse(
        items=[AuditLogResponse.model_validate(x) for x in items],
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
    )