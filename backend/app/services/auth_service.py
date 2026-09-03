from datetime import datetime, timedelta, timezone
from sqlmodel import Session, select
from fastapi import HTTPException
import jwt

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User, AccountStatus
from app.models.refresh_token import RefreshToken
from app.enums.user import AccountType
from app.enums.verification import VerificationType
from app.services.verification_service import generate_verification_token, verify_token
from app.services.email_service import send_verification_email, send_password_reset_email
from app.core.config import settings


def register_user(email: str, first_name: str, last_name: str, password: str, account_type: str, session: Session) -> User:
    email = email.strip().lower()
    first_name = first_name.strip()
    last_name = last_name.strip()

    existing = session.exec(select(User).where(User.email == email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if account_type not in ["user", "professional", "business"]:
        raise HTTPException(status_code=400, detail="Invalid account type")

    hashed = hash_password(password)

    user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
        hashed_password=hashed,
        account_type=AccountType(account_type),
        status=AccountStatus.PENDING_VERIFICATION,
        is_email_verified=False,
        is_admin=False,
        is_moderator=False,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    raw_code = generate_verification_token(user.id, VerificationType.EMAIL_VERIFICATION, session)
    send_verification_email(user.email, raw_code)

    return user


def login_user(email: str, password: str, session: Session) -> tuple[str, str, User]:
    email = email.strip().lower()
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if user.status == AccountStatus.SUSPENDED:
        raise HTTPException(status_code=403, detail="Account suspended")
    if user.status == AccountStatus.DEACTIVATED:
        raise HTTPException(status_code=403, detail="Account deactivated")
    if not user.is_email_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    user.last_login_at = now_utc
    session.add(user)
    session.commit()

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    refresh_hash = hash_password(refresh_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh = RefreshToken(user_id=user.id, token_hash=refresh_hash, expires_at=expires_at)
    session.add(db_refresh)
    session.commit()

    return access_token, refresh_token, user


def request_password_reset(email: str, session: Session) -> None:
    email = email.strip().lower()
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        return
    raw_code = generate_verification_token(user.id, VerificationType.PASSWORD_RESET, session)
    send_password_reset_email(user.email, raw_code)


def reset_password(email: str, code: str, new_password: str, session: Session) -> User:
    email = email.strip().lower()
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")

    # FIX: Use naive UTC to match PostgreSQL TIMESTAMP WITHOUT TIME ZONE
    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)

    # 1-Month Limit
    if user.password_changed_at:
        time_since_change = now_utc - user.password_changed_at
        if time_since_change < timedelta(days=30):
            days_left = (timedelta(days=30) - time_since_change).days
            raise HTTPException(status_code=403, detail=f"You must wait {days_left} days before changing your password again.")

    verified_user = verify_token(code, VerificationType.PASSWORD_RESET, session, activate_user=False)
    if not verified_user:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    user.hashed_password = hash_password(new_password)
    user.password_changed_at = now_utc
    session.add(user)

    # Log out everywhere by revoking all refresh tokens
    tokens = session.exec(select(RefreshToken).where(RefreshToken.user_id == user.id)).all()
    for token in tokens:
        token.is_revoked = True
        token.revoked_at = now_utc
        session.add(token)

    session.commit()
    session.refresh(user)
    return user


def refresh_access_token(refresh_token: str, session: Session) -> str:
    try:
        payload = decode_token(refresh_token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        token_hash = hash_password(refresh_token)
        now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
        db_token = session.exec(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.is_revoked == False,
                RefreshToken.expires_at > now_utc,
            )
        ).first()
        if not db_token:
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

        return create_access_token({"sub": user_id})
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


def logout_user(refresh_token: str, session: Session) -> None:
    token_hash = hash_password(refresh_token)
    db_token = session.exec(select(RefreshToken).where(RefreshToken.token_hash == token_hash)).first()
    if db_token:
        now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
        db_token.is_revoked = True
        db_token.revoked_at = now_utc
        session.add(db_token)
        session.commit()