from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class CollaboratorRole(str, Enum):
    """Collaborator role enum."""
    VIEWER = "viewer"
    EDITOR = "editor"
    ASSIGNEE = "assignee"


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


class TaskCollaborator(BaseModel):
    """Schema for task collaborator."""
    userId: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: CollaboratorRole
    addedAt: datetime


class TaskAssign(BaseModel):
    """Schema for assigning a user to a task."""
    userId: str = Field(..., description="User ID to assign")
    role: CollaboratorRole = Field(CollaboratorRole.ASSIGNEE, description="Role to assign")


class TaskInvite(BaseModel):
    """Schema for inviting a user by email to a task."""
    email: EmailStr = Field(..., description="Email of user to invite")
    role: CollaboratorRole = Field(CollaboratorRole.EDITOR, description="Role to assign")


class TaskCollaboratorResponse(BaseModel):
    """Schema for collaborator response."""
    userId: str
    email: str
    name: str
    role: str
    addedAt: datetime


class TaskCollaboratorList(BaseModel):
    """Schema for collaborators list response."""
    collaborators: List[TaskCollaboratorResponse]
    total: int
