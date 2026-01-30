from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class MemberRole(str, Enum):
    """Member role enum."""
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


class TeamMember(BaseModel):
    """Schema for team member."""
    userId: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: MemberRole = MemberRole.MEMBER
    joinedAt: Optional[datetime] = None


class TeamInvite(BaseModel):
    """Schema for inviting a user to team."""
    email: EmailStr = Field(..., description="Email of user to invite")
    role: MemberRole = Field(MemberRole.MEMBER, description="Role to assign")


class MemberRoleUpdate(BaseModel):
    """Schema for updating member role."""
    role: MemberRole = Field(..., description="New role for the member")


class MemberResponse(BaseModel):
    """Schema for member response."""
    userId: str
    email: str
    name: str
    role: str
    joinedAt: datetime


class MemberListResponse(BaseModel):
    """Schema for member list response."""
    members: List[MemberResponse]
    total: int


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


class ActivityType(str, Enum):
    """Activity type enum."""
    TASK_CREATED = "task_created"
    TASK_UPDATED = "task_updated"
    TASK_DELETED = "task_deleted"
    NOTE_CREATED = "note_created"
    NOTE_UPDATED = "note_updated"
    NOTE_DELETED = "note_deleted"
    FOLDER_SHARED = "folder_shared"
    MEMBER_ADDED = "member_added"
    MEMBER_REMOVED = "member_removed"
    MEMBER_ROLE_CHANGED = "member_role_changed"


class ActivityResponse(BaseModel):
    """Schema for activity response."""
    id: str = Field(..., alias="_id")
    teamId: str
    userId: str
    userName: str
    activityType: str
    resourceType: str  # "task", "note", "folder", "member"
    resourceId: Optional[str] = None
    resourceTitle: Optional[str] = None
    description: str
    createdAt: datetime
    
    class Config:
        populate_by_name = True


class ActivityListResponse(BaseModel):
    """Schema for activity list response."""
    activities: List[ActivityResponse]
    total: int

