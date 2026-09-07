from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlmodel import Session
from uuid import UUID

from app.core.config import settings
from app.database.session import get_session
from app.models.user import User, AccountStatus

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
) -> User:
    """
    Decodes the JWT token, extracts the user ID, and fetches the full User object.
    Raises 401 if invalid or user not found.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = session.get(User, UUID(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# --- NEW dependency to enforce ACTIVE status ---
async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Ensures the user account is ACTIVE.
    Raises 403 if the user is not active.
    """
    if current_user.status != AccountStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active"
        )
    return current_user