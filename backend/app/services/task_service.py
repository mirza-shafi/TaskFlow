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
    
    async def get_tasks(
        self,
        user_id: str,
        include_deleted: bool = False,
        folder_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all tasks for a user.
        
        Args:
            user_id: User's ID
            include_deleted: Whether to include soft-deleted tasks
            folder_id: Filter by folder ID (optional)
            status: Filter by status (optional)
        
        Returns:
            List of task documents
        """
        query = {"userId": user_id}
        
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
        Get a single task by ID.
        
        Args:
            task_id: Task's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            Task document
        
        Raises:
            NotFoundException: If task not found or doesn't belong to user
        """
        try:
            task = await self.tasks_collection.find_one({
                "_id": ObjectId(task_id),
                "userId": user_id
            })
        except Exception:
            raise NotFoundException("Task not found")
        
        if not task:
            raise NotFoundException("Task not found")
        
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
        
        for field in ["title", "description", "status", "priority", "dueDate", "folderId", "teamId"]:
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
