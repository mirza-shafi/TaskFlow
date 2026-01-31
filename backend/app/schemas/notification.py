from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class NotificationType(str, Enum):
    """Notification type enum."""
    TASK_ASSIGNED = "task_assigned"
    TASK_SHARED = "task_shared"
    NOTE_SHARED = "note_shared"
    TEAM_INVITE = "team_invite"
    TEAM_MEMBER_ADDED = "team_member_added"
    HABIT_MILESTONE = "habit_milestone"
    HABIT_SHARED = "habit_shared"
    FOLDER_SHARED = "folder_shared"
    COMMENT_ADDED = "comment_added"
    MENTION = "mention"
    SYSTEM = "system"


class NotificationCreate(BaseModel):
    """Schema for creating a notification."""
    userId: str = Field(..., description="User ID to send notification to")
    type: NotificationType = Field(..., description="Type of notification")
    title: str = Field(..., min_length=1, max_length=200, description="Notification title")
    message: str = Field(..., min_length=1, max_length=500, description="Notification message")
    actionUrl: Optional[str] = Field(None, description="URL to navigate when clicked")
    metadata: Optional[dict] = Field(default_factory=dict, description="Additional metadata")


class NotificationUpdate(BaseModel):
    """Schema for updating a notification."""
    isRead: Optional[bool] = Field(None, description="Mark as read/unread")


class NotificationResponse(BaseModel):
    """Schema for notification response."""
    id: str = Field(..., alias="_id")
    userId: str
    type: str
    title: str
    message: str
    actionUrl: Optional[str] = None
    metadata: dict = {}
    isRead: bool = False
    createdAt: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "userId": "507f1f77bcf86cd799439012",
                "type": "task_assigned",
                "title": "New task assigned",
                "message": "John assigned you a task: Complete project report",
                "actionUrl": "/tasks/507f1f77bcf86cd799439013",
                "metadata": {"taskId": "507f1f77bcf86cd799439013"},
                "isRead": False,
                "createdAt": "2024-01-01T00:00:00Z"
            }
        }


class NotificationList(BaseModel):
    """Schema for notification list response."""
    notifications: List[NotificationResponse]
    total: int
    unreadCount: int


class UnreadCountResponse(BaseModel):
    """Schema for unread count response."""
    count: int
