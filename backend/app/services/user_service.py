from fastapi import HTTPException, status
from uuid import UUID
from sqlmodel import Session
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate
from app.models.user import User

class UserService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = UserRepository(session)

    def get_current_user(self, user_id: UUID) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def get_user_by_id(self, user_id: UUID, current_user: User) -> User:
        # Allow access if admin or if requesting own profile
        if not current_user.is_admin and current_user.id != user_id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def list_users(self, current_user: User, skip: int, limit: int, search: Optional[str]) -> dict:
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        users, total = self.repo.get_all(skip=skip, limit=limit, search=search)
        return {"items": users, "total": total, "page": skip // limit + 1, "size": limit}

    def update_user(self, user_id: UUID, data: UserUpdate, current_user: User) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Permission: only admin can update others, or update self (but limited)
        if current_user.id != user_id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not enough permissions")

        # Non‑admins cannot change is_admin/is_moderator, and cannot update email (for now)
        update_data = data.model_dump(exclude_unset=True)
        if not current_user.is_admin:
            # non‑admin cannot change these fields
            update_data.pop("is_admin", None)
            update_data.pop("is_moderator", None)
            # also prevent email change for now (we'll implement with verification later)
            update_data.pop("email", None)

        return self.repo.update(user, update_data)

    def delete_user(self, user_id: UUID, current_user: User, hard: bool = False) -> None:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Only admin can delete others; self-deletion allowed
        if current_user.id != user_id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not enough permissions")

        self.repo.delete(user, hard=hard)