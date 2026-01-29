from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from bson import ObjectId
import hashlib

from app.config import settings
from app.core.security import hash_token
from app.utils.device_parser import DeviceParser, get_client_ip, get_location_from_ip


class SessionService:
    """Service for managing user sessions across devices."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.sessions_collection = db.sessions
    
    async def create_session(
        self,
        user_id: str,
        refresh_token: str,
        device_info: Dict[str, Any],
        ip_address: str
    ) -> Dict[str, Any]:
        """
        Create a new session for a user.
        
        Args:
            user_id: User ID
            refresh_token: Refresh token (will be hashed)
            device_info: Device information from parser
            ip_address: Client IP address
        
        Returns:
            Created session document
        """
        # Generate device ID
        device_id = DeviceParser.generate_device_id(
            device_info.get("userAgent", ""),
            ip_address
        )
        
        # Get location from IP
        location = get_location_from_ip(ip_address)
        
        # Create session document
        session = {
            "userId": ObjectId(user_id),
            "deviceId": device_id,
            "deviceName": device_info.get("deviceName", "Unknown Device"),
            "deviceType": device_info.get("deviceType", "unknown"),
            "browser": device_info.get("browser", "Unknown"),
            "os": device_info.get("os", "Unknown"),
            "ipAddress": ip_address,
            "location": location,
            "userAgent": device_info.get("userAgent", ""),
            "refreshTokenHash": hash_token(refresh_token),
            "isActive": True,
            "lastActivity": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "expiresAt": datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
        }
        
        # Check if session with same device ID exists
        existing_session = await self.sessions_collection.find_one({
            "userId": ObjectId(user_id),
            "deviceId": device_id
        })
        
        if existing_session:
            # Update existing session
            await self.sessions_collection.update_one(
                {"_id": existing_session["_id"]},
                {"$set": session}
            )
            session["_id"] = existing_session["_id"]
        else:
            # Create new session
            result = await self.sessions_collection.insert_one(session)
            session["_id"] = result.inserted_id
        
        return session
    
    async def get_user_sessions(self, user_id: str, active_only: bool = True) -> List[Dict[str, Any]]:
        """
        Get all sessions for a user.
        
        Args:
            user_id: User ID
            active_only: Only return active sessions
        
        Returns:
            List of session documents
        """
        query = {"userId": ObjectId(user_id)}
        if active_only:
            query["isActive"] = True
            query["expiresAt"] = {"$gt": datetime.utcnow()}
        
        sessions = await self.sessions_collection.find(query).sort("lastActivity", -1).to_list(length=100)
        
        # Convert ObjectId to string
        for session in sessions:
            session["_id"] = str(session["_id"])
            session["userId"] = str(session["userId"])
        
        return sessions
    
    async def update_session_activity(self, session_id: str) -> bool:
        """
        Update last activity timestamp for a session.
        
        Args:
            session_id: Session ID
        
        Returns:
            True if updated successfully
        """
        result = await self.sessions_collection.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"lastActivity": datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    async def verify_refresh_token(self, user_id: str, refresh_token: str) -> Optional[Dict[str, Any]]:
        """
        Verify refresh token and get associated session.
        
        Args:
            user_id: User ID
            refresh_token: Refresh token to verify
        
        Returns:
            Session document if valid, None otherwise
        """
        token_hash = hash_token(refresh_token)
        
        session = await self.sessions_collection.find_one({
            "userId": ObjectId(user_id),
            "refreshTokenHash": token_hash,
            "isActive": True,
            "expiresAt": {"$gt": datetime.utcnow()}
        })
        
        if session:
            # Update last activity
            await self.update_session_activity(str(session["_id"]))
            session["_id"] = str(session["_id"])
            session["userId"] = str(session["userId"])
        
        return session
    
    async def revoke_session(self, session_id: str) -> bool:
        """
        Revoke a specific session.
        
        Args:
            session_id: Session ID to revoke
        
        Returns:
            True if revoked successfully
        """
        result = await self.sessions_collection.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"isActive": False}}
        )
        return result.modified_count > 0
    
    async def revoke_all_sessions(self, user_id: str, except_session_id: Optional[str] = None) -> int:
        """
        Revoke all sessions for a user.
        
        Args:
            user_id: User ID
            except_session_id: Optional session ID to keep active
        
        Returns:
            Number of sessions revoked
        """
        query = {"userId": ObjectId(user_id), "isActive": True}
        
        if except_session_id:
            query["_id"] = {"$ne": ObjectId(except_session_id)}
        
        result = await self.sessions_collection.update_many(
            query,
            {"$set": {"isActive": False}}
        )
        
        return result.modified_count
    
    async def check_device_limit(self, user_id: str) -> bool:
        """
        Check if user has reached maximum device limit.
        
        Args:
            user_id: User ID
        
        Returns:
            True if under limit, False if limit reached
        """
        active_sessions = await self.get_user_sessions(user_id, active_only=True)
        return len(active_sessions) < settings.max_devices_per_user
    
    async def cleanup_expired_sessions(self) -> int:
        """
        Clean up expired sessions.
        
        Returns:
            Number of sessions deleted
        """
        result = await self.sessions_collection.delete_many({
            "expiresAt": {"$lt": datetime.utcnow()}
        })
        return result.deleted_count
    
    async def get_session_by_device_id(self, user_id: str, device_id: str) -> Optional[Dict[str, Any]]:
        """
        Get session by device ID.
        
        Args:
            user_id: User ID
            device_id: Device ID
        
        Returns:
            Session document if found
        """
        session = await self.sessions_collection.find_one({
            "userId": ObjectId(user_id),
            "deviceId": device_id,
            "isActive": True
        })
        
        if session:
            session["_id"] = str(session["_id"])
            session["userId"] = str(session["userId"])
        
        return session
