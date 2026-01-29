from fastapi import APIRouter, Depends, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.services.auth_service import AuthService
from app.services.session_service import SessionService
from app.schemas.user import UserRegister, UserLogin
from app.schemas.auth import (
    EmailVerificationRequest,
    ResendVerificationRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    RefreshTokenRequest,
    TokenResponse,
    SessionInfo
)
from app.schemas.common import MessageResponse
from app.core.dependencies import get_current_user, security
from fastapi.security import HTTPAuthorizationCredentials
from typing import List

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Register a new user.
    
    - **name**: User's full name
    - **email**: Valid email address
    - **password**: Password (min 6 characters)
    
    Returns a success message. User must verify email before login.
    """
    auth_service = AuthService(db)
    result = await auth_service.register_user(
        name=user_data.name,
        email=user_data.email,
        password=user_data.password,
        request=request
    )
    return result


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    data: EmailVerificationRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Verify user's email address with token from email.
    
    - **token**: Verification token from email
    """
    auth_service = AuthService(db)
    result = await auth_service.verify_email(data.token)
    return result


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    data: ResendVerificationRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Resend verification email.
    
    - **email**: User's email address
    """
    auth_service = AuthService(db)
    result = await auth_service.resend_verification_email(data.email)
    return result


@router.post("/login", response_model=TokenResponse)
async def login(
    user_data: UserLogin,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Login with email and password.
    
    - **email**: User's email
    - **password**: User's password
    
    Returns access token (15min) and refresh token (30 days).
    Email must be verified to login.
    """
    auth_service = AuthService(db)
    result = await auth_service.login_user(
        email=user_data.email,
        password=user_data.password,
        request=request
    )
    return result


@router.post("/refresh", response_model=dict)
async def refresh_token(
    data: RefreshTokenRequest,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Refresh access token using refresh token.
    
    - **refreshToken**: Valid refresh token
    
    Returns new access token.
    """
    auth_service = AuthService(db)
    result = await auth_service.refresh_access_token(
        refresh_token=data.refreshToken,
        request=request
    )
    return result


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Request password reset email.
    
    - **email**: User's email address
    
    Sends password reset link to email if account exists.
    """
    auth_service = AuthService(db)
    result = await auth_service.forgot_password(data.email)
    return result


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Reset password with token from email.
    
    - **token**: Reset token from email
    - **newPassword**: New password (min 6 characters)
    
    Resets password and revokes all sessions.
    """
    auth_service = AuthService(db)
    result = await auth_service.reset_password(data.token, data.newPassword)
    return result


@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Logout from current device.
    
    Revokes current session and blacklists access token.
    """
    auth_service = AuthService(db)
    result = await auth_service.logout(
        user_id=str(current_user["_id"]),
        access_token=credentials.credentials,
        request=request
    )
    return result


@router.post("/logout-all", response_model=dict)
async def logout_all_devices(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Logout from all devices.
    
    Revokes all sessions and blacklists current access token.
    """
    auth_service = AuthService(db)
    result = await auth_service.logout_all_devices(
        user_id=str(current_user["_id"]),
        access_token=credentials.credentials,
        request=request
    )
    return result


@router.get("/sessions", response_model=List[SessionInfo])
async def get_sessions(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all active sessions for current user.
    
    Returns list of sessions with device information.
    """
    session_service = SessionService(db)
    sessions = await session_service.get_user_sessions(
        user_id=str(current_user["_id"]),
        active_only=True
    )
    
    # Convert datetime to string
    for session in sessions:
        session["lastActivity"] = session["lastActivity"].isoformat()
        session["createdAt"] = session["createdAt"].isoformat()
    
    return sessions


@router.delete("/sessions/{session_id}", response_model=MessageResponse)
async def revoke_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Revoke a specific session.
    
    - **session_id**: ID of session to revoke
    """
    session_service = SessionService(db)
    success = await session_service.revoke_session(session_id)
    
    if success:
        return {"message": "Session revoked successfully"}
    else:
        return {"message": "Session not found"}
