from uuid import UUID
from typing import Optional

from fastapi import HTTPException, UploadFile
from sqlmodel import Session

from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.user_follow_repository import UserFollowRepository
from app.schemas.user import UserResponse, UserUpdate
from app.services.storage_service import StorageService


class UserService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = UserRepository(session)
        self.follow_repo = UserFollowRepository(session)

    def get_current_user(self, user_id: UUID) -> User:
        user = self.repo.get_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        return user

    def get_user_by_id(
        self,
        user_id: UUID,
        current_user: User,
    ) -> UserResponse:
        user = self.repo.get_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        if current_user.id != user_id and not current_user.is_admin:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions",
            )

        return self._build_user_response(
            user,
            current_user,
        )

    def _build_user_response(
        self,
        user: User,
        current_user: User,
    ) -> UserResponse:
        followers_count = self.follow_repo.get_follow_count(
            user.id,
            "followers",
        )

        following_count = self.follow_repo.get_follow_count(
            user.id,
            "following",
        )

        is_following = self.follow_repo.is_following(
            current_user.id,
            user.id,
        )

        response = UserResponse.model_validate(user)

        response.followers_count = followers_count
        response.following_count = following_count
        response.is_following = is_following

        return response

    def update_user(
        self,
        user_id: UUID,
        data: UserUpdate,
        current_user: User,
    ) -> User:
        user = self.repo.get_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        if current_user.id != user_id and not current_user.is_admin:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions",
            )

        update_data = data.model_dump(
            exclude_unset=True
        )

        if not current_user.is_admin:
            update_data.pop("is_admin", None)
            update_data.pop("is_moderator", None)
            update_data.pop("email", None)

        return self.repo.update(
            user,
            update_data,
        )

    def delete_user(
        self,
        user_id: UUID,
        current_user: User,
        hard: bool = False,
    ) -> None:
        user = self.repo.get_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        if current_user.id != user_id and not current_user.is_admin:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions",
            )

        self.repo.delete(
            user,
            hard=hard,
        )

    def upload_profile_image(
        self,
        user: User,
        file: UploadFile,
    ) -> User:
        storage = StorageService()

        url = storage.upload_image(
            file,
            str(user.id),
            folder="profile",
        )

        user.profile_image_url = url

        self.repo.update(
            user,
            {
                "profile_image_url": url,
            },
        )

        return user