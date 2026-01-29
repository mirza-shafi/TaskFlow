from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, Dict, Any
from datetime import datetime

from app.core.security import hash_password, verify_password
from app.utils.exceptions import NotFoundException, ValidationException, UnauthorizedException


class UserService:
    """Service for user operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.users_collection = db.users
        self.tasks_collection = db.tasks
        self.folders_collection = db.folders
    
    async def get_user_by_id(self, user_id: str) -> Dict[str, Any]:
        """
        Get user by ID.
        
        Args:
            user_id: User's ObjectId as string
        
        Returns:
            User document (without password)
        
        Raises:
            NotFoundException: If user not found
        """
        try:
            user = await self.users_collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            raise NotFoundException("User not found")
        
        if not user:
            raise NotFoundException("User not found")
        
        # Remove password
        if "password" in user:
            del user["password"]
        
        return user
    
    async def update_profile(
        self,
        user_id: str,
        name: Optional[str] = None,
        bio: Optional[str] = None,
        avatar_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update user profile.
        
        Args:
            user_id: User's ObjectId as string
            name: New name (optional)
            bio: New bio (optional)
            avatar_url: New avatar URL (optional)
        
        Returns:
            Updated user document
        
        Raises:
            NotFoundException: If user not found
        """
        # Build update document
        update_doc = {"updatedAt": datetime.utcnow()}
        
        if name is not None:
            update_doc["name"] = name
        if bio is not None:
            update_doc["bio"] = bio
        if avatar_url is not None:
            update_doc["avatarUrl"] = avatar_url
        
        # Update user
        try:
            result = await self.users_collection.find_one_and_update(
                {"_id": ObjectId(user_id)},
                {"$set": update_doc},
                return_document=True
            )
        except Exception:
            raise NotFoundException("User not found")
        
        if not result:
            raise NotFoundException("User not found")
        
        # Remove password
        if "password" in result:
            del result["password"]
        
        return result
    
    async def change_password(
        self,
        user_id: str,
        current_password: str,
        new_password: str
    ) -> Dict[str, str]:
        """
        Change user password.
        
        Args:
            user_id: User's ObjectId as string
            current_password: Current password
            new_password: New password
        
        Returns:
            Success message
        
        Raises:
            NotFoundException: If user not found
            UnauthorizedException: If current password is incorrect
        """
        # Get user
        try:
            user = await self.users_collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            raise NotFoundException("User not found")
        
        if not user:
            raise NotFoundException("User not found")
        
        # Verify current password
        if not verify_password(current_password, user.get("password", "")):
            raise UnauthorizedException("Current password is incorrect")
        
        # Hash new password
        hashed_password = hash_password(new_password)
        
        # Update password
        await self.users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password": hashed_password, "updatedAt": datetime.utcnow()}}
        )
        
        return {"message": "Password changed successfully"}
    
    async def delete_user(self, user_id: str) -> Dict[str, str]:
        """
        Delete user account and all associated data.
        
        Args:
            user_id: User's ObjectId as string
        
        Returns:
            Success message
        
        Raises:
            NotFoundException: If user not found
        """
        try:
            obj_id = ObjectId(user_id)
        except Exception:
            raise NotFoundException("User not found")
        
        # Check if user exists
        user = await self.users_collection.find_one({"_id": obj_id})
        if not user:
            raise NotFoundException("User not found")
        
        # Delete user's tasks
        await self.tasks_collection.delete_many({"userId": user_id})
        
        # Delete user's folders
        await self.folders_collection.delete_many({"userId": user_id})
        
        # Delete user
        await self.users_collection.delete_one({"_id": obj_id})
        
        return {"message": "User account deleted successfully"}
