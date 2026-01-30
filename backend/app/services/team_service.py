from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.utils.exceptions import NotFoundException, ValidationException


class TeamService:
    """Service for team operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.teams_collection = db.teams
        self.users_collection = db.users
        self.activities_collection = db.activities
    
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
    
    async def get_team_members(self, team_id: str, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all members of a team.
        
        Args:
            team_id: Team's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            List of team members with user details
        
        Raises:
            NotFoundException: If team not found
            ValidationException: If user not in team
        """
        if not ObjectId.is_valid(team_id):
            raise ValidationException("Invalid team ID format")
        
        # Check if team exists and user is a member
        team = await self.teams_collection.find_one({
            "_id": ObjectId(team_id),
            "$or": [
                {"ownerId": user_id},
                {"members.userId": user_id}
            ]
        })
        
        if not team:
            raise NotFoundException("Team not found or you don't have access")
        
        # Get owner details
        owner = await self.users_collection.find_one({"_id": ObjectId(team["ownerId"])})
        members_list = []
        
        if owner:
            members_list.append({
                "userId": str(owner["_id"]),
                "email": owner.get("email", ""),
                "name": owner.get("name", "Unknown"),
                "role": "owner",
                "joinedAt": team.get("createdAt")
            })
        
        # Get details for each member
        for member in team.get("members", []):
            user = await self.users_collection.find_one({"_id": ObjectId(member["userId"])})
            if user:
                members_list.append({
                    "userId": str(user["_id"]),
                    "email": user.get("email", ""),
                    "name": user.get("name", "Unknown"),
                    "role": member.get("role", "member"),
                    "joinedAt": member.get("joinedAt", team.get("createdAt"))
                })
        
        return members_list
    
    async def invite_member(
        self,
        team_id: str,
        user_id: str,
        invite_email: str,
        role: str = "member"
    ) -> Dict[str, Any]:
        """
        Invite a user to a team by email.
        
        Args:
            team_id: Team's ObjectId as string
            user_id: User's ID (for authorization, must be owner or admin)
            invite_email: Email of user to invite
            role: Role to assign (default: "member")
        
        Returns:
            Updated team document
        
        Raises:
            NotFoundException: If team or invited user not found
            ValidationException: If user already in team or lacks permission
        """
        if not ObjectId.is_valid(team_id):
            raise ValidationException("Invalid team ID format")
        
        # Check if team exists and user has permission to invite
        team = await self.teams_collection.find_one({"_id": ObjectId(team_id)})
        
        if not team:
            raise NotFoundException("Team not found")
        
        # Check if user is owner or admin
        is_owner = team["ownerId"] == user_id
        is_admin = any(
            m["userId"] == user_id and m.get("role") == "admin"
            for m in team.get("members", [])
        )
        
        if not (is_owner or is_admin):
            raise ValidationException("Only team owners and admins can invite members")
        
        # Find user to invite by email
        invited_user = await self.users_collection.find_one({"email": invite_email})
        
        if not invited_user:
            raise NotFoundException(f"User with email {invite_email} not found")
        
        invited_user_id = str(invited_user["_id"])
        
        # Check if user is already owner
        if team["ownerId"] == invited_user_id:
            raise ValidationException("User is already the team owner")
        
        # Check if user is already a member
        if any(m["userId"] == invited_user_id for m in team.get("members", [])):
            raise ValidationException("User is already a member of this team")
        
        # Add member to team
        new_member = {
            "userId": invited_user_id,
            "role": role,
            "joinedAt": datetime.utcnow()
        }
        
        await self.teams_collection.update_one(
            {"_id": ObjectId(team_id)},
            {
                "$push": {"members": new_member},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )
        
        # Log activity
        await self._log_activity(
            team_id=team_id,
            user_id=user_id,
            activity_type="member_added",
            resource_type="member",
            resource_id=invited_user_id,
            description=f"{invited_user.get('name', 'User')} was added to the team"
        )
        
        # Return updated team
        updated_team = await self.teams_collection.find_one({"_id": ObjectId(team_id)})
        return updated_team
    
    async def update_member_role(
        self,
        team_id: str,
        user_id: str,
        member_id: str,
        new_role: str
    ) -> Dict[str, Any]:
        """
        Update a team member's role.
        
        Args:
            team_id: Team's ObjectId as string
            user_id: User's ID (for authorization, must be owner)
            member_id: Member's user ID to update
            new_role: New role to assign
        
        Returns:
            Updated team document
        
        Raises:
            NotFoundException: If team or member not found
            ValidationException: If user lacks permission or invalid operation
        """
        if not ObjectId.is_valid(team_id):
            raise ValidationException("Invalid team ID format")
        
        # Check if team exists
        team = await self.teams_collection.find_one({"_id": ObjectId(team_id)})
        
        if not team:
            raise NotFoundException("Team not found")
        
        # Only owner can change roles
        if team["ownerId"] != user_id:
            raise ValidationException("Only team owner can change member roles")
        
        # Cannot change owner's role
        if team["ownerId"] == member_id:
            raise ValidationException("Cannot change owner's role")
        
        # Check if member exists in team
        member_exists = any(m["userId"] == member_id for m in team.get("members", []))
        
        if not member_exists:
            raise NotFoundException("Member not found in team")
        
        # Update member role
        await self.teams_collection.update_one(
            {"_id": ObjectId(team_id), "members.userId": member_id},
            {
                "$set": {
                    "members.$.role": new_role,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        # Get member details for activity log
        member_user = await self.users_collection.find_one({"_id": ObjectId(member_id)})
        
        # Log activity
        await self._log_activity(
            team_id=team_id,
            user_id=user_id,
            activity_type="member_role_changed",
            resource_type="member",
            resource_id=member_id,
            description=f"{member_user.get('name', 'User')}'s role was changed to {new_role}"
        )
        
        # Return updated team
        updated_team = await self.teams_collection.find_one({"_id": ObjectId(team_id)})
        return updated_team
    
    async def remove_member(
        self,
        team_id: str,
        user_id: str,
        member_id: str
    ) -> Dict[str, str]:
        """
        Remove a member from a team.
        
        Args:
            team_id: Team's ObjectId as string
            user_id: User's ID (for authorization, must be owner or admin)
            member_id: Member's user ID to remove
        
        Returns:
            Success message
        
        Raises:
            NotFoundException: If team or member not found
            ValidationException: If user lacks permission or invalid operation
        """
        if not ObjectId.is_valid(team_id):
            raise ValidationException("Invalid team ID format")
        
        # Check if team exists
        team = await self.teams_collection.find_one({"_id": ObjectId(team_id)})
        
        if not team:
            raise NotFoundException("Team not found")
        
        # Check if user is owner or admin
        is_owner = team["ownerId"] == user_id
        is_admin = any(
            m["userId"] == user_id and m.get("role") == "admin"
            for m in team.get("members", [])
        )
        
        if not (is_owner or is_admin):
            raise ValidationException("Only team owners and admins can remove members")
        
        # Cannot remove owner
        if team["ownerId"] == member_id:
            raise ValidationException("Cannot remove team owner")
        
        # Check if member exists in team
        member_exists = any(m["userId"] == member_id for m in team.get("members", []))
        
        if not member_exists:
            raise NotFoundException("Member not found in team")
        
        # Get member details before removal
        member_user = await self.users_collection.find_one({"_id": ObjectId(member_id)})
        
        # Remove member
        await self.teams_collection.update_one(
            {"_id": ObjectId(team_id)},
            {
                "$pull": {"members": {"userId": member_id}},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )
        
        # Log activity
        await self._log_activity(
            team_id=team_id,
            user_id=user_id,
            activity_type="member_removed",
            resource_type="member",
            resource_id=member_id,
            description=f"{member_user.get('name', 'User')} was removed from the team"
        )
        
        return {"message": "Member removed successfully"}
    
    async def get_team_activity(
        self,
        team_id: str,
        user_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get activity history for a team.
        
        Args:
            team_id: Team's ObjectId as string
            user_id: User's ID (for authorization)
            limit: Maximum number of activities to return
        
        Returns:
            List of activity documents
        
        Raises:
            NotFoundException: If team not found
            ValidationException: If user not in team
        """
        if not ObjectId.is_valid(team_id):
            raise ValidationException("Invalid team ID format")
        
        # Check if team exists and user is a member
        team = await self.teams_collection.find_one({
            "_id": ObjectId(team_id),
            "$or": [
                {"ownerId": user_id},
                {"members.userId": user_id}
            ]
        })
        
        if not team:
            raise NotFoundException("Team not found or you don't have access")
        
        # Get activities
        activities = await self.activities_collection.find({
            "teamId": team_id
        }).sort("createdAt", -1).limit(limit).to_list(length=limit)
        
        return activities
    
    async def _log_activity(
        self,
        team_id: str,
        user_id: str,
        activity_type: str,
        resource_type: str,
        description: str,
        resource_id: Optional[str] = None,
        resource_title: Optional[str] = None
    ) -> None:
        """
        Log an activity to the team's activity feed.
        
        Args:
            team_id: Team's ID
            user_id: User who performed the action
            activity_type: Type of activity
            resource_type: Type of resource (task, note, folder, member)
            description: Human-readable description
            resource_id: ID of the affected resource (optional)
            resource_title: Title of the affected resource (optional)
        """
        user = await self.users_collection.find_one({"_id": ObjectId(user_id)})
        
        activity_doc = {
            "teamId": team_id,
            "userId": user_id,
            "userName": user.get("name", "Unknown") if user else "Unknown",
            "activityType": activity_type,
            "resourceType": resource_type,
            "resourceId": resource_id,
            "resourceTitle": resource_title,
            "description": description,
            "createdAt": datetime.utcnow()
        }
        
        await self.activities_collection.insert_one(activity_doc)

