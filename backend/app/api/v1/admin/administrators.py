from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.permissions import has_capability
from app.enums.admin import Capability
from app.models.user import User
from app.schemas.admin import RoleUpdateRequest
from app.schemas.user import UserListResponse, UserResponse
from app.services.admin_service import AdminService

router = APIRouter(
    prefix="/admin/administrators",
    tags=["admin-administrators"],
    dependencies=[Depends(has_capability(Capability.MANAGE_ADMINS))],
)


@router.get("", response_model=UserListResponse)
def list_administrators(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session),
):
    items, total = AdminService(session).list_by_role(
        is_admin=True, skip=skip, limit=limit
    )
    return UserListResponse(
        items=[UserResponse.model_validate(u) for u in items],
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
    )


@router.patch("/{user_id}", response_model=UserResponse)
def update_administrator(
    user_id: UUID,
    data: RoleUpdateRequest,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_ADMINS)),
):
    if data.is_moderator is not None:
        raise HTTPException(
            status_code=400,
            detail="Use /admin/moderators to change moderator status",
        )
    if data.is_admin is None:
        raise HTTPException(status_code=400, detail="is_admin must be provided")
    return AdminService(session).update_user_role(
        actor=current_user,
        user_id=user_id,
        is_admin=data.is_admin,
        is_moderator=None,
        reason=data.reason,
        request=request,
    )