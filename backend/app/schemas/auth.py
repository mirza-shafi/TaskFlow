from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class EmailVerificationRequest(BaseModel):
    """Request to verify email with token."""
    token: str = Field(..., description="Email verification token")


class ResendVerificationRequest(BaseModel):
    """Request to resend verification email."""
    email: EmailStr = Field(..., description="Email address")


class ForgotPasswordRequest(BaseModel):
    """Request to initiate password reset."""
    email: EmailStr = Field(..., description="Email address")


class ResetPasswordRequest(BaseModel):
    """Request to reset password with token."""
    token: str = Field(..., description="Password reset token")
    newPassword: str = Field(..., min_length=6, max_length=100, description="New password")


class RefreshTokenRequest(BaseModel):
    """Request to refresh access token."""
    refreshToken: str = Field(..., description="Refresh token")


class TokenResponse(BaseModel):
    """Response containing access and refresh tokens."""
    accessToken: str
    refreshToken: str
    tokenType: str = "Bearer"
    expiresIn: int  # seconds


class SessionInfo(BaseModel):
    """Session information."""
    id: str = Field(..., alias="_id")
    deviceId: str
    deviceName: str
    deviceType: str
    browser: str
    os: str
    ipAddress: str
    location: str
    lastActivity: str
    createdAt: str
    isActive: bool
    
    class Config:
        populate_by_name = True


class DeviceInfo(BaseModel):
    """Device information."""
    deviceId: str
    deviceName: str
    deviceType: str
    lastSeen: str
    location: str
