from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class CollaboratorRole(str, Enum):
    """Collaborator role enum for notes."""
    VIEWER = "viewer"
    EDITOR = "editor"


class NoteCreate(BaseModel):
    """Schema for creating a note."""
    title: str = Field(..., min_length=1, max_length=200, description="Note title")
    content: str = Field("", description="Note content (supports Markdown or JSON-based Rich Text)")
    folderId: Optional[str] = Field(None, description="Folder ID to organize the note")
    tags: Optional[List[str]] = Field(default_factory=list, description="Tags for categorization")
    isPinned: bool = Field(False, description="Whether the note is pinned to the top")
    isFavorite: bool = Field(False, description="Whether the note is marked as favorite")


class NoteUpdate(BaseModel):
    """Schema for updating a note."""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Note title")
    content: Optional[str] = Field(None, description="Note content (supports Markdown or JSON-based Rich Text)")
    folderId: Optional[str] = Field(None, description="Folder ID to organize the note")
    tags: Optional[List[str]] = Field(None, description="Tags for categorization")
    isPinned: Optional[bool] = Field(None, description="Whether the note is pinned to the top")
    isFavorite: Optional[bool] = Field(None, description="Whether the note is marked as favorite")


class NotePinUpdate(BaseModel):
    """Schema for pinning/unpinning a note."""
    isPinned: bool = Field(..., description="Whether to pin or unpin the note")


class NoteResponse(BaseModel):
    """Schema for note response."""
    id: str = Field(..., alias="_id")
    userId: str
    title: str
    content: str
    folderId: Optional[str] = None
    tags: List[str] = []
    isPinned: bool = False
    isFavorite: bool = False
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
                "title": "Meeting Notes",
                "content": "# Important Points\n\n- Discuss project timeline\n- Review budget",
                "folderId": "507f1f77bcf86cd799439013",
                "tags": ["work", "meeting"],
                "isPinned": False,
                "isFavorite": True,
                "isDeleted": False,
                "createdAt": "2024-01-01T00:00:00Z",
                "updatedAt": "2024-01-01T00:00:00Z"
            }
        }


class NoteList(BaseModel):
    """Schema for note list response."""
    notes: List[NoteResponse]
    total: int


class NoteCollaborator(BaseModel):
    """Schema for note collaborator."""
    userId: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: CollaboratorRole
    addedAt: datetime


class NoteInvite(BaseModel):
    """Schema for inviting a user by email to a note."""
    email: EmailStr = Field(..., description="Email of user to invite")
    role: CollaboratorRole = Field(CollaboratorRole.EDITOR, description="Role to assign")


class NoteCollaboratorResponse(BaseModel):
    """Schema for collaborator response."""
    userId: str
    email: str
    name: str
    role: str
    addedAt: datetime


class NoteCollaboratorList(BaseModel):
    """Schema for collaborators list response."""
    collaborators: List[NoteCollaboratorResponse]
    total: int
