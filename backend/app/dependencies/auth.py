from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session

from app.core.security import decode_token
from app.database.session import get_session
from app.models.user import User
from app.models.refresh_token import RefreshToken

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
) -> User:
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        # Check if user is active
        if user.status not in [AccountStatus.ACTIVE, AccountStatus.PENDING_VERIFICATION]:
            raise HTTPException(status_code=403, detail="Account not active")

        # Optionally, check if token is in blacklist? We don't have a blacklist; refresh tokens handle that.
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.status != AccountStatus.ACTIVE:
        raise HTTPException(status_code=403, detail="Account not active")
    return current_user