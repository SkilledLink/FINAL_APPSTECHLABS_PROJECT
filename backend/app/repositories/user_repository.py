# app/repositories/user_repository.py

from datetime import datetime, timezone
from typing import Optional, Tuple
from uuid import UUID

from sqlmodel import Session, func, select

from app.models.user import User


class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    # ----------------------------------------------------------
    # Lookups
    # ----------------------------------------------------------

    def get_by_id(
        self, user_id: UUID, include_deleted: bool = False
    ) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        if not include_deleted:
            stmt = stmt.where(User.deleted_at.is_(None))
        return self.session.exec(stmt).first()

    def get_by_email(
        self, email: str, include_deleted: bool = False
    ) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        if not include_deleted:
            stmt = stmt.where(User.deleted_at.is_(None))
        return self.session.exec(stmt).first()

    # NOTE: get_by_username() was removed along with the `username`
    # column. If you were calling it somewhere, switch those callers to
    # get_by_email() (or get_by_id()) — usernames are no longer stored
    # on the User model.

    # ----------------------------------------------------------
    # Listing / search
    # ----------------------------------------------------------

    def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        include_deleted: bool = False,
        search: Optional[str] = None,
    ) -> Tuple[list[User], int]:
        stmt = select(User)
        if not include_deleted:
            stmt = stmt.where(User.deleted_at.is_(None))

        count_stmt = select(func.count()).select_from(User)
        if not include_deleted:
            count_stmt = count_stmt.where(User.deleted_at.is_(None))

        if search:
            # Matches any of: email, first name, last name, bio, location.
            # The `username` clause was dropped — column no longer exists.
            condition = (
                (User.email.contains(search))
                | (User.first_name.contains(search))
                | (User.last_name.contains(search))
                | (User.bio.contains(search))
                | (User.location.contains(search))
            )
            stmt = stmt.where(condition)
            count_stmt = count_stmt.where(condition)

        total = self.session.exec(count_stmt).first() or 0

        stmt = (
            stmt.offset(skip)
            .limit(limit)
            .order_by(User.created_at.desc())
        )
        users = self.session.exec(stmt).all()
        return users, total

    # ----------------------------------------------------------
    # Mutations
    # ----------------------------------------------------------

    def update(self, user: User, data: dict) -> User:
        for key, value in data.items():
            # Guard against callers passing `username` in the payload —
            # silently ignore it instead of blowing up with AttributeError.
            if not hasattr(user, key):
                continue
            setattr(user, key, value)
        user.updated_at = datetime.now(timezone.utc)
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def delete(self, user: User, hard: bool = False) -> None:
        if hard:
            self.session.delete(user)
        else:
            user.deleted_at = datetime.now(timezone.utc)
            self.session.add(user)
        self.session.commit()