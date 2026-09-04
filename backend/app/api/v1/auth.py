from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.database.session import get_session
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    VerificationRequest,
    VerificationResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
    Token,
)
from app.services.auth_service import (
    register_user,
    login_user,
    request_password_reset,
    reset_password,
)
from app.services.verification_service import verify_token
from app.enums.verification import VerificationType

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description=(
        "Creates a new user account with the provided email, name, and password. "
        "An email with a 6‑digit verification code is sent to the user's inbox. "
        "The account remains inactive until email verification is completed."
    ),
    responses={
        201: {
            "description": "User created successfully – verification email sent",
            "content": {
                "application/json": {
                    "example": {
                        "message": "User created successfully. Please check your email for the 6-digit code.",
                        "user_id": "550e8400-e29b-41d4-a716-446655440000",
                    }
                }
            },
        },
        400: {
            "description": "Invalid input (e.g., email already registered, weak password)",
        },
    },
)
def register(user_data: UserCreate, db: Session = Depends(get_session)):
    try:
        user = register_user(
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            password=user_data.password,
            account_type=user_data.account_type,
            session=db,
        )
        return {
            "message": "User created successfully. Please check your email for the 6-digit code.",
            "user_id": str(user.id),
        }
    except HTTPException as e:
        raise e


@router.post(
    "/verify-email",
    response_model=VerificationResponse,
    summary="Verify email address with a code",
    description=(
        "Confirms the user's email address using the 6‑digit code sent during registration. "
        "Once verified, the user account becomes active and they can log in."
    ),
    responses={
        200: {
            "description": "Email verified successfully",
            "content": {
                "application/json": {
                    "example": {"message": "Email verified successfully!", "verified": True}
                }
            },
        },
        400: {
            "description": "Invalid or expired verification code",
        },
    },
)
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
    return {"message": "Email verified successfully!", "verified": True}


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate a user and obtain tokens",
    description=(
        "Validates the user's email and password, and returns a pair of JWT tokens "
        "(access and refresh). The access token expires in 15 minutes; the refresh token "
        "lasts for 30 days and can be used to obtain a new access token without re‑logging."
    ),
    responses={
        200: {
            "description": "Login successful – tokens returned",
            "content": {
                "application/json": {
                    "example": {
                        "access_token": "eyJhbGciOiJIUzI1NiIs...",
                        "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
                        "token_type": "bearer",
                        "user_id": "550e8400-e29b-41d4-a716-446655440000",
                        "first_name": "John",
                        "last_name": "Doe",
                        "email": "john@example.com",
                        "account_type": "user",
                        "is_admin": False,
                        "is_moderator": False,
                    }
                }
            },
        },
        401: {
            "description": "Invalid credentials (email or password incorrect)",
        },
    },
)
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
        "user_id": str(user.id),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "account_type": user.account_type,
        "is_admin": user.is_admin,
        "is_moderator": user.is_moderator,
    }


@router.post(
    "/password-reset/request",
    summary="Request a password reset",
    description=(
        "Sends a password reset email with a 6‑digit code to the specified email address "
        "if a user with that email exists. The endpoint does not reveal whether the email exists "
        "(returns the same message regardless) for security reasons."
    ),
    responses={
        200: {
            "description": "Reset code sent (if the email exists)",
            "content": {
                "application/json": {
                    "example": {"message": "If that email exists, a reset code has been sent."}
                }
            },
        },
        400: {
            "description": "Invalid email format",
        },
    },
)
def request_reset(payload: PasswordResetRequest, db: Session = Depends(get_session)):
    request_password_reset(payload.email, db)
    return {"message": "If that email exists, a reset code has been sent."}


@router.post(
    "/password-reset/confirm",
    summary="Reset password using a verification code",
    description=(
        "Resets the user's password after validating the email and the 6‑digit reset code. "
        "The new password must be at least 8 characters long. After a successful reset, "
        "the user can log in with the new password."
    ),
    responses={
        200: {
            "description": "Password reset successful",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Password reset successfully. Please log in with your new password.",
                        "user_id": "550e8400-e29b-41d4-a716-446655440000",
                    }
                }
            },
        },
        400: {
            "description": "Invalid or expired reset code, or invalid new password",
        },
        404: {
            "description": "User not found",
        },
    },
)
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