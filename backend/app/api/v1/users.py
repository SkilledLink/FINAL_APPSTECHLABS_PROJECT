# app/api/v1/users.py

from fastapi import APIRouter, Depends, Query, HTTPException, status, UploadFile, File
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from uuid import UUID
from typing import Optional
import logging
import traceback

from app.dependencies.current_user import get_current_user, get_current_active_user
from app.database.session import get_session
from app.services.user_service import UserService
from app.services.user_follow_service import UserFollowService
from app.schemas.user import UserResponse, UserUpdate, UserListResponse
from app.schemas.user_follow import (
    FollowResponse,
    FollowCreate,
    FollowUnfollow,
    FollowersListResponse,
    FollowingListResponse,
    FollowStatusResponse,
)
from app.models.user import User
from app.models.professional import Professional
from app.schemas.professional import ProfessionalResponse

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

logger = logging.getLogger(__name__)


# ============================================================
# CRUD endpoints
# ============================================================

@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = UserService(session)
    return service.get_user_by_id(current_user.id, current_user)


@router.put("/me", response_model=UserResponse)
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = UserService(session)
    return service.update_user(current_user.id, data, current_user)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = UserService(session)
    service.delete_user(current_user.id, current_user, hard=False)
    return None


# ============================================================
# ✅ NEW: Professional lookup by USER ID
# ------------------------------------------------------------
# Returns the professional record attached to a user.
# Eager-loads `user` so Pydantic can serialise the nested
# ProfessionalUserPublic after the SQLAlchemy session closes.
# ============================================================

@router.get(
    "/{user_id}/professional",
    response_model=ProfessionalResponse,
)
def get_user_professional(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Return the professional record attached to a user.

    - 404 if the user has no professional record
    - 404 if the professional record has been soft-deleted
    - Otherwise, returns the full ProfessionalResponse
    """
    professional = session.exec(
        select(Professional)
        .options(selectinload(Professional.user))
        .where(
            Professional.user_id == user_id,
            Professional.deleted_at.is_(None),
        )
    ).first()

    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This user is not a professional",
        )

    return professional


# ============================================================
# List users
# ============================================================

@router.get("", response_model=UserListResponse)
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = UserService(session)
    return service.list_users(current_user, skip, limit, search)


# ============================================================
# Get single user
# ============================================================

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = UserService(session)
    return service.get_user_by_id(user_id, current_user)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if user_id == current_user.id and data.is_admin is False:
        raise HTTPException(
            status_code=403,
            detail="You cannot remove your own admin privileges",
        )

    service = UserService(session)
    return service.update_user(user_id, data, current_user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Use /users/me to delete your own account",
        )

    service = UserService(session)
    service.delete_user(user_id, current_user, hard=False)
    return None


# ============================================================
# Image upload endpoints
# ============================================================

@router.post("/me/profile-image", response_model=UserResponse)
def upload_profile_image(
    file: UploadFile = File(..., description="Image file (JPEG, PNG, WEBP, GIF)"),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    try:
        logger.info(f"Profile image upload for user {current_user.id}")

        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Invalid image content type",
            )

        service = UserService(session)
        return service.upload_profile_image(current_user, file)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}",
        )


@router.post("/me/banner-image", response_model=UserResponse)
def upload_banner_image(
    file: UploadFile = File(..., description="Image file (JPEG, PNG, WEBP, GIF)"),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    try:
        logger.info(f"Banner image upload for user {current_user.id}")

        if (
            not file.content_type
            or not file.content_type.startswith("image/")
        ):
            raise HTTPException(
                status_code=400,
                detail="Invalid image content type",
            )

        service = UserService(session)
        return service.upload_banner_image(current_user, file)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}",
        )


# ============================================================
# Follow endpoints
# ============================================================

@router.post("/me/follow", response_model=FollowResponse)
def follow_user(
    data: FollowCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = UserFollowService(session)
    return service.follow_user(current_user, data.followed_user_id)


@router.delete("/me/follow", status_code=status.HTTP_204_NO_CONTENT)
def unfollow_user(
    data: FollowUnfollow,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = UserFollowService(session)
    service.unfollow_user(current_user, data.followed_user_id)
    return None


@router.get("/{user_id}/followers", response_model=FollowersListResponse)
def get_followers(
    user_id: UUID,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = UserFollowService(session)
    return service.get_followers(user_id, current_user, skip, limit)


@router.get("/{user_id}/following", response_model=FollowingListResponse)
def get_following(
    user_id: UUID,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = UserFollowService(session)
    return service.get_following(user_id, current_user, skip, limit)


@router.get(
    "/me/follow-status/{target_user_id}",
    response_model=FollowStatusResponse,
)
def check_follow_status(
    target_user_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = UserFollowService(session)
    return service.check_follow_status(current_user, target_user_id)