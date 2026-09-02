from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.schemas.auth import UserCreate, UserLogin, Token, RefreshTokenRequest, VerificationRequest, VerificationResponse
from app.services.auth_service import register_user, login_user, refresh_access_token, logout_user
from app.services.verification_service import verify_token
from app.database.session import get_session
from app.enums.verification import VerificationType

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
async def register(user_data: UserCreate, session: Session = Depends(get_session)):
    user = await register_user(
        email=user_data.email,
        username=user_data.username,
        password=user_data.password,
        account_type=user_data.account_type,
        session=session,
    )
    return {"message": "User created. Please verify your email."}


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, session: Session = Depends(get_session)):
    access, refresh = login_user(
        email=user_data.email,
        password=user_data.password,
        session=session,
    )
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}


@router.post("/refresh", response_model=Token)
async def refresh(token_data: RefreshTokenRequest, session: Session = Depends(get_session)):
    new_access = refresh_access_token(token_data.refresh_token, session)
    # Return new access token; optionally also return a new refresh token (rotation)
    # For simplicity, we return only new access, but you can issue a new refresh as well.
    return {"access_token": new_access, "refresh_token": token_data.refresh_token, "token_type": "bearer"}


@router.post("/verify-email", response_model=VerificationResponse)
async def verify_email(verify_data: VerificationRequest, session: Session = Depends(get_session)):
    # verify_data.code is the raw token or code
    user = verify_token(verify_data.code, VerificationType.EMAIL_VERIFICATION, session)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    return {"message": "Email verified successfully", "verified": True}


@router.post("/logout")
async def logout(token_data: RefreshTokenRequest, session: Session = Depends(get_session)):
    logout_user(token_data.refresh_token, session)
    return {"message": "Logged out successfully"}