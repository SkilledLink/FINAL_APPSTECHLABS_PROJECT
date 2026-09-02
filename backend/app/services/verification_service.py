import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlmodel import Session, select

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User
from app.models.verification_token import VerificationToken
from app.enums.verification import VerificationType


def generate_verification_token(user_id: UUID, token_type: VerificationType, session: Session) -> str:
    # Delete any existing unused tokens for this user and type
    session.exec(
        select(VerificationToken).where(
            VerificationToken.user_id == user_id,
            VerificationToken.type == token_type,
            VerificationToken.is_used == False,
        )
    ).delete()

    # Generate a random token (e.g., 6-digit code or hex)
    raw_token = secrets.token_urlsafe(32)  # or random digits
    token_hash = hash_password(raw_token)  # we hash it for storage

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.VERIFICATION_TOKEN_EXPIRE_MINUTES)

    token = VerificationToken(
        user_id=user_id,
        token_hash=token_hash,
        type=token_type,
        expires_at=expires_at,
    )
    session.add(token)
    session.commit()
    return raw_token  # return plain token to send via email


def verify_token(raw_token: str, token_type: VerificationType, session: Session) -> User | None:
    # We need to find the token by hashing the raw token and comparing
    # But we can't hash and compare efficiently; instead we store tokens and check against hash.
    # Alternative: we can store the raw token in DB (but we chose hash for security).
    # To verify, we can't iterate all tokens; we need a different approach.
    # Better: when the user submits, we search by token_hash computed from raw_token.
    # But we don't know which user. So we store the token_hash and we can search by that.
    # So we must compute the hash of the provided token and search for that hash.
    from app.core.security import hash_password  # we use same hash function
    token_hash = hash_password(raw_token)
    token = session.exec(
        select(VerificationToken).where(
            VerificationToken.token_hash == token_hash,
            VerificationToken.type == token_type,
            VerificationToken.is_used == False,
            VerificationToken.expires_at > datetime.now(timezone.utc),
        )
    ).first()

    if not token:
        return None

    # Mark as used
    token.is_used = True
    token.used_at = datetime.now(timezone.utc)
    session.add(token)

    # Get user
    user = session.get(User, token.user_id)
    if user:
        user.is_email_verified = True
        user.status = AccountStatus.ACTIVE
        session.add(user)

    session.commit()
    return user