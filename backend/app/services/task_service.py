from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.utils.exceptions import NotFoundException, ValidationException


class TaskService:
    """Service for task operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.tasks_collection = db.tasks
        self.users_collection = db.users
        self.teams_collection = db.teams
    
    async def get_tasks(
        self,
        user_id: str,
        include_deleted: bool = False,
        folder_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all tasks for a user (owned or shared with them).
        
        Args:
            user_id: User's ID
            include_deleted: Whether to include soft-deleted tasks
            folder_id: Filter by folder ID (optional)
            status: Filter by status (optional)
        
        Returns:
            List of task documents
        """
        query = {
            "$or": [
                {"userId": user_id},  # Tasks owned by user
                {"collaborators.userId": user_id}  # Tasks shared with user
            ]
        }
        
        if not include_deleted:
            query["isDeleted"] = {"$ne": True}
        
        if folder_id:
            query["folderId"] = folder_id
        
        if status:
            query["status"] = status
        
        tasks = await self.tasks_collection.find(query).to_list(length=None)
        return tasks
    
    async def get_task_by_id(self, task_id: str, user_id: str) -> Dict[str, Any]:
        """
        Get a single task by ID with permission check.
        
        Args:
            task_id: Task's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            Task document
        
        Raises:
            NotFoundException: If task not found or user doesn't have access
        """
        try:
            task = await self.tasks_collection.find_one({
                "_id": ObjectId(task_id),
                "$or": [
                    {"userId": user_id},  # Owner
                    {"collaborators.userId": user_id}  # Collaborator
                ]
            })
        except Exception:
            raise NotFoundException("Task not found")
        
        if not task:
            raise NotFoundException("Task not found or you don't have access")
        
        return task
    
    async def create_task(self, user_id: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new task.
        
        Args:
            user_id: User's ID
            task_data: Task data
        
        Returns:
            Created task document
        """
        task_doc = {
            "userId": user_id,
            "title": task_data.get("title"),
            "description": task_data.get("description", ""),
            "status": task_data.get("status", "todo"),
            "priority": task_data.get("priority", "medium"),
            "dueDate": task_data.get("dueDate"),
            "folderId": task_data.get("folderId"),
            "teamId": task_data.get("teamId"),
            "tags": task_data.get("tags", []),  # Simple string tags
            "color": task_data.get("color"),
            "labels": task_data.get("labels", []),
            "position": task_data.get("position"),
            "subtasks": task_data.get("subtasks", []),
            "attachments": task_data.get("attachments", []),
            "collaborators": [],  # Initialize empty collaborators list
            "isDeleted": False,
            "deletedAt": None,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = await self.tasks_collection.insert_one(task_doc)
        task_doc["_id"] = result.inserted_id
        
        return task_doc
    
    async def update_task(
        self,
        task_id: str,
        user_id: str,
        task_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update a task.
        
        Args:
            task_id: Task's ObjectId as string
            user_id: User's ID (for authorization)
            task_data: Updated task data
        
        Returns:
            Updated task document
        
        Raises:
            NotFoundException: If task not found
        """
        # Build update document
        update_doc = {"updatedAt": datetime.utcnow()}
        
        # Include all updatable fields
        updatable_fields = [
            "title", "description", "status", "priority", "dueDate", 
            "folderId", "teamId", "tags", "color", "labels", "position", 
            "subtasks", "attachments"
        ]
        
        for field in updatable_fields:
            if field in task_data and task_data[field] is not None:
                update_doc[field] = task_data[field]
        
        # Update task
        try:
            result = await self.tasks_collection.find_one_and_update(
                {"_id": ObjectId(task_id), "userId": user_id},
                {"$set": update_doc},
                return_document=True
            )
        except Exception:
            raise NotFoundException("Task not found")
        
        if not result:
            raise NotFoundException("Task not found")
        
        return result
    
    async def delete_task(self, task_id: str, user_id: str) -> Dict[str, str]:
        """
        Soft delete a task.
        
        Args:
            task_id: Task's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            Success message
        
        Raises:
            NotFoundException: If task not found
        """
        try:
            result = await self.tasks_collection.update_one(
                {"_id": ObjectId(task_id), "userId": user_id},
                {"$set": {
                    "isDeleted": True,
                    "deletedAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }}
            )
        except Exception:
            raise NotFoundException("Task not found")
        
        if result.matched_count == 0:
            raise NotFoundException("Task not found")
        
        return {"message": "Task moved to trash"}
    
    async def restore_task(self, task_id: str, user_id: str) -> Dict[str, Any]:
        """
        Restore a soft-deleted task.
        
        Args:
            task_id: Task's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            Restored task document
        
        Raises:
            NotFoundException: If task not found
        """
        try:
            result = await self.tasks_collection.find_one_and_update(
                {"_id": ObjectId(task_id), "userId": user_id},
                {"$set": {
                    "isDeleted": False,
                    "deletedAt": None,
                    "updatedAt": datetime.utcnow()
                }},
                return_document=True
            )
        except Exception:
            raise NotFoundException("Task not found")
        
        if not result:
            raise NotFoundException("Task not found")
        
        return result
    
    async def permanently_delete_task(self, task_id: str, user_id: str) -> Dict[str, str]:
        """
        Permanently delete a task.
        
        Args:
            task_id: Task's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            Success message
        
        Raises:
            NotFoundException: If task not found
        """
        try:
            result = await self.tasks_collection.delete_one({
                "_id": ObjectId(task_id),
                "userId": user_id
            })
        except Exception:
            raise NotFoundException("Task not found")
        
        if result.deleted_count == 0:
            raise NotFoundException("Task not found")
        
        return {"message": "Task permanently deleted"}
    
    async def get_trashed_tasks(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all trashed (soft-deleted) tasks for a user.
        
        Args:
            user_id: User's ID
        
        Returns:
            List of trashed task documents
        """
        tasks = await self.tasks_collection.find({
            "userId": user_id,
            "isDeleted": True
        }).to_list(length=None)
        
        return tasks
    
    async def _has_task_permission(
        self,
        task: Dict[str, Any],
        user_id: str,
        required_role: Optional[str] = None
    ) -> bool:
        """
        Check if user has permission to access a task.
        
        Args:
            task: Task document
            user_id: User's ID
            required_role: Required role (viewer, editor, assignee) or None for any access
        
        Returns:
            True if user has permission, False otherwise
        """
        # Owner has all permissions
        if task["userId"] == user_id:
            return True
        
        # Check if user is in team (if task has team)
        if task.get("teamId"):
            team = await self.teams_collection.find_one({
                "_id": ObjectId(task["teamId"]),
                "$or": [
                    {"ownerId": user_id},
                    {"members.userId": user_id}
                ]
            })
            if team:
                return True
        
        # Check if user is a collaborator
        collaborators = task.get("collaborators", [])
        for collab in collaborators:
            if collab["userId"] == user_id:
                if required_role is None:
                    return True
                # Check role hierarchy: assignee > editor > viewer
                if required_role == "viewer":
                    return True
                elif required_role == "editor" and collab["role"] in ["editor", "assignee"]:
                    return True
                elif required_role == "assignee" and collab["role"] == "assignee":
                    return True
        
        return False
    
    async def assign_task(
        self,
        task_id: str,
        owner_id: str,
        assignee_id: str,
        role: str = "assignee"
    ) -> Dict[str, Any]:
        """
        Assign a specific user to a task.
        
        Args:
            task_id: Task's ObjectId as string
            owner_id: Owner's ID (for authorization)
            assignee_id: User ID to assign
            role: Role to assign (default: "assignee")
        
        Returns:
            Updated task document
        
        Raises:
            NotFoundException: If task or user not found
            ValidationException: If user lacks permission or already assigned
        """
        if not ObjectId.is_valid(task_id):
            raise ValidationException("Invalid task ID format")
        
        # Get task and check ownership
        task = await self.tasks_collection.find_one({"_id": ObjectId(task_id)})
        
        if not task:
            raise NotFoundException("Task not found")
        
        # Check if requester has permission (owner or team member with editor+ role)
        if task["userId"] != owner_id:
            has_permission = await self._has_task_permission(task, owner_id, "editor")
            if not has_permission:
                raise ValidationException("Only task owner or editors can assign users")
        
        # Check if assignee exists
        assignee = await self.users_collection.find_one({"_id": ObjectId(assignee_id)})
        if not assignee:
            raise NotFoundException(f"User with ID {assignee_id} not found")
        
        # Check if already assigned
        collaborators = task.get("collaborators", [])
        if any(c["userId"] == assignee_id for c in collaborators):
            raise ValidationException("User is already assigned to this task")
        
        # Add collaborator
        new_collaborator = {
            "userId": assignee_id,
            "role": role,
            "addedAt": datetime.utcnow()
        }
        
        await self.tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {
                "$push": {"collaborators": new_collaborator},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )
        
        # Return updated task
        updated_task = await self.tasks_collection.find_one({"_id": ObjectId(task_id)})
        return updated_task
    
    async def invite_task_collaborator(
        self,
        task_id: str,
        owner_id: str,
        email: str,
        role: str = "editor"
    ) -> Dict[str, Any]:
        """
        Invite an external user by email to collaborate on a task.
        
        Args:
            task_id: Task's ObjectId as string
            owner_id: Owner's ID (for authorization)
            email: Email of user to invite
            role: Role to assign (default: "editor")
        
        Returns:
            Updated task document
        
        Raises:
            NotFoundException: If task or user not found
            ValidationException: If user lacks permission or already invited
        """
        if not ObjectId.is_valid(task_id):
            raise ValidationException("Invalid task ID format")
        
        # Get task and check ownership
        task = await self.tasks_collection.find_one({"_id": ObjectId(task_id)})
        
        if not task:
            raise NotFoundException("Task not found")
        
        # Check if requester has permission
        if task["userId"] != owner_id:
            has_permission = await self._has_task_permission(task, owner_id, "editor")
            if not has_permission:
                raise ValidationException("Only task owner or editors can invite collaborators")
        
        # Find user by email
        invited_user = await self.users_collection.find_one({"email": email})
        if not invited_user:
            raise NotFoundException(f"User with email {email} not found")
        
        invited_user_id = str(invited_user["_id"])
        
        # Check if user is the owner
        if task["userId"] == invited_user_id:
            raise ValidationException("Cannot invite the task owner as a collaborator")
        
        # Check if already a collaborator
        collaborators = task.get("collaborators", [])
        if any(c["userId"] == invited_user_id for c in collaborators):
            raise ValidationException("User is already a collaborator on this task")
        
        # Add collaborator
        new_collaborator = {
            "userId": invited_user_id,
            "role": role,
            "addedAt": datetime.utcnow()
        }
        
        await self.tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {
                "$push": {"collaborators": new_collaborator},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )
        
        # Return updated task
        updated_task = await self.tasks_collection.find_one({"_id": ObjectId(task_id)})
        return updated_task
    
    async def get_task_collaborators(
        self,
        task_id: str,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """
        Get all collaborators for a task.
        
        Args:
            task_id: Task's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            List of collaborators with user details
        
        Raises:
            NotFoundException: If task not found
            ValidationException: If user doesn't have access
        """
        if not ObjectId.is_valid(task_id):
            raise ValidationException("Invalid task ID format")
        
        # Get task and check permission
        task = await self.tasks_collection.find_one({"_id": ObjectId(task_id)})
        
        if not task:
            raise NotFoundException("Task not found")
        
        # Check if user has permission to view
        has_permission = await self._has_task_permission(task, user_id)
        if not has_permission:
            raise ValidationException("You don't have permission to view this task's collaborators")
        
        # Get collaborator details
        collaborators_list = []
        for collab in task.get("collaborators", []):
            user = await self.users_collection.find_one({"_id": ObjectId(collab["userId"])})
            if user:
                collaborators_list.append({
                    "userId": str(user["_id"]),
                    "email": user.get("email", ""),
                    "name": user.get("name", "Unknown"),
                    "role": collab["role"],
                    "addedAt": collab.get("addedAt", task.get("createdAt"))
                })
        
        return collaborators_list
    
    async def remove_task_collaborator(
        self,
        task_id: str,
        owner_id: str,
        collaborator_id: str
    ) -> Dict[str, str]:
        """
        Remove a collaborator from a task.
        
        Args:
            task_id: Task's ObjectId as string
            owner_id: Owner's ID (for authorization)
            collaborator_id: Collaborator's user ID to remove
        
        Returns:
            Success message
        
        Raises:
            NotFoundException: If task or collaborator not found
            ValidationException: If user lacks permission
        """
        if not ObjectId.is_valid(task_id):
            raise ValidationException("Invalid task ID format")
        
        # Get task and check ownership
        task = await self.tasks_collection.find_one({"_id": ObjectId(task_id)})
        
        if not task:
            raise NotFoundException("Task not found")
        
        # Check if requester has permission (owner or editor)
        if task["userId"] != owner_id:
            has_permission = await self._has_task_permission(task, owner_id, "editor")
            if not has_permission:
                raise ValidationException("Only task owner or editors can remove collaborators")
        
        # Check if collaborator exists
        collaborators = task.get("collaborators", [])
        if not any(c["userId"] == collaborator_id for c in collaborators):
            raise NotFoundException("Collaborator not found on this task")
        
        # Remove collaborator
        await self.tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {
                "$pull": {"collaborators": {"userId": collaborator_id}},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )
        
        return {"message": "Collaborator removed successfully"}
    
    async def duplicate_task(self, task_id: str, user_id: str) -> Dict[str, Any]:
        """
        Duplicate an existing task.
        
        Args:
            task_id: Task's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            Newly created task document
        
        Raises:
            NotFoundException: If task not found
        """
        # Get the original task
        original_task = await self.get_task_by_id(task_id, user_id)
        
        # Create a copy with modified title
        task_copy = {
            "userId": user_id,
            "title": f"{original_task['title']} (Copy)",
            "description": original_task.get("description", ""),
            "status": "todo",  # Reset to todo
            "priority": original_task.get("priority", "medium"),
            "dueDate": original_task.get("dueDate"),
            "folderId": original_task.get("folderId"),
            "teamId": original_task.get("teamId"),
            "color": original_task.get("color"),
            "labels": original_task.get("labels", []),
            "position": None,  # Will be positioned at end
            "subtasks": original_task.get("subtasks", []),
            "attachments": original_task.get("attachments", []),
            "collaborators": [],  # Don't copy collaborators
            "isDeleted": False,
            "deletedAt": None,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = await self.tasks_collection.insert_one(task_copy)
        task_copy["_id"] = result.inserted_id
        
        return task_copy
    
    async def reorder_tasks(
        self,
        user_id: str,
        updates: List[Dict[str, Any]]
    ) -> Dict[str, str]:
        """
        Bulk update task positions and optionally status.
        
        Args:
            user_id: User's ID (for authorization)
            updates: List of updates with taskId, position, and optional status
        
        Returns:
            Success message
        
        Raises:
            NotFoundException: If any task not found
            ValidationException: If user doesn't own tasks
        """
        for update in updates:
            task_id = update.get("taskId")
            position = update.get("position")
            new_status = update.get("status")
            
            if not ObjectId.is_valid(task_id):
                raise ValidationException(f"Invalid task ID: {task_id}")
            
            # Build update document
            update_doc = {
                "position": position,
                "updatedAt": datetime.utcnow()
            }
            
            if new_status:
                update_doc["status"] = new_status
            
            # Update the task
            result = await self.tasks_collection.update_one(
                {"_id": ObjectId(task_id), "userId": user_id},
                {"$set": update_doc}
            )
            
            if result.matched_count == 0:
                raise NotFoundException(f"Task {task_id} not found or you don't have permission")
        
        return {"message": f"Successfully updated {len(updates)} task(s)"}

