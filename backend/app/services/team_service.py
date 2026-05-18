from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from app.utils.exceptions import NotFoundException, ValidationException


class TeamService:
    """Service for team operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.teams_collection = db.teams
        self.users_collection = db.users
        self.activities_collection = db.activities
    
    async def get_teams(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all teams where user is owner or member, with enriched member info."""
        teams = await self.teams_collection.find({
            "$or": [
                {"ownerId": user_id},
                {"members.userId": user_id}
            ]
        }).to_list(length=None)

        # Collect all unique userIds across all teams (members + owners)
        all_user_ids = set()
        for team in teams:
            all_user_ids.add(team["ownerId"])
            for m in team.get("members", []):
                all_user_ids.add(m["userId"])

        # Batch-fetch user info
        user_docs = await self.users_collection.find(
            {"_id": {"$in": [ObjectId(uid) for uid in all_user_ids if ObjectId.is_valid(uid)]}}
        ).to_list(length=None)
        user_map = {str(u["_id"]): u for u in user_docs}

        # Enrich each team's members list with email + name
        for team in teams:
            enriched = []
            for m in team.get("members", []):
                uid = m["userId"]
                u = user_map.get(uid, {})
                enriched.append({
                    "userId":   uid,
                    "email":    u.get("email", ""),
                    "name":     u.get("name", ""),
                    "avatarUrl": u.get("avatarUrl", ""),
                    "role":     m.get("role", "member"),
                    "joinedAt": m.get("joinedAt", team.get("createdAt")),
                })
            team["members"] = enriched

        return teams

    async def get_team_by_id(self, team_id: str, user_id: str) -> Dict[str, Any]:
        """Get a single team by ID. User must be owner or member."""
        if not ObjectId.is_valid(team_id):
            raise ValidationException("Invalid team ID format")

        team = await self.teams_collection.find_one({
            "_id": ObjectId(team_id),
            "$or": [{"ownerId": user_id}, {"members.userId": user_id}]
        })
        if not team:
            raise NotFoundException("Team not found or you don't have access")

        # Enrich members
        all_user_ids = {team["ownerId"]} | {m["userId"] for m in team.get("members", [])}
        user_docs = await self.users_collection.find(
            {"_id": {"$in": [ObjectId(uid) for uid in all_user_ids if ObjectId.is_valid(uid)]}}
        ).to_list(length=None)
        user_map = {str(u["_id"]): u for u in user_docs}

        team["members"] = [
            {
                "userId":    m["userId"],
                "email":     user_map.get(m["userId"], {}).get("email", ""),
                "name":      user_map.get(m["userId"], {}).get("name", ""),
                "avatarUrl": user_map.get(m["userId"], {}).get("avatarUrl", ""),
                "role":      m.get("role", "member"),
                "joinedAt":  m.get("joinedAt", team.get("createdAt")),
            }
            for m in team.get("members", [])
        ]
        return team
    
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
        - If user exists → add immediately.
        - If user doesn't exist → store pending invite + send email with signup link.
        """
        from app.services.email_service import email_service
        from app.config import settings
        import secrets

        if not ObjectId.is_valid(team_id):
            raise ValidationException("Invalid team ID format")

        team = await self.teams_collection.find_one({"_id": ObjectId(team_id)})
        if not team:
            raise NotFoundException("Team not found")

        # Permission check
        is_owner = team["ownerId"] == user_id
        is_admin = any(
            m["userId"] == user_id and m.get("role") == "admin"
            for m in team.get("members", [])
        )
        if not (is_owner or is_admin):
            raise ValidationException("Only team owners and admins can invite members")

        # Get inviter info
        inviter = await self.users_collection.find_one({"_id": ObjectId(user_id)})
        inviter_name = inviter.get("name", "A teammate") if inviter else "A teammate"

        # Check if user already exists in the system
        invited_user = await self.users_collection.find_one({"email": invite_email})

        if invited_user:
            # ── User already registered → add directly ──────────────────────
            invited_user_id = str(invited_user["_id"])

            if team["ownerId"] == invited_user_id:
                raise ValidationException("User is already the team owner")
            if any(m["userId"] == invited_user_id for m in team.get("members", [])):
                raise ValidationException("User is already a member of this team")

            new_member = {
                "userId": invited_user_id,
                "role": role,
                "joinedAt": datetime.utcnow(),
            }
            await self.teams_collection.update_one(
                {"_id": ObjectId(team_id)},
                {
                    "$push": {"members": new_member},
                    "$set":  {"updatedAt": datetime.utcnow()},
                }
            )
            await self._log_activity(
                team_id=team_id, user_id=user_id,
                activity_type="member_added", resource_type="member",
                resource_id=invited_user_id,
                description=f"{invited_user.get('name', invite_email)} was added to the team",
            )

        else:
            # ── User not registered → store pending invite + send email ──────
            # Check for existing pending invite
            existing = await self.db.team_invites.find_one({
                "teamId": team_id,
                "email": invite_email,
                "accepted": False,
            })
            if existing:
                raise ValidationException(
                    f"A pending invitation has already been sent to {invite_email}"
                )

            token = secrets.token_urlsafe(32)
            invite_doc = {
                "teamId": team_id,
                "email": invite_email,
                "role": role,
                "invitedBy": user_id,
                "token": token,
                "accepted": False,
                "createdAt": datetime.utcnow(),
                "expiresAt": datetime.utcnow() + timedelta(days=7),
            }
            await self.db.team_invites.insert_one(invite_doc)

            # Invite URL → register page with token pre-filled
            invite_url = (
                f"{settings.frontend_url}/register"
                f"?invite={token}&email={invite_email}"
            )

            await email_service.send_team_invite_email(
                to_email=invite_email,
                inviter_name=inviter_name,
                team_name=team["name"],
                role=role,
                invite_url=invite_url,
            )

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

