import logging
from fastapi import HTTPException, status
from uuid import UUID
from sqlmodel import Session
from typing import Optional

from app.models.user import User
from app.repositories.user_follow_repository import UserFollowRepository
from app.schemas.user_follow import (
    FollowResponse,
    FollowersListResponse,
    FollowingListResponse,
    FollowStatusResponse,
)
from app.services.notification_service import NotificationService
from app.services.user_service import UserService

logger = logging.getLogger(__name__)


class UserFollowService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = UserFollowRepository(session)
        self.user_service = UserService(session)

    def _get_user_or_404(self, user_id: UUID) -> User:
        user = self.user_service.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def follow_user(
        self, current_user: User, followed_user_id: UUID
    ) -> FollowResponse:
        if current_user.id == followed_user_id:
            raise HTTPException(
                status_code=400, detail="You cannot follow yourself"
            )

        self._get_user_or_404(followed_user_id)

        if self.repo.is_following(current_user.id, followed_user_id):
            raise HTTPException(
                status_code=400, detail="Already following this user"
            )

        follow = self.repo.follow(current_user.id, followed_user_id)

        try:
            display = NotificationService.display_name(current_user)
            NotificationService(self.session).notify_follow(
                recipient_id=followed_user_id,
                actor_id=current_user.id,
                actor_display=display,
            )
        except Exception:
            logger.exception("Follow notification failed")

        return FollowResponse.model_validate(follow)

    def unfollow_user(self, current_user: User, followed_user_id: UUID) -> None:
        if current_user.id == followed_user_id:
            raise HTTPException(
                status_code=400, detail="You cannot unfollow yourself"
            )

        self._get_user_or_404(followed_user_id)

        deleted = self.repo.unfollow(current_user.id, followed_user_id)
        if not deleted:
            raise HTTPException(
                status_code=400, detail="Not following this user"
            )

        try:
            NotificationService(self.session).notify_unfollow(
                recipient_id=followed_user_id,
                actor_id=current_user.id,
            )
        except Exception:
            logger.exception("Unfollow notification failed")

    def get_followers(
        self,
        user_id: UUID,
        current_user: User,
        skip: int = 0,
        limit: int = 20,
    ) -> FollowersListResponse:
        self._get_user_or_404(user_id)
        users, total = self.repo.get_followers(user_id, skip, limit)
        return FollowersListResponse(items=users, total=total)

    def get_following(
        self,
        user_id: UUID,
        current_user: User,
        skip: int = 0,
        limit: int = 20,
    ) -> FollowingListResponse:
        self._get_user_or_404(user_id)
        users, total = self.repo.get_following(user_id, skip, limit)
        return FollowingListResponse(items=users, total=total)

    def check_follow_status(
        self,
        current_user: User,
        target_user_id: UUID,
    ) -> FollowStatusResponse:
        self._get_user_or_404(target_user_id)
        is_following = self.repo.is_following(current_user.id, target_user_id)
        return FollowStatusResponse(is_following=is_following)

    def get_follower_count(self, user_id: UUID) -> int:
        return self.repo.get_follow_count(user_id, "followers")

    def get_following_count(self, user_id: UUID) -> int:
        return self.repo.get_follow_count(user_id, "following")

    def get_user_follow_stats(
        self, target_user_id: UUID, current_user: Optional[User] = None
    ) -> dict:
        """Return dict with followers_count, following_count, is_following."""
        followers_count = self.repo.get_follow_count(
            target_user_id, "followers"
        )
        following_count = self.repo.get_follow_count(
            target_user_id, "following"
        )
        is_following = False
        if current_user:
            is_following = self.repo.is_following(
                current_user.id, target_user_id
            )
        return {
            "followers_count": followers_count,
            "following_count": following_count,
            "is_following": is_following,
        }