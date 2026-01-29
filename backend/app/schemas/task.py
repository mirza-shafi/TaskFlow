from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    """Task status enum."""
    TODO = "todo"
    DOING = "doing"
    DONE = "done"


class TaskPriority(str, Enum):
    """Task priority enum."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskCreate(BaseModel):
    """Schema for creating a task."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    dueDate: Optional[datetime] = None
    folderId: Optional[str] = None
    teamId: Optional[str] = None


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    dueDate: Optional[datetime] = None
    folderId: Optional[str] = None
    teamId: Optional[str] = None


class TaskResponse(BaseModel):
    """Schema for task response."""
    id: str = Field(..., alias="_id")
    userId: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    dueDate: Optional[datetime] = None
    folderId: Optional[str] = None
    teamId: Optional[str] = None
    isDeleted: bool = False
    deletedAt: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "userId": "507f1f77bcf86cd799439012",
                "title": "Complete project",
                "description": "Finish the FastAPI migration",
                "status": "doing",
                "priority": "high",
                "dueDate": "2024-12-31T23:59:59Z",
                "isDeleted": False,
                "createdAt": "2024-01-01T00:00:00Z",
                "updatedAt": "2024-01-01T00:00:00Z"
            }
        }


class TaskList(BaseModel):
    """Schema for task list response."""
    tasks: list[TaskResponse]
    total: int
