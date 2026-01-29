from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from app.config import settings
import secrets


class TokenManager:
    """Manager for generating and validating secure tokens."""
    
    def __init__(self):
        self.serializer = URLSafeTimedSerializer(settings.jwt_secret)
    
    def generate_verification_token(self, user_id: str, email: str) -> str:
        """
        Generate email verification token.
        
        Args:
            user_id: User ID
            email: User email
        
        Returns:
            Secure token string
        """
        data = {
            "user_id": user_id,
            "email": email,
            "type": "email_verification"
        }
        return self.serializer.dumps(data, salt="email-verification")
    
    def verify_verification_token(self, token: str, max_age: int = None) -> Optional[Dict[str, Any]]:
        """
        Verify email verification token.
        
        Args:
            token: Token to verify
            max_age: Maximum age in seconds (default: from settings)
        
        Returns:
            Token data if valid, None otherwise
        """
        if max_age is None:
            max_age = settings.verification_token_expire_hours * 3600
        
        try:
            data = self.serializer.loads(
                token,
                salt="email-verification",
                max_age=max_age
            )
            return data
        except (SignatureExpired, BadSignature):
            return None
    
    def generate_reset_token(self, user_id: str, email: str) -> str:
        """
        Generate password reset token.
        
        Args:
            user_id: User ID
            email: User email
        
        Returns:
            Secure token string
        """
        data = {
            "user_id": user_id,
            "email": email,
            "type": "password_reset"
        }
        return self.serializer.dumps(data, salt="password-reset")
    
    def verify_reset_token(self, token: str, max_age: int = None) -> Optional[Dict[str, Any]]:
        """
        Verify password reset token.
        
        Args:
            token: Token to verify
            max_age: Maximum age in seconds (default: from settings)
        
        Returns:
            Token data if valid, None otherwise
        """
        if max_age is None:
            max_age = settings.reset_token_expire_hours * 3600
        
        try:
            data = self.serializer.loads(
                token,
                salt="password-reset",
                max_age=max_age
            )
            return data
        except (SignatureExpired, BadSignature):
            return None
    
    @staticmethod
    def generate_refresh_token() -> str:
        """
        Generate a cryptographically secure refresh token.
        
        Returns:
            Random token string
        """
        return secrets.token_urlsafe(32)


# Global token manager instance
token_manager = TokenManager()
