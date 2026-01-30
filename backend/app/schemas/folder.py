from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class FolderCreate(BaseModel):
    """Schema for creating a folder."""
    name: str = Field(..., min_length=1, max_length=100)
    color: Optional[str] = Field(None, max_length=20)


class FolderUpdate(BaseModel):
    """Schema for updating a folder."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    color: Optional[str] = Field(None, max_length=20)


class FolderShare(BaseModel):
    """Schema for sharing a folder with a team."""
    teamId: str = Field(..., description="Team ID to share the folder with")


class FolderResponse(BaseModel):
    """Schema for folder response."""
    id: str = Field(..., alias="_id")
    userId: str
    name: str
    color: Optional[str] = None
    sharedWithTeams: List[str] = []
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        populate_by_name = True

