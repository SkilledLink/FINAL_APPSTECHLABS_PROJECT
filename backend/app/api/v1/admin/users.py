from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.permissions import has_capability, require_admin
from app.enums.admin import Capability
from app.enums.user import AccountStatus
from app.models.user import User
from app.schemas.admin import AdminActionRequest, RoleUpdateRequest
from app.schemas.user import UserListResponse, UserResponse
from app.services.admin_service import AdminService

router = APIRouter(
    prefix="/admin/users",
    tags=["admin-users"],
    dependencies=[Depends(has_capability(Capability.VIEW_USERS))],
)


@router.get("", response_model=UserListResponse)
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    include_deleted: bool = Query(False),
    status_filter: Optional[AccountStatus] = Query(None, alias="status"),
    session: Session = Depends(get_session),
):
    items, total = AdminService(session).list_users(
        skip=skip,
        limit=limit,
        search=search,
        include_deleted=include_deleted,
        status_filter=status_filter,
    )
    return UserListResponse(
        items=[UserResponse.model_validate(u) for u in items],
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
    )


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    include_deleted: bool = Query(False),
    session: Session = Depends(get_session),
):
    return AdminService(session).get_user(
        user_id, include_deleted=include_deleted
    )


@router.post("/{user_id}/suspend", response_model=UserResponse)
def suspend_user(
    user_id: UUID,
    data: AdminActionRequest,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.SUSPEND_USERS)),
):
    return AdminService(session).suspend_user(
        actor=current_user,
        user_id=user_id,
        reason=data.reason,
        request=request,
    )


@router.post("/{user_id}/reactivate", response_model=UserResponse)
def reactivate_user(
    user_id: UUID,
    data: AdminActionRequest,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.SUSPEND_USERS)),
):
    return AdminService(session).reactivate_user(
        actor=current_user,
        user_id=user_id,
        reason=data.reason,
        request=request,
    )


@router.delete("/{user_id}", response_model=UserResponse)
def delete_user(
    user_id: UUID,
    reason: str = Query(..., min_length=5, max_length=500),
    request: Request = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.DELETE_USERS)),
):
    return AdminService(session).soft_delete_user(
        actor=current_user,
        user_id=user_id,
        reason=reason,
        request=request,
    )


@router.patch("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: UUID,
    data: RoleUpdateRequest,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    return AdminService(session).update_user_role(
        actor=current_user,
        user_id=user_id,
        is_admin=data.is_admin,
        is_moderator=data.is_moderator,
        reason=data.reason,
        request=request,
    )