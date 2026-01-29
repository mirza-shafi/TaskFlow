from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Dict, Any
from datetime import datetime


class UserRegister(BaseModel):
    """Schema for user registration."""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength."""
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response (excludes password)."""
    id: str = Field(..., alias="_id")
    name: str
    email: str
    avatarUrl: Optional[str] = None
    appearance: Optional[Dict[str, Any]] = None
    bio: Optional[str] = None
    oauthProvider: str = "local"
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "name": "John Doe",
                "email": "john@example.com",
                "avatarUrl": "/uploads/avatars/avatar.jpg",
                "appearance": {"theme": "dark", "fontSize": "medium"},
                "bio": "Software developer",
                "oauthProvider": "local",
                "createdAt": "2024-01-01T00:00:00Z",
                "updatedAt": "2024-01-01T00:00:00Z"
            }
        }


class ProfileUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    avatarUrl: Optional[str] = None
    appearance: Optional[Dict[str, Any]] = None


class PasswordChange(BaseModel):
    """Schema for changing password."""
    currentPassword: str
    newPassword: str = Field(..., min_length=6, max_length=100)
    
    @field_validator('newPassword')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        """Validate new password strength."""
        if len(v) < 6:
            raise ValueError('New password must be at least 6 characters long')
        return v


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    token: str
    user: UserResponse
