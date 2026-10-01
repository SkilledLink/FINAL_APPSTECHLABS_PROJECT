# app/api/v1/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.database.session import get_session
from app.enums.verification import VerificationType
from app.schemas.auth import (
    PasswordResetConfirm,
    PasswordResetRequest,
    Token,
    UserCreate,
    UserLogin,
    VerificationRequest,
)
from app.services.auth_service import (
    create_tokens_for_user,
    login_user,
    register_user,
    request_password_reset,
    resend_verification_email,
    reset_password,
)
from app.services.verification_service import verify_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_session)):
    user = register_user(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        password=user_data.password,
        session=db,
    )
    return {
        "message": "User created successfully. Check your email for the verification code.",
        "user_id": str(user.id),
    }


@router.post("/verify-email", response_model=Token)
def verify_email(payload: VerificationRequest, db: Session = Depends(get_session)):
    user = verify_token(
        payload.code,
        VerificationType.EMAIL_VERIFICATION,
        db,
        activate_user=True,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code",
        )

    access_token, refresh_token = create_tokens_for_user(user, db)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/resend-verification", status_code=status.HTTP_200_OK)
def resend_verification(
    payload: PasswordResetRequest,
    db: Session = Depends(get_session),
):
    resend_verification_email(payload.email, session=db)
    return {
        "message": (
            "If an unverified account exists for that email, "
            "a new verification code has been sent."
        )
    }


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_session)):
    access_token, refresh_token, user = login_user(
        email=credentials.email,
        password=credentials.password,
        session=db,
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/password-reset/request")
def request_reset(payload: PasswordResetRequest, db: Session = Depends(get_session)):
    request_password_reset(payload.email, db)
    return {"message": "If that email exists, a reset code has been sent."}


@router.post("/password-reset/confirm")
def confirm_reset(payload: PasswordResetConfirm, db: Session = Depends(get_session)):
    user = reset_password(
        payload.email,
        payload.code,
        payload.new_password,
        db,
    )
    return {
        "message": "Password reset successfully. Please log in with your new password.",
        "user_id": str(user.id),
    }