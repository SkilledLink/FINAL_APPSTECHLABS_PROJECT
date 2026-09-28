# app/services/user_service.py

from uuid import UUID, uuid4
from typing import Optional

from fastapi import HTTPException, UploadFile
from sqlmodel import Session

from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.user_follow_repository import UserFollowRepository
from app.schemas.user import UserResponse, UserUpdate, UserListResponse
from app.services.storage_service import StorageService


class UserService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = UserRepository(session)
        self.follow_repo = UserFollowRepository(session)

    # ─── GET USER MODEL (plain User, for internal use) ──────────
    def get_user_model_by_id(self, user_id: UUID) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(404, "User not found")
        return user

    # ─── GET CURRENT USER ───────────────────────────────────────
    def get_current_user(self, user_id: UUID) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(404, "User not found")
        return user

    # ─── LIST ALL USERS ──────────────────────────────────────────
    def list_users(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
    ) -> UserListResponse:
        users, total = self.repo.get_all(skip, limit, search=search)
        items = []
        for user in users:
            resp = self._build_user_response(user, current_user)
            items.append(resp)
        return UserListResponse(
            items=items,
            total=total,
            page=skip // limit + 1 if limit else 1,
            size=limit,
        )

    # ─── GET USER BY ID ─────────────────────────────────────────
    def get_user_by_id(self, user_id: UUID, current_user: User) -> UserResponse:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(404, "User not found")

        if getattr(user, "deleted_at", None) is not None:
            raise HTTPException(404, "User not found")

        is_self = current_user.id == user_id
        is_admin = bool(getattr(current_user, "is_admin", False))

        response = self._build_user_response(user, current_user)

        if not (is_self or is_admin):
            response.email = None
            response.is_email_verified = False
            response.is_admin = False
            response.is_moderator = False
            response.last_login_at = None

        return response

    # ─── BUILD USER RESPONSE ────────────────────────────────────
    def _build_user_response(self, user: User, current_user: User) -> UserResponse:
        followers_count = self.follow_repo.get_follow_count(user.id, "followers")
        following_count = self.follow_repo.get_follow_count(user.id, "following")

        if current_user.id == user.id:
            is_following = False
        else:
            is_following = self.follow_repo.is_following(current_user.id, user.id)

        response = UserResponse.model_validate(user)
        response.followers_count = followers_count
        response.following_count = following_count
        response.is_following = is_following
        return response

    # ─── UPDATE USER (owner or admin only) ──────────────────────
    def update_user(self, user_id: UUID, data: UserUpdate, current_user: User) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(404, "User not found")
        if current_user.id != user_id and not current_user.is_admin:
            raise HTTPException(403, "Not enough permissions")
        update_data = data.model_dump(exclude_unset=True)
        if not current_user.is_admin:
            update_data.pop("is_admin", None)
            update_data.pop("is_moderator", None)
            update_data.pop("email", None)
        return self.repo.update(user, update_data)

    # ─── DELETE USER (owner or admin only) ──────────────────────
    def delete_user(self, user_id: UUID, current_user: User, hard: bool = False) -> None:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(404, "User not found")
        if current_user.id != user_id and not current_user.is_admin:
            raise HTTPException(403, "Not enough permissions")
        self.repo.delete(user, hard=hard)

    # ─── UPLOAD PROFILE IMAGE ──────────────────────────────────
    def upload_profile_image(self, user: User, file: UploadFile) -> User:
        storage = StorageService()
        # Unique public_id → new URL each time → no Cloudinary
        # "overwrite=false" collision, no browser/CDN caching issues.
        unique = uuid4().hex[:12]
        url = storage.upload_image(
            file,
            folder=f"users/{user.id}/profile",
            public_id=f"avatar_{unique}",
        )
        user.profile_image_url = url
        self.repo.update(user, {"profile_image_url": url})
        return user

    # ─── UPLOAD BANNER IMAGE ────────────────────────────────────
    def upload_banner_image(self, user: User, file: UploadFile) -> User:
        storage = StorageService()
        unique = uuid4().hex[:12]
        url = storage.upload_image(
            file,
            folder=f"users/{user.id}/banner",
            public_id=f"banner_{unique}",
        )
        user.banner_image_url = url
        self.repo.update(user, {"banner_image_url": url})
        return user