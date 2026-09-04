from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlmodel import Session
from uuid import UUID
from typing import Optional
from app.dependencies.current_user import get_current_user
from app.database.session import get_session
from app.services.user_service import UserService
from app.schemas.user import UserResponse, UserUpdate, UserListResponse
from app.models.user import User

router = APIRouter(
    prefix="/users",
    tags=["Users"]  # This groups all endpoints under "Users" in Swagger
)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
    description="Returns the profile of the authenticated user.",
    responses={
        200: {"description": "User profile retrieved successfully"},
        401: {"description": "Unauthorized – missing or invalid token"},
    },
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Update current user profile",
    description=(
        "Updates the authenticated user's own profile. "
        "Non‑admin users cannot change `is_admin` or `is_moderator`."
    ),
    responses={
        200: {"description": "Profile updated successfully"},
        400: {"description": "Invalid input data"},
        401: {"description": "Unauthorized"},
    },
)
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = UserService(session)
    updated = service.update_user(current_user.id, data, current_user)
    return updated


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete current user account",
    description="Soft‑deletes the authenticated user's account (sets `deleted_at`).",
    responses={
        204: {"description": "User account deleted successfully"},
        401: {"description": "Unauthorized"},
    },
)
def delete_me(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = UserService(session)
    service.delete_user(current_user.id, current_user, hard=False)
    return None


@router.get(
    "",
    response_model=UserListResponse,
    summary="List all users (admin only)",
    description=(
        "Returns a paginated list of all users. "
        "Only accessible by users with `is_admin=True`."
    ),
    responses={
        200: {"description": "List of users retrieved"},
        403: {"description": "Forbidden – admin access required"},
        401: {"description": "Unauthorized"},
    },
)
def list_users(
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return (max 100)"),
    search: Optional[str] = Query(None, description="Search by email, first name, or last name"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = UserService(session)
    return service.list_users(current_user, skip, limit, search)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get a specific user by ID",
    description=(
        "Retrieves a user's profile by UUID. "
        "Users can only view their own profile; admins can view any user."
    ),
    responses={
        200: {"description": "User profile retrieved"},
        403: {"description": "Forbidden – not enough permissions"},
        404: {"description": "User not found"},
    },
)
def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = UserService(session)
    user = service.get_user_by_id(user_id, current_user)
    return user


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update a user (admin only)",
    description=(
        "Updates any user's profile. Only admins can modify roles (`is_admin`, `is_moderator`). "
        "Admins can also promote/demote others by sending `is_admin`/`is_moderator` in the request body."
    ),
    responses={
        200: {"description": "User updated successfully"},
        403: {"description": "Forbidden – admin access required"},
        404: {"description": "User not found"},
        400: {"description": "Invalid input"},
    },
)
def update_user(
    user_id: UUID,
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # Optional safety check: prevent admin from removing their own admin privileges
    if user_id == current_user.id and data.is_admin is False:
        raise HTTPException(
            status_code=403,
            detail="You cannot remove your own admin privileges"
        )
    service = UserService(session)
    updated = service.update_user(user_id, data, current_user)
    return updated


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user (admin only)",
    description=(
        "Soft‑deletes a user account (sets `deleted_at`). "
        "Admins cannot delete themselves via this endpoint (use `/users/me` instead)."
    ),
    responses={
        204: {"description": "User deleted successfully"},
        403: {"description": "Forbidden – admin access required or cannot delete self"},
        404: {"description": "User not found"},
    },
)
def delete_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # Prevent admin from deleting themselves via this endpoint
    if user_id == current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Use /users/me to delete your own account"
        )
    service = UserService(session)
    service.delete_user(user_id, current_user, hard=False)
    return None