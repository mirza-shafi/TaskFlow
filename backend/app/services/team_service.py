from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List, Dict, Any
from datetime import datetime

from app.utils.exceptions import NotFoundException


class TeamService:
    """Service for team operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.teams_collection = db.teams
    
    async def get_teams(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all teams where user is owner or member."""
        teams = await self.teams_collection.find({
            "$or": [
                {"ownerId": user_id},
                {"members.userId": user_id}
            ]
        }).to_list(length=None)
        
        return teams
    
    async def create_team(self, user_id: str, team_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new team."""
        team_doc = {
            "name": team_data.get("name"),
            "description": team_data.get("description", ""),
            "ownerId": user_id,
            "members": [],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = await self.teams_collection.insert_one(team_doc)
        team_doc["_id"] = result.inserted_id
        
        return team_doc
    
    async def update_team(
        self,
        team_id: str,
        user_id: str,
        team_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update a team (only owner can update)."""
        update_doc = {"updatedAt": datetime.utcnow()}
        
        if "name" in team_data:
            update_doc["name"] = team_data["name"]
        if "description" in team_data:
            update_doc["description"] = team_data["description"]
        
        try:
            result = await self.teams_collection.find_one_and_update(
                {"_id": ObjectId(team_id), "ownerId": user_id},
                {"$set": update_doc},
                return_document=True
            )
        except Exception:
            raise NotFoundException("Team not found")
        
        if not result:
            raise NotFoundException("Team not found or you don't have permission")
        
        return result
    
    async def delete_team(self, team_id: str, user_id: str) -> Dict[str, str]:
        """Delete a team (only owner can delete)."""
        try:
            result = await self.teams_collection.delete_one({
                "_id": ObjectId(team_id),
                "ownerId": user_id
            })
        except Exception:
            raise NotFoundException("Team not found")
        
        if result.deleted_count == 0:
            raise NotFoundException("Team not found or you don't have permission")
        
        return {"message": "Team deleted successfully"}
