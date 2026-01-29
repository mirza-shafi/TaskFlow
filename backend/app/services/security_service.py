from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId

from app.core.security import hash_token
from app.config import settings


class TokenBlacklistService:
    """Service for managing blacklisted tokens."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.blacklist_collection = db.token_blacklist
    
    async def blacklist_token(self, token: str, user_id: str, expires_at: datetime) -> bool:
        """
        Add a token to the blacklist.
        
        Args:
            token: Token to blacklist
            user_id: User ID
            expires_at: Token expiration time
        
        Returns:
            True if blacklisted successfully
        """
        token_hash = hash_token(token)
        
        blacklist_entry = {
            "tokenHash": token_hash,
            "userId": ObjectId(user_id),
            "expiresAt": expires_at,
            "createdAt": datetime.utcnow()
        }
        
        await self.blacklist_collection.insert_one(blacklist_entry)
        return True
    
    async def is_token_blacklisted(self, token: str) -> bool:
        """
        Check if a token is blacklisted.
        
        Args:
            token: Token to check
        
        Returns:
            True if blacklisted, False otherwise
        """
        token_hash = hash_token(token)
        
        result = await self.blacklist_collection.find_one({
            "tokenHash": token_hash,
            "expiresAt": {"$gt": datetime.utcnow()}
        })
        
        return result is not None
    
    async def cleanup_expired_tokens(self) -> int:
        """
        Remove expired tokens from blacklist.
        
        Returns:
            Number of tokens removed
        """
        result = await self.blacklist_collection.delete_many({
            "expiresAt": {"$lt": datetime.utcnow()}
        })
        return result.deleted_count


class SecurityService:
    """Service for security-related operations like login attempts tracking."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.security_logs_collection = db.security_logs
        self.login_attempts_collection = db.login_attempts
    
    async def log_security_event(
        self,
        user_id: Optional[str],
        event: str,
        ip_address: str,
        device_info: dict,
        success: bool,
        metadata: Optional[dict] = None
    ) -> None:
        """
        Log a security event.
        
        Args:
            user_id: User ID (optional for failed logins)
            event: Event type (login, logout, failed_login, etc.)
            ip_address: Client IP address
            device_info: Device information
            success: Whether the event was successful
            metadata: Additional metadata
        """
        log_entry = {
            "userId": ObjectId(user_id) if user_id else None,
            "event": event,
            "ipAddress": ip_address,
            "deviceInfo": device_info,
            "success": success,
            "metadata": metadata or {},
            "timestamp": datetime.utcnow()
        }
        
        await self.security_logs_collection.insert_one(log_entry)
    
    async def record_failed_login(self, email: str, ip_address: str) -> None:
        """
        Record a failed login attempt.
        
        Args:
            email: Email address
            ip_address: IP address
        """
        await self.login_attempts_collection.update_one(
            {"email": email},
            {
                "$inc": {"attempts": 1},
                "$set": {
                    "lastAttempt": datetime.utcnow(),
                    "ipAddress": ip_address
                }
            },
            upsert=True
        )
    
    async def reset_failed_logins(self, email: str) -> None:
        """
        Reset failed login attempts after successful login.
        
        Args:
            email: Email address
        """
        await self.login_attempts_collection.delete_one({"email": email})
    
    async def is_account_locked(self, email: str) -> bool:
        """
        Check if account is locked due to failed login attempts.
        
        Args:
            email: Email address
        
        Returns:
            True if account is locked, False otherwise
        """
        attempt_record = await self.login_attempts_collection.find_one({"email": email})
        
        if not attempt_record:
            return False
        
        # Check if attempts exceed limit
        if attempt_record.get("attempts", 0) < settings.max_login_attempts:
            return False
        
        # Check if lockout period has expired
        last_attempt = attempt_record.get("lastAttempt")
        if last_attempt:
            lockout_until = last_attempt + timedelta(minutes=settings.lockout_duration_minutes)
            if datetime.utcnow() > lockout_until:
                # Lockout period expired, reset attempts
                await self.reset_failed_logins(email)
                return False
        
        return True
    
    async def get_lockout_time_remaining(self, email: str) -> Optional[int]:
        """
        Get remaining lockout time in seconds.
        
        Args:
            email: Email address
        
        Returns:
            Seconds remaining, or None if not locked
        """
        attempt_record = await self.login_attempts_collection.find_one({"email": email})
        
        if not attempt_record or attempt_record.get("attempts", 0) < settings.max_login_attempts:
            return None
        
        last_attempt = attempt_record.get("lastAttempt")
        if last_attempt:
            lockout_until = last_attempt + timedelta(minutes=settings.lockout_duration_minutes)
            remaining = (lockout_until - datetime.utcnow()).total_seconds()
            return max(0, int(remaining))
        
        return None
