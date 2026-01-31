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


class Label(BaseModel):
    """Schema for task label."""
    name: str = Field(..., min_length=1, max_length=50)
    color: str = Field(..., pattern="^#[0-9A-Fa-f]{6}$")  # Hex color code


class Subtask(BaseModel):
    """Schema for subtask."""
    title: str = Field(..., min_length=1, max_length=200)
    completed: bool = False


class Attachment(BaseModel):
    """Schema for task attachment."""
    filename: str
    url: str
    fileType: str  # e.g., 'image/png', 'application/pdf'
    size: Optional[int] = None  # File size in bytes
    uploadedAt: datetime = Field(default_factory=datetime.utcnow)


class TaskCreate(BaseModel):
    """Schema for creating a task."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    dueDate: Optional[datetime] = None
    folderId: Optional[str] = None
    teamId: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)  # Simple string tags for categorization
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")  # Hex color code
    labels: Optional[List[Label]] = Field(default_factory=list)
    position: Optional[int] = None  # For custom ordering within status columns
    subtasks: Optional[List[Subtask]] = Field(default_factory=list)
    attachments: Optional[List[Attachment]] = Field(default_factory=list)


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    dueDate: Optional[datetime] = None
    folderId: Optional[str] = None
    teamId: Optional[str] = None
    tags: Optional[List[str]] = None  # Simple string tags
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    labels: Optional[List[Label]] = None
    position: Optional[int] = None
    subtasks: Optional[List[Subtask]] = None
    attachments: Optional[List[Attachment]] = None


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
    tags: Optional[List[str]] = Field(default_factory=list)  # Simple string tags
    isDeleted: bool = False
    deletedAt: Optional[datetime] = None
    color: Optional[str] = None
    labels: Optional[List[Label]] = Field(default_factory=list)
    position: Optional[int] = None
    subtasks: Optional[List[Subtask]] = Field(default_factory=list)
    attachments: Optional[List[Attachment]] = Field(default_factory=list)
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


class TaskPositionUpdate(BaseModel):
    """Schema for updating a single task's position."""
    taskId: str = Field(..., description="Task ID")
    position: int = Field(..., description="New position")
    status: Optional[TaskStatus] = Field(None, description="New status (for drag between columns)")


class TaskReorderRequest(BaseModel):
    """Schema for bulk task reordering."""
    updates: List[TaskPositionUpdate] = Field(..., description="List of task position updates")
