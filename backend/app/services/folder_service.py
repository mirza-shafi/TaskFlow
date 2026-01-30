from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List, Dict, Any
from datetime import datetime

from app.utils.exceptions import NotFoundException, ValidationException


class FolderService:
    """Service for folder operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.folders_collection = db.folders
        self.teams_collection = db.teams
    
    async def get_folders(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all folders for a user."""
        folders = await self.folders_collection.find({"userId": user_id}).to_list(length=None)
        return folders
    
    async def create_folder(self, user_id: str, folder_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new folder."""
        folder_doc = {
            "userId": user_id,
            "name": folder_data.get("name"),
            "color": folder_data.get("color", ""),
            "sharedWithTeams": [],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = await self.folders_collection.insert_one(folder_doc)
        folder_doc["_id"] = result.inserted_id
        
        return folder_doc
    
    async def update_folder(
        self,
        folder_id: str,
        user_id: str,
        folder_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update a folder."""
        update_doc = {"updatedAt": datetime.utcnow()}
        
        if "name" in folder_data:
            update_doc["name"] = folder_data["name"]
        if "color" in folder_data:
            update_doc["color"] = folder_data["color"]
        
        try:
            result = await self.folders_collection.find_one_and_update(
                {"_id": ObjectId(folder_id), "userId": user_id},
                {"$set": update_doc},
                return_document=True
            )
        except Exception:
            raise NotFoundException("Folder not found")
        
        if not result:
            raise NotFoundException("Folder not found")
        
        return result
    
    async def delete_folder(self, folder_id: str, user_id: str) -> Dict[str, str]:
        """Delete a folder."""
        try:
            result = await self.folders_collection.delete_one({
                "_id": ObjectId(folder_id),
                "userId": user_id
            })
        except Exception:
            raise NotFoundException("Folder not found")
        
        if result.deleted_count == 0:
            raise NotFoundException("Folder not found")
        
        return {"message": "Folder deleted successfully"}
    
    async def share_folder(
        self,
        folder_id: str,
        user_id: str,
        team_id: str
    ) -> Dict[str, Any]:
        """
        Share a folder with a team.
        
        Args:
            folder_id: Folder's ObjectId as string
            user_id: User's ID (for authorization, must be folder owner)
            team_id: Team's ID to share with
        
        Returns:
            Updated folder document
        
        Raises:
            NotFoundException: If folder or team not found
            ValidationException: If user lacks permission or folder already shared
        """
        if not ObjectId.is_valid(folder_id):
            raise ValidationException("Invalid folder ID format")
        
        if not ObjectId.is_valid(team_id):
            raise ValidationException("Invalid team ID format")
        
        # Check if folder exists and belongs to user
        folder = await self.folders_collection.find_one({
            "_id": ObjectId(folder_id),
            "userId": user_id
        })
        
        if not folder:
            raise NotFoundException("Folder not found or you don't have permission")
        
        # Check if team exists and user is a member
        team = await self.teams_collection.find_one({
            "_id": ObjectId(team_id),
            "$or": [
                {"ownerId": user_id},
                {"members.userId": user_id}
            ]
        })
        
        if not team:
            raise NotFoundException("Team not found or you're not a member")
        
        # Check if folder is already shared with this team
        shared_teams = folder.get("sharedWithTeams", [])
        if team_id in shared_teams:
            raise ValidationException("Folder is already shared with this team")
        
        # Share folder with team
        await self.folders_collection.update_one(
            {"_id": ObjectId(folder_id)},
            {
                "$addToSet": {"sharedWithTeams": team_id},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )
        
        # Return updated folder
        updated_folder = await self.folders_collection.find_one({"_id": ObjectId(folder_id)})
        return updated_folder
    
    async def unshare_folder(
        self,
        folder_id: str,
        user_id: str,
        team_id: str
    ) -> Dict[str, Any]:
        """
        Unshare a folder from a team.
        
        Args:
            folder_id: Folder's ObjectId as string
            user_id: User's ID (for authorization, must be folder owner)
            team_id: Team's ID to unshare from
        
        Returns:
            Updated folder document
        
        Raises:
            NotFoundException: If folder not found
            ValidationException: If user lacks permission
        """
        if not ObjectId.is_valid(folder_id):
            raise ValidationException("Invalid folder ID format")
        
        # Check if folder exists and belongs to user
        folder = await self.folders_collection.find_one({
            "_id": ObjectId(folder_id),
            "userId": user_id
        })
        
        if not folder:
            raise NotFoundException("Folder not found or you don't have permission")
        
        # Unshare folder from team
        await self.folders_collection.update_one(
            {"_id": ObjectId(folder_id)},
            {
                "$pull": {"sharedWithTeams": team_id},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )
        
        # Return updated folder
        updated_folder = await self.folders_collection.find_one({"_id": ObjectId(folder_id)})
        return updated_folder

