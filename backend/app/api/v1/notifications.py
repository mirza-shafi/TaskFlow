from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

from app.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.notification import (
    NotificationResponse,
    NotificationList,
    NotificationUpdate,
    UnreadCountResponse
)
from app.schemas.common import MessageResponse
from app.services.notification_service import NotificationService
from app.utils.exceptions import NotFoundException


router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationList)
async def get_notifications(
    skip: int = Query(0, ge=0, description="Number of notifications to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of notifications to return"),
    unread_only: bool = Query(False, description="Return only unread notifications"),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get notifications for the current user.
    
    - **skip**: Pagination offset
    - **limit**: Number of notifications to return (max 100)
    - **unread_only**: Filter to show only unread notifications
    """
    notification_service = NotificationService(db)
    
    notifications, total, unread_count = await notification_service.get_user_notifications(
        user_id=str(current_user["_id"]),
        skip=skip,
        limit=limit,
        unread_only=unread_only
    )
    
    # Convert ObjectId to string
    for notification in notifications:
        notification["_id"] = str(notification["_id"])
    
    return {
        "notifications": notifications,
        "total": total,
        "unreadCount": unread_count
    }


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get count of unread notifications for the current user."""
    notification_service = NotificationService(db)
    
    count = await notification_service.get_unread_count(
        user_id=str(current_user["_id"])
    )
    
    return {"count": count}


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Mark a specific notification as read."""
    notification_service = NotificationService(db)
    
    try:
        notification = await notification_service.mark_as_read(
            notification_id=notification_id,
            user_id=str(current_user["_id"])
        )
        notification["_id"] = str(notification["_id"])
        return notification
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/mark-all-read", response_model=MessageResponse)
async def mark_all_as_read(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Mark all notifications as read for the current user."""
    notification_service = NotificationService(db)
    
    count = await notification_service.mark_all_as_read(
        user_id=str(current_user["_id"])
    )
    
    return {"message": f"Marked {count} notifications as read"}


@router.delete("/{notification_id}", response_model=MessageResponse)
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a specific notification."""
    notification_service = NotificationService(db)
    
    try:
        await notification_service.delete_notification(
            notification_id=notification_id,
            user_id=str(current_user["_id"])
        )
        return {"message": "Notification deleted successfully"}
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("", response_model=MessageResponse)
async def delete_all_notifications(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete all notifications for the current user."""
    notification_service = NotificationService(db)
    
    count = await notification_service.delete_all_notifications(
        user_id=str(current_user["_id"])
    )
    
    return {"message": f"Deleted {count} notifications"}
