from sqlmodel import Session, select, func, delete
from uuid import UUID
from typing import Optional, Tuple, List, Dict

from app.models.user_follow import UserFollow
from app.models.user import User


class UserFollowRepository:
    def __init__(self, session: Session):
        self.session = session

    # ============================================================
    # FOLLOW / UNFOLLOW
    # ============================================================

    def follow(self, follower_id: UUID, followed_id: UUID) -> UserFollow:
        existing = self.session.exec(
            select(UserFollow).where(
                UserFollow.follower_id == follower_id,
                UserFollow.followed_id == followed_id,
            )
        ).first()

        if existing:
            return existing

        follow = UserFollow(
            follower_id=follower_id,
            followed_id=followed_id,
        )

        self.session.add(follow)
        self.session.commit()
        self.session.refresh(follow)

        return follow

    def unfollow(self, follower_id: UUID, followed_id: UUID) -> bool:
        statement = delete(UserFollow).where(
            UserFollow.follower_id == follower_id,
            UserFollow.followed_id == followed_id,
        )

        result = self.session.exec(statement)
        self.session.commit()

        return result.rowcount > 0

    # ============================================================
    # FOLLOWING STATUS
    # ============================================================

    def is_following(
        self,
        follower_id: UUID,
        followed_id: UUID,
    ) -> bool:
        statement = select(UserFollow).where(
            UserFollow.follower_id == follower_id,
            UserFollow.followed_id == followed_id,
        )

        return self.session.exec(statement).first() is not None

    # ============================================================
    # FOLLOWERS
    # ============================================================

    def get_followers(
        self,
        user_id: UUID,
        skip: int = 0,
        limit: int = 50,
    ) -> List[User]:
        statement = (
            select(User)
            .join(
                UserFollow,
                UserFollow.follower_id == User.id,
            )
            .where(UserFollow.followed_id == user_id)
            .offset(skip)
            .limit(limit)
        )

        return list(self.session.exec(statement).all())

    # ============================================================
    # FOLLOWING
    # ============================================================

    def get_following(
        self,
        user_id: UUID,
        skip: int = 0,
        limit: int = 50,
    ) -> List[User]:
        statement = (
            select(User)
            .join(
                UserFollow,
                UserFollow.followed_id == User.id,
            )
            .where(UserFollow.follower_id == user_id)
            .offset(skip)
            .limit(limit)
        )

        return list(self.session.exec(statement).all())

    # ============================================================
    # FOLLOW COUNTS
    # ============================================================

    def get_follow_count(
        self,
        user_id: UUID,
        follow_type: str = "followers",
    ) -> int:
        if follow_type == "followers":
            statement = select(func.count()).where(
                UserFollow.followed_id == user_id
            )
        else:
            statement = select(func.count()).where(
                UserFollow.follower_id == user_id
            )

        return self.session.exec(statement).one()

    # ============================================================
    # BATCH FOLLOW COUNTS
    # ============================================================

    def get_follow_counts_for_users(
        self,
        user_ids: List[UUID],
        follow_type: str = "followers",
    ) -> Dict[UUID, int]:
        """
        Get follower/following counts for multiple users.

        Returns:
            {
                user_id: count
            }
        """

        if not user_ids:
            return {}

        if follow_type == "followers":
            id_column = UserFollow.followed_id
        else:
            id_column = UserFollow.follower_id

        statement = (
            select(
                id_column,
                func.count().label("count"),
            )
            .where(id_column.in_(user_ids))
            .group_by(id_column)
        )

        results = self.session.exec(statement).all()

        return {
            row[0]: row[1]
            for row in results
        }

    # ============================================================
    # BATCH FOLLOWING STATUS
    # ============================================================

    def get_following_status_for_users(
        self,
        follower_id: UUID,
        target_user_ids: List[UUID],
    ) -> Dict[UUID, bool]:
        """
        Check whether follower_id follows each target user.

        Returns:
            {
                target_user_id: True/False
            }
        """

        if not target_user_ids:
            return {}

        statement = select(UserFollow.followed_id).where(
            UserFollow.follower_id == follower_id,
            UserFollow.followed_id.in_(target_user_ids),
        )

        followed_ids = {
            row[0]
            for row in self.session.exec(statement).all()
        }

        return {
            user_id: user_id in followed_ids
            for user_id in target_user_ids
        }