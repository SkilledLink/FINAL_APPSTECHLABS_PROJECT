from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session

from app.core.security import decode_token
from app.database.session import get_session
from app.models.user import User, AccountStatus

security = HTTPBearer()

def get_current_user(
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

        if user.status not in [AccountStatus.ACTIVE, AccountStatus.PENDING_VERIFICATION]:
            raise HTTPException(status_code=403, detail="Account not active")

        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.status != AccountStatus.ACTIVE:
        raise HTTPException(status_code=403, detail="Account not active")
    return current_user