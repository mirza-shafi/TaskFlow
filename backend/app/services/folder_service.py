from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List, Dict, Any
from datetime import datetime

from app.utils.exceptions import NotFoundException


class FolderService:
    """Service for folder operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.folders_collection = db.folders
    
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
