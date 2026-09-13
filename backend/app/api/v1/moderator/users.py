from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.permissions import has_capability
from app.enums.admin import Capability
from app.models.user import User
from app.schemas.admin import AdminActionRequest
from app.schemas.user import UserListResponse, UserResponse
from app.services.admin_service import AdminService

router = APIRouter(
    prefix="/moderator/users",
    tags=["moderator-users"],
    dependencies=[Depends(has_capability(Capability.VIEW_USERS))],
)


@router.get("", response_model=UserListResponse)
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    items, total = AdminService(session).list_users(
        skip=skip, limit=limit, search=search, include_deleted=False
    )
    return UserListResponse(
        items=[UserResponse.model_validate(u) for u in items],
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
    )


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: UUID, session: Session = Depends(get_session)):
    return AdminService(session).get_user(user_id)


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