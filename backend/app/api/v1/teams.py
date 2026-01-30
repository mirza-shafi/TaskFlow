from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

from app.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.team import (
    TeamCreate, TeamUpdate, TeamResponse, TeamInvite,
    MemberRoleUpdate, MemberListResponse, ActivityListResponse
)
from app.schemas.common import MessageResponse
from app.services.team_service import TeamService
from app.utils.exceptions import NotFoundException, ValidationException


router = APIRouter(prefix="/teams", tags=["Teams"])


@router.get("", response_model=List[TeamResponse])
async def get_teams(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all teams where user is owner or member."""
    team_service = TeamService(db)
    
    try:
        teams = await team_service.get_teams(str(current_user["_id"]))
        
        # Convert ObjectIds to strings
        for team in teams:
            team["_id"] = str(team["_id"])
        
        return teams
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
    team_data: TeamCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a new team.
    
    - **name**: Team name (required)
    - **description**: Team description (optional)
    """
    team_service = TeamService(db)
    
    try:
        team = await team_service.create_team(
            user_id=str(current_user["_id"]),
            team_data=team_data.model_dump()
        )
        team["_id"] = str(team["_id"])
        return team
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: str,
    team_data: TeamUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update a team (only owner can update)."""
    team_service = TeamService(db)
    
    try:
        team = await team_service.update_team(
            team_id=team_id,
            user_id=str(current_user["_id"]),
            team_data=team_data.model_dump(exclude_unset=True)
        )
        team["_id"] = str(team["_id"])
        return team
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{team_id}", response_model=MessageResponse)
async def delete_team(
    team_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a team (only owner can delete)."""
    team_service = TeamService(db)
    
    try:
        result = await team_service.delete_team(team_id, str(current_user["_id"]))
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{team_id}/members", response_model=MemberListResponse)
async def get_team_members(
    team_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all members of a team.
    
    Returns list of team members including owner and all members with their roles.
    """
    team_service = TeamService(db)
    
    try:
        members = await team_service.get_team_members(team_id, str(current_user["_id"]))
        return {"members": members, "total": len(members)}
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{team_id}/invite", response_model=TeamResponse)
async def invite_member(
    team_id: str,
    invite_data: TeamInvite,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Invite a user to a team by email.
    
    Only team owners and admins can invite new members.
    
    - **email**: Email of user to invite (required)
    - **role**: Role to assign (member or admin, default: member)
    """
    team_service = TeamService(db)
    
    try:
        team = await team_service.invite_member(
            team_id=team_id,
            user_id=str(current_user["_id"]),
            invite_email=invite_data.email,
            role=invite_data.role.value
        )
        team["_id"] = str(team["_id"])
        return team
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("/{team_id}/members/{member_id}", response_model=TeamResponse)
async def update_member_role(
    team_id: str,
    member_id: str,
    role_data: MemberRoleUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Change a team member's role.
    
    Only team owners can change member roles.
    Cannot change the owner's role.
    
    - **role**: New role (member or admin)
    """
    team_service = TeamService(db)
    
    try:
        team = await team_service.update_member_role(
            team_id=team_id,
            user_id=str(current_user["_id"]),
            member_id=member_id,
            new_role=role_data.role.value
        )
        team["_id"] = str(team["_id"])
        return team
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{team_id}/members/{member_id}", response_model=MessageResponse)
async def remove_member(
    team_id: str,
    member_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Remove a member from a team.
    
    Team owners and admins can remove members.
    Cannot remove the team owner.
    """
    team_service = TeamService(db)
    
    try:
        result = await team_service.remove_member(
            team_id=team_id,
            user_id=str(current_user["_id"]),
            member_id=member_id
        )
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{team_id}/activity", response_model=ActivityListResponse)
async def get_team_activity(
    team_id: str,
    limit: int = Query(50, description="Maximum number of activities to return", ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get team activity history.
    
    Shows who edited which notes, tasks, folders, and member changes.
    Returns most recent activities first.
    """
    team_service = TeamService(db)
    
    try:
        activities = await team_service.get_team_activity(
            team_id=team_id,
            user_id=str(current_user["_id"]),
            limit=limit
        )
        
        # Convert ObjectIds to strings
        for activity in activities:
            activity["_id"] = str(activity["_id"])
        
        return {"activities": activities, "total": len(activities)}
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

