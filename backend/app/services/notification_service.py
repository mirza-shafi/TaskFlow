from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from typing import Optional, Dict, Any, List

from app.schemas.notification import NotificationType
from app.utils.exceptions import NotFoundException


class NotificationService:
    """Service for managing notifications."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.notifications
    
    async def create_notification(
        self,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        action_url: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new notification."""
        notification = {
            "userId": user_id,
            "type": notification_type.value,
            "title": title,
            "message": message,
            "actionUrl": action_url,
            "metadata": metadata or {},
            "isRead": False,
            "createdAt": datetime.utcnow()
        }
        
        result = await self.collection.insert_one(notification)
        notification["_id"] = result.inserted_id
        return notification
    
    async def get_user_notifications(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 50,
        unread_only: bool = False
    ) -> tuple[List[Dict[str, Any]], int, int]:
        """Get notifications for a user with pagination."""
        query = {"userId": user_id}
        
        if unread_only:
            query["isRead"] = False
        
        # Get total count
        total = await self.collection.count_documents(query)
        
        # Get unread count
        unread_count = await self.collection.count_documents(
            {"userId": user_id, "isRead": False}
        )
        
        # Get notifications
        cursor = self.collection.find(query).sort("createdAt", -1).skip(skip).limit(limit)
        notifications = await cursor.to_list(length=limit)
        
        return notifications, total, unread_count
    
    async def get_notification_by_id(
        self,
        notification_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """Get a specific notification by ID."""
        if not ObjectId.is_valid(notification_id):
            raise NotFoundException("Invalid notification ID")
        
        notification = await self.collection.find_one({
            "_id": ObjectId(notification_id),
            "userId": user_id
        })
        
        if not notification:
            raise NotFoundException("Notification not found")
        
        return notification
    
    async def mark_as_read(
        self,
        notification_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """Mark a notification as read."""
        if not ObjectId.is_valid(notification_id):
            raise NotFoundException("Invalid notification ID")
        
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(notification_id), "userId": user_id},
            {"$set": {"isRead": True}},
            return_document=True
        )
        
        if not result:
            raise NotFoundException("Notification not found")
        
        return result
    
    async def mark_all_as_read(self, user_id: str) -> int:
        """Mark all notifications as read for a user."""
        result = await self.collection.update_many(
            {"userId": user_id, "isRead": False},
            {"$set": {"isRead": True}}
        )
        
        return result.modified_count
    
    async def delete_notification(
        self,
        notification_id: str,
        user_id: str
    ) -> bool:
        """Delete a notification."""
        if not ObjectId.is_valid(notification_id):
            raise NotFoundException("Invalid notification ID")
        
        result = await self.collection.delete_one({
            "_id": ObjectId(notification_id),
            "userId": user_id
        })
        
        if result.deleted_count == 0:
            raise NotFoundException("Notification not found")
        
        return True
    
    async def delete_all_notifications(self, user_id: str) -> int:
        """Delete all notifications for a user."""
        result = await self.collection.delete_many({"userId": user_id})
        return result.deleted_count
    
    async def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications for a user."""
        count = await self.collection.count_documents({
            "userId": user_id,
            "isRead": False
        })
        return count
    
    # Helper methods for common notification scenarios
    
    async def notify_task_assigned(
        self,
        assignee_id: str,
        task_id: str,
        task_title: str,
        assigned_by_name: str
    ):
        """Create notification for task assignment."""
        await self.create_notification(
            user_id=assignee_id,
            notification_type=NotificationType.TASK_ASSIGNED,
            title="New task assigned",
            message=f"{assigned_by_name} assigned you a task: {task_title}",
            action_url=f"/tasks/{task_id}",
            metadata={"taskId": task_id}
        )
    
    async def notify_note_shared(
        self,
        recipient_id: str,
        note_id: str,
        note_title: str,
        shared_by_name: str
    ):
        """Create notification for note sharing."""
        await self.create_notification(
            user_id=recipient_id,
            notification_type=NotificationType.NOTE_SHARED,
            title="Note shared with you",
            message=f"{shared_by_name} shared a note with you: {note_title}",
            action_url=f"/notes/{note_id}",
            metadata={"noteId": note_id}
        )
    
    async def notify_team_invite(
        self,
        recipient_id: str,
        team_id: str,
        team_name: str,
        invited_by_name: str
    ):
        """Create notification for team invitation."""
        await self.create_notification(
            user_id=recipient_id,
            notification_type=NotificationType.TEAM_INVITE,
            title="Team invitation",
            message=f"{invited_by_name} invited you to join team: {team_name}",
            action_url=f"/teams/{team_id}",
            metadata={"teamId": team_id}
        )
    
    async def notify_habit_milestone(
        self,
        user_id: str,
        habit_id: str,
        habit_name: str,
        milestone: str
    ):
        """Create notification for habit milestone."""
        await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.HABIT_MILESTONE,
            title="Habit milestone reached! 🎉",
            message=f"Congratulations! You've reached {milestone} for {habit_name}",
            action_url=f"/habits/{habit_id}",
            metadata={"habitId": habit_id, "milestone": milestone}
        )
