from sqlmodel import Session, select, func
from uuid import UUID
from datetime import datetime
from typing import Optional, Tuple
from app.models.user import User

class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, user_id: UUID, include_deleted: bool = False) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        if not include_deleted:
            stmt = stmt.where(User.deleted_at.is_(None))
        return self.session.exec(stmt).first()

    def get_by_email(self, email: str, include_deleted: bool = False) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        if not include_deleted:
            stmt = stmt.where(User.deleted_at.is_(None))
        return self.session.exec(stmt).first()

    def get_by_username(self, username: str, include_deleted: bool = False) -> Optional[User]:
        stmt = select(User).where(User.username == username)
        if not include_deleted:
            stmt = stmt.where(User.deleted_at.is_(None))
        return self.session.exec(stmt).first()

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
        if search:
            stmt = stmt.where(
                (User.email.contains(search)) |
                (User.first_name.contains(search)) |
                (User.last_name.contains(search)) |
                (User.username.contains(search)) |
                (User.bio.contains(search)) |
                (User.location.contains(search))
            )
        count_stmt = select(func.count()).select_from(User)
        if not include_deleted:
            count_stmt = count_stmt.where(User.deleted_at.is_(None))
        if search:
            count_stmt = count_stmt.where(
                (User.email.contains(search)) |
                (User.first_name.contains(search)) |
                (User.last_name.contains(search)) |
                (User.username.contains(search)) |
                (User.bio.contains(search)) |
                (User.location.contains(search))
            )
        total = self.session.exec(count_stmt).first() or 0

        stmt = stmt.offset(skip).limit(limit).order_by(User.created_at.desc())
        users = self.session.exec(stmt).all()
        return users, total

    def update(self, user: User, data: dict) -> User:
        for key, value in data.items():
            setattr(user, key, value)
        user.updated_at = datetime.utcnow()
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def delete(self, user: User, hard: bool = False) -> None:
        if hard:
            self.session.delete(user)
        else:
            user.deleted_at = datetime.utcnow()
            self.session.add(user)
        self.session.commit()