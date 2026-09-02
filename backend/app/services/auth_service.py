from datetime import timedelta
from uuid import UUID

from sqlmodel import Session, select
from fastapi import HTTPException, status

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User, AccountStatus
from app.models.refresh_token import RefreshToken
from app.models.verification_token import VerificationToken
from app.enums.user import AccountType, AccountStatus
from app.enums.verification import VerificationType
from app.services.verification_service import generate_verification_token, verify_token
from app.services.email_service import send_verification_email
from app.core.config import settings


async def register_user(email: str, username: str, password: str, account_type: str, session: Session) -> User:
    # Normalize
    email = email.strip().lower()
    username = username.strip().lower()

    # Check if email exists
    existing = session.exec(select(User).where(User.email == email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing = session.exec(select(User).where(User.username == username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Validate account_type
    if account_type not in ["user", "professional", "business"]:
        raise HTTPException(status_code=400, detail="Invalid account type")

    hashed = hash_password(password)

    user = User(
        email=email,
        username=username,
        hashed_password=hashed,
        account_type=AccountType(account_type),
        status=AccountStatus.PENDING_VERIFICATION,
        is_email_verified=False,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Generate verification token (email verification)
    raw_token = generate_verification_token(user.id, VerificationType.EMAIL_VERIFICATION, session)

    # Send email (async, but we'll call sync for simplicity; better to use background tasks)
    await send_verification_email(user.email, raw_token)

    return user


def login_user(email: str, password: str, session: Session) -> tuple[str, str]:
    email = email.strip().lower()
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # Check account status
    if user.status == AccountStatus.SUSPENDED:
        raise HTTPException(status_code=403, detail="Account suspended")
    if user.status == AccountStatus.DEACTIVATED:
        raise HTTPException(status_code=403, detail="Account deactivated")
    if not user.is_email_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    session.add(user)
    session.commit()

    # Create tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Store refresh token hash
    from app.core.security import hash_password
    refresh_hash = hash_password(refresh_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh = RefreshToken(
        user_id=user.id,
        token_hash=refresh_hash,
        expires_at=expires_at,
    )
    session.add(db_refresh)
    session.commit()

    return access_token, refresh_token


def refresh_access_token(refresh_token: str, session: Session) -> str:
    try:
        payload = decode_token(refresh_token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        # Check if token exists and not revoked
        from app.core.security import hash_password
        token_hash = hash_password(refresh_token)
        db_token = session.exec(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.is_revoked == False,
                RefreshToken.expires_at > datetime.now(timezone.utc),
            )
        ).first()
        if not db_token:
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

        # Issue new access token
        new_access = create_access_token({"sub": user_id})
        return new_access

    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


def logout_user(refresh_token: str, session: Session) -> None:
    from app.core.security import hash_password
    token_hash = hash_password(refresh_token)
    db_token = session.exec(select(RefreshToken).where(RefreshToken.token_hash == token_hash)).first()
    if db_token:
        db_token.is_revoked = True
        db_token.revoked_at = datetime.now(timezone.utc)
        session.add(db_token)
        session.commit()