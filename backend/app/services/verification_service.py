import secrets
import string
import random
import hashlib
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlmodel import Session, select

from app.core.config import settings
from app.models.user import User, AccountStatus
from app.models.verification_token import VerificationToken
from app.enums.verification import VerificationType


def generate_verification_code() -> str:
    digits = ''.join(secrets.choice(string.digits) for _ in range(3))
    uppercase = ''.join(secrets.choice(string.ascii_uppercase) for _ in range(2))
    lowercase = ''.join(secrets.choice(string.ascii_lowercase) for _ in range(1))
    code_list = list(digits + uppercase + lowercase)
    random.SystemRandom().shuffle(code_list)
    return ''.join(code_list)


def generate_verification_token(user_id: UUID, token_type: VerificationType, session: Session) -> str:
    existing_tokens = session.exec(
        select(VerificationToken).where(
            VerificationToken.user_id == user_id,
            VerificationToken.type == token_type,
            VerificationToken.is_used == False,
        )
    ).all()
    
    for token in existing_tokens:
        session.delete(token)
    session.commit()

    raw_code = generate_verification_code()
    token_hash = hashlib.sha256(raw_code.encode()).hexdigest()

    # FIX: Ensure expiry is stored as naive UTC
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=settings.VERIFICATION_TOKEN_EXPIRE_MINUTES)).replace(tzinfo=None)

    token = VerificationToken(
        user_id=user_id,
        token_hash=token_hash,
        type=token_type,
        expires_at=expires_at,
    )
    session.add(token)
    session.commit()
    
    return raw_code


def verify_token(raw_code: str, token_type: VerificationType, session: Session, activate_user: bool = False) -> User | None:
    raw_code = raw_code.strip()
    token_hash = hashlib.sha256(raw_code.encode()).hexdigest()
    
    # FIX: Ensure current time is naive UTC to match DB
    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)

    token = session.exec(
        select(VerificationToken).where(
            VerificationToken.token_hash == token_hash,
            VerificationToken.type == token_type,
            VerificationToken.is_used == False,
            VerificationToken.expires_at > now_utc,
        )
    ).first()

    if not token:
        return None

    token.is_used = True
    token.used_at = now_utc
    session.add(token)

    user = session.get(User, token.user_id)
    if user:
        if activate_user:
            user.is_email_verified = True
            user.status = AccountStatus.ACTIVE
        session.add(user)

    session.commit()
    return user