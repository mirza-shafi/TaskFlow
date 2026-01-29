from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import Request

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token
)
from app.services.email_service import email_service
from app.services.session_service import SessionService
from app.services.security_service import SecurityService, TokenBlacklistService
from app.services.gravatar_service import GravatarService
from app.utils.token_manager import token_manager
from app.utils.device_parser import DeviceParser, get_client_ip
from app.utils.exceptions import (
    NotFoundException,
    UnauthorizedException,
    DuplicateException,
    ValidationException
)
from app.config import settings


class AuthService:
    """Service for authentication operations with advanced features."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.users_collection = db.users
        self.session_service = SessionService(db)
        self.security_service = SecurityService(db)
        self.blacklist_service = TokenBlacklistService(db)
    
    async def register_user(
        self,
        name: str,
        email: str,
        password: str,
        request: Request
    ) -> Dict[str, Any]:
        """
        Register a new user with email verification.
        
        Args:
            name: User's name
            email: User's email
            password: User's password (will be hashed)
            request: FastAPI request object
        
        Returns:
            Success message (user must verify email before login)
        
        Raises:
            DuplicateException: If email already exists
        """
        # Check if user already exists
        existing_user = await self.users_collection.find_one({"email": email})
        if existing_user:
            raise DuplicateException("Email already registered")
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Generate Gravatar URL
        gravatar_url = GravatarService.get_profile_photo_url(email)
        
        # Create user document
        user_doc = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "avatarUrl": gravatar_url,  # Set Gravatar photo immediately
            "bio": "",
            "appearance": {},
            "isEmailVerified": False,
            "emailVerifiedAt": None,
            "oauthProvider": "local",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        # Insert user
        result = await self.users_collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Generate verification token
        verification_token = token_manager.generate_verification_token(user_id, email)
        
        # Send verification email
        await email_service.send_verification_email(email, name, verification_token)
        
        # Log security event
        ip_address = get_client_ip(request)
        device_info = DeviceParser.parse_user_agent(request.headers.get("user-agent", ""))
        await self.security_service.log_security_event(
            user_id=user_id,
            event="registration",
            ip_address=ip_address,
            device_info=device_info,
            success=True
        )
        
        return {
            "message": "Registration successful! Please check your email to verify your account.",
            "email": email
        }
    
    async def verify_email(self, token: str) -> Dict[str, Any]:
        """
        Verify user's email address and fetch profile photo.
        
        Args:
            token: Email verification token
        
        Returns:
            Success message
        
        Raises:
            ValidationException: If token is invalid or expired
        """
        # Verify token
        token_data = token_manager.verify_verification_token(token)
        if not token_data:
            raise ValidationException("Invalid or expired verification token")
        
        user_id = token_data.get("user_id")
        email = token_data.get("email")
        
        # Generate Gravatar URL for profile photo
        gravatar_url = GravatarService.get_profile_photo_url(email)
        
        # Update user with verification and profile photo
        result = await self.users_collection.update_one(
            {"_id": ObjectId(user_id), "email": email},
            {
                "$set": {
                    "isEmailVerified": True,
                    "emailVerifiedAt": datetime.utcnow(),
                    "avatarUrl": gravatar_url,  # Set Gravatar photo
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise NotFoundException("User not found")
        
        return {"message": "Email verified successfully! You can now login."}
    
    async def resend_verification_email(self, email: str) -> Dict[str, Any]:
        """
        Resend verification email.
        
        Args:
            email: User's email
        
        Returns:
            Success message
        
        Raises:
            NotFoundException: If user not found
            ValidationException: If email already verified
        """
        user = await self.users_collection.find_one({"email": email})
        if not user:
            raise NotFoundException("User not found")
        
        if user.get("isEmailVerified"):
            raise ValidationException("Email already verified")
        
        # Generate new token
        verification_token = token_manager.generate_verification_token(
            str(user["_id"]),
            email
        )
        
        # Send email
        await email_service.send_verification_email(
            email,
            user.get("name", "User"),
            verification_token
        )
        
        return {"message": "Verification email sent successfully"}
    
    async def login_user(
        self,
        email: str,
        password: str,
        request: Request
    ) -> Dict[str, Any]:
        """
        Authenticate user with dual token system and session management.
        
        Args:
            email: User's email
            password: User's password
            request: FastAPI request object
        
        Returns:
            Access token, refresh token, and user data
        
        Raises:
            UnauthorizedException: If credentials are invalid or account locked
        """
        ip_address = get_client_ip(request)
        device_info = DeviceParser.parse_user_agent(request.headers.get("user-agent", ""))
        
        # Check if account is locked
        if await self.security_service.is_account_locked(email):
            remaining = await self.security_service.get_lockout_time_remaining(email)
            raise UnauthorizedException(
                f"Account locked due to too many failed login attempts. "
                f"Try again in {remaining // 60} minutes."
            )
        
        # Find user by email
        user = await self.users_collection.find_one({"email": email})
        if not user:
            await self.security_service.record_failed_login(email, ip_address)
            await self.security_service.log_security_event(
                user_id=None,
                event="failed_login",
                ip_address=ip_address,
                device_info=device_info,
                success=False,
                metadata={"email": email, "reason": "user_not_found"}
            )
            raise UnauthorizedException("Invalid email or password")
        
        # Check if email is verified
        if not user.get("isEmailVerified", False):
            raise UnauthorizedException(
                "Please verify your email before logging in. "
                "Check your inbox for the verification link."
            )
        
        # Verify password
        if not verify_password(password, user.get("password", "")):
            await self.security_service.record_failed_login(email, ip_address)
            await self.security_service.log_security_event(
                user_id=str(user["_id"]),
                event="failed_login",
                ip_address=ip_address,
                device_info=device_info,
                success=False,
                metadata={"reason": "invalid_password"}
            )
            raise UnauthorizedException("Invalid email or password")
        
        # Reset failed login attempts
        await self.security_service.reset_failed_logins(email)
        
        user_id = str(user["_id"])
        
        # Create tokens
        token_data = {"id": user_id, "email": email}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # Create session
        session = await self.session_service.create_session(
            user_id=user_id,
            refresh_token=refresh_token,
            device_info=device_info,
            ip_address=ip_address
        )
        
        # Check if this is a new device
        device_id = session.get("deviceId")
        existing_sessions = await self.session_service.get_user_sessions(user_id)
        is_new_device = len([s for s in existing_sessions if s.get("deviceId") == device_id]) == 1
        
        if is_new_device and len(existing_sessions) > 1:
            # Send new device notification
            await email_service.send_new_device_login_email(
                to_email=email,
                name=user.get("name", "User"),
                device_name=device_info.get("deviceName", "Unknown Device"),
                location=session.get("location", "Unknown"),
                ip_address=ip_address
            )
        
        # Log successful login
        await self.security_service.log_security_event(
            user_id=user_id,
            event="login",
            ip_address=ip_address,
            device_info=device_info,
            success=True,
            metadata={"sessionId": str(session.get("_id"))}
        )
        
        # Remove password from response
        del user["password"]
        user["_id"] = str(user["_id"])
        
        return {
            "accessToken": access_token,
            "refreshToken": refresh_token,
            "tokenType": "Bearer",
            "expiresIn": settings.access_token_expire_minutes * 60,
            "user": user
        }
    
    async def refresh_access_token(
        self,
        refresh_token: str,
        request: Request
    ) -> Dict[str, Any]:
        """
        Refresh access token using refresh token.
        
        Args:
            refresh_token: Refresh token
            request: FastAPI request object
        
        Returns:
            New access token
        
        Raises:
            UnauthorizedException: If refresh token is invalid
        """
        # Decode refresh token
        payload = decode_refresh_token(refresh_token)
        if not payload:
            raise UnauthorizedException("Invalid refresh token")
        
        user_id = payload.get("id")
        
        # Verify session exists and is valid
        session = await self.session_service.verify_refresh_token(user_id, refresh_token)
        if not session:
            raise UnauthorizedException("Invalid or expired refresh token")
        
        # Create new access token
        token_data = {"id": user_id, "email": payload.get("email")}
        access_token = create_access_token(token_data)
        
        return {
            "accessToken": access_token,
            "tokenType": "Bearer",
            "expiresIn": settings.access_token_expire_minutes * 60
        }
    
    async def forgot_password(self, email: str) -> Dict[str, Any]:
        """
        Initiate password reset process.
        
        Args:
            email: User's email
        
        Returns:
            Success message
        """
        # Find user
        user = await self.users_collection.find_one({"email": email})
        if not user:
            # Don't reveal if email exists
            return {"message": "If the email exists, a password reset link has been sent"}
        
        # Generate reset token
        reset_token = token_manager.generate_reset_token(str(user["_id"]), email)
        
        # Send reset email
        await email_service.send_password_reset_email(
            email,
            user.get("name", "User"),
            reset_token
        )
        
        return {"message": "If the email exists, a password reset link has been sent"}
    
    async def reset_password(self, token: str, new_password: str) -> Dict[str, Any]:
        """
        Reset password using reset token.
        
        Args:
            token: Password reset token
            new_password: New password
        
        Returns:
            Success message
        
        Raises:
            ValidationException: If token is invalid
        """
        # Verify token
        token_data = token_manager.verify_reset_token(token)
        if not token_data:
            raise ValidationException("Invalid or expired reset token")
        
        user_id = token_data.get("user_id")
        email = token_data.get("email")
        
        # Hash new password
        hashed_password = hash_password(new_password)
        
        # Update password
        result = await self.users_collection.update_one(
            {"_id": ObjectId(user_id), "email": email},
            {
                "$set": {
                    "password": hashed_password,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise NotFoundException("User not found")
        
        # Revoke all sessions (force re-login)
        await self.session_service.revoke_all_sessions(user_id)
        
        return {"message": "Password reset successfully. Please login with your new password."}
    
    async def logout(
        self,
        user_id: str,
        access_token: str,
        request: Request
    ) -> Dict[str, Any]:
        """
        Logout user from current session.
        
        Args:
            user_id: User ID
            access_token: Current access token
            request: FastAPI request object
        
        Returns:
            Success message
        """
        ip_address = get_client_ip(request)
        device_info = DeviceParser.parse_user_agent(request.headers.get("user-agent", ""))
        device_id = DeviceParser.generate_device_id(
            device_info.get("userAgent", ""),
            ip_address
        )
        
        # Get session by device ID
        session = await self.session_service.get_session_by_device_id(user_id, device_id)
        
        if session:
            # Revoke session
            await self.session_service.revoke_session(str(session["_id"]))
        
        # Blacklist access token
        from datetime import datetime, timedelta
        expires_at = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
        await self.blacklist_service.blacklist_token(access_token, user_id, expires_at)
        
        # Log logout
        await self.security_service.log_security_event(
            user_id=user_id,
            event="logout",
            ip_address=ip_address,
            device_info=device_info,
            success=True
        )
        
        return {"message": "Logged out successfully"}
    
    async def logout_all_devices(
        self,
        user_id: str,
        access_token: str,
        request: Request
    ) -> Dict[str, Any]:
        """
        Logout user from all devices.
        
        Args:
            user_id: User ID
            access_token: Current access token
            request: FastAPI request object
        
        Returns:
            Success message with count of revoked sessions
        """
        ip_address = get_client_ip(request)
        device_info = DeviceParser.parse_user_agent(request.headers.get("user-agent", ""))
        
        # Revoke all sessions
        count = await self.session_service.revoke_all_sessions(user_id)
        
        # Blacklist current access token
        from datetime import datetime, timedelta
        expires_at = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
        await self.blacklist_service.blacklist_token(access_token, user_id, expires_at)
        
        # Log logout
        await self.security_service.log_security_event(
            user_id=user_id,
            event="logout_all",
            ip_address=ip_address,
            device_info=device_info,
            success=True,
            metadata={"sessions_revoked": count}
        )
        
        return {
            "message": f"Logged out from all devices successfully",
            "sessionsRevoked": count
        }
