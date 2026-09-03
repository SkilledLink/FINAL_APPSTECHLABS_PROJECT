from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.database.session import get_session
from app.schemas.auth import (UserCreate, UserLogin, VerificationRequest, 
                              VerificationResponse, PasswordResetRequest, PasswordResetConfirm)
from app.services.auth_service import (register_user, login_user, 
                                       request_password_reset, reset_password)
from app.services.verification_service import verify_token
from app.enums.verification import VerificationType

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_session)):
    try:
        user = register_user(
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            password=user_data.password,
            account_type=user_data.account_type,
            session=db
        )
        return {"message": "User created successfully. Please check your email for the 6-digit code.", "user_id": str(user.id)}
    except HTTPException as e:
        raise e


@router.post("/verify-email", response_model=VerificationResponse)
def verify_email(payload: VerificationRequest, db: Session = Depends(get_session)):
    user = verify_token(payload.code, VerificationType.EMAIL_VERIFICATION, db, activate_user=True)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
        
    return {"message": "Email verified successfully!", "verified": True}


@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_session)):
    access_token, refresh_token, user = login_user(
        email=credentials.email,
        password=credentials.password,
        session=db
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": str(user.id),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "account_type": user.account_type,
        "is_admin": user.is_admin,
        "is_moderator": user.is_moderator,
    }


@router.post("/password-reset/request")
def request_reset(payload: PasswordResetRequest, db: Session = Depends(get_session)):
    request_password_reset(payload.email, db)
    return {"message": "If that email exists, a reset code has been sent."}


@router.post("/password-reset/confirm")
def confirm_reset(payload: PasswordResetConfirm, db: Session = Depends(get_session)):
    user = reset_password(payload.email, payload.code, payload.new_password, db)
    return {"message": "Password reset successfully. Please log in with your new password.", "user_id": str(user.id)}