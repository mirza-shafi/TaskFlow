from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

from app.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.team import TeamCreate, TeamUpdate, TeamResponse
from app.schemas.common import MessageResponse
from app.services.team_service import TeamService
from app.utils.exceptions import NotFoundException


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
