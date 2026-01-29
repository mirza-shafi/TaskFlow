from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TeamMember(BaseModel):
    """Schema for team member."""
    userId: str
    role: str = "member"


class TeamCreate(BaseModel):
    """Schema for creating a team."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class TeamUpdate(BaseModel):
    """Schema for updating a team."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class TeamResponse(BaseModel):
    """Schema for team response."""
    id: str = Field(..., alias="_id")
    name: str
    description: Optional[str] = None
    ownerId: str
    members: List[TeamMember] = []
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        populate_by_name = True
