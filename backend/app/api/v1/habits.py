from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
from datetime import date

from app.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.habit import (
    HabitCreate, HabitUpdate, HabitResponse, HabitList,
    HabitLog, HabitLogsResponse, MonthlyLogsResponse, HabitShare
)
from app.schemas.common import MessageResponse
from app.services.habit_service import HabitService
from app.utils.exceptions import NotFoundException, ValidationException


router = APIRouter(prefix="/habits", tags=["Habits"])


@router.get("", response_model=HabitList)
async def get_habits(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all active habits for the current user.
    
    Returns habits owned by the user or shared with them.
    
    Optional filters:
    - **is_active**: Filter active/archived habits
    - **category**: Filter by category (health, fitness, productivity, etc.)
    """
    habit_service = HabitService(db)
    
    try:
        habits = await habit_service.get_habits(
            user_id=str(current_user["_id"]),
            is_active=is_active,
            category=category
        )
        
        # Convert ObjectIds to strings
        for habit in habits:
            habit["_id"] = str(habit["_id"])
        
        return {"habits": habits, "total": len(habits)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def create_habit(
    habit_data: HabitCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a new habit.
    
    - **name**: Habit name (required) - e.g., "Wake at 06:00", "Cold Shower"
    - **description**: Habit description (optional)
    - **category**: Category (health, fitness, productivity, mindfulness, learning, social, other)
    - **frequency**: How often (daily, weekly, custom)
    - **goal**: Daily/weekly goal count (optional)
    - **reminderTime**: Reminder time in HH:MM format (optional)
    - **color**: Color for visualization (optional)
    - **isActive**: Whether habit is active (default: true)
    """
    habit_service = HabitService(db)
    
    try:
        habit = await habit_service.create_habit(
            user_id=str(current_user["_id"]),
            habit_data=habit_data.model_dump()
        )
        habit["_id"] = str(habit["_id"])
        return habit
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{habit_id}", response_model=HabitResponse)
async def get_habit(
    habit_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a single habit by ID with streak information."""
    habit_service = HabitService(db)
    
    try:
        habit = await habit_service.get_habit_by_id(habit_id, str(current_user["_id"]))
        habit["_id"] = str(habit["_id"])
        return habit
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: str,
    habit_data: HabitUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update a habit.
    
    Only the habit owner can update. All fields are optional.
    """
    habit_service = HabitService(db)
    
    try:
        habit = await habit_service.update_habit(
            habit_id=habit_id,
            user_id=str(current_user["_id"]),
            habit_data=habit_data.model_dump(exclude_unset=True)
        )
        habit["_id"] = str(habit["_id"])
        return habit
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{habit_id}", response_model=MessageResponse)
async def delete_habit(
    habit_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Archive a habit (sets isActive to false).
    
    The habit data is preserved and can be reactivated later.
    Only the habit owner can archive.
    """
    habit_service = HabitService(db)
    
    try:
        result = await habit_service.delete_habit(habit_id, str(current_user["_id"]))
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{habit_id}/logs", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def log_habit_completion(
    habit_id: str,
    log_data: HabitLog,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Mark a habit as "Done" for a specific date (the checkmark logic).
    
    - **date**: Date of completion in YYYY-MM-DD format (required)
    - **completed**: Whether habit was completed (default: true)
    - **notes**: Optional notes about the completion
    
    If a log already exists for this date, it will be updated.
    """
    habit_service = HabitService(db)
    
    try:
        await habit_service.log_habit(
            habit_id=habit_id,
            user_id=str(current_user["_id"]),
            log_date=log_data.date,
            completed=log_data.completed,
            notes=log_data.notes
        )
        return {"message": "Habit logged successfully"}
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{habit_id}/logs/{log_date}", response_model=MessageResponse)
async def delete_habit_log(
    habit_id: str,
    log_date: date,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Remove a habit log entry (for correcting mistakes).
    
    Deletes the completion record for the specified date.
    """
    habit_service = HabitService(db)
    
    try:
        result = await habit_service.delete_habit_log(
            habit_id=habit_id,
            user_id=str(current_user["_id"]),
            log_date=log_date
        )
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{habit_id}/logs", response_model=HabitLogsResponse)
async def get_habit_logs(
    habit_id: str,
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all logs for a specific habit within a date range.
    
    Optional filters:
    - **start_date**: Start date
    - **end_date**: End date
    """
    habit_service = HabitService(db)
    
    try:
        # Get habit info
        habit = await habit_service.get_habit_by_id(habit_id, str(current_user["_id"]))
        
        # Get logs
        logs = await habit_service.get_habit_logs(
            habit_id=habit_id,
            user_id=str(current_user["_id"]),
            start_date=start_date,
            end_date=end_date
        )
        
        return {
            "habitId": habit_id,
            "habitName": habit["name"],
            "logs": logs,
            "total": len(logs)
        }
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/logs/monthly", response_model=MonthlyLogsResponse)
async def get_monthly_logs(
    month: int = Query(..., description="Month (1-12)", ge=1, le=12),
    year: int = Query(..., description="Year (e.g., 2026)"),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all habit logs for an entire month.
    
    Returns data for the entire month for dashboard visualization.
    Perfect for rendering the monthly calendar view.
    
    - **month**: Month number (1-12)
    - **year**: Year (e.g., 2026)
    """
    habit_service = HabitService(db)
    
    try:
        logs = await habit_service.get_monthly_logs(
            user_id=str(current_user["_id"]),
            month=month,
            year=year
        )
        return logs
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{habit_id}/share", response_model=HabitResponse)
async def share_habit(
    habit_id: str,
    share_data: HabitShare,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Share a specific habit with another user (accountability partner).
    
    Only the habit owner can share. The shared user can view progress and completions.
    
    - **userId**: User ID to share with (optional)
    - **email**: Email to share with (optional)
    - **accessType**: Access type - viewer or collaborator
    """
    habit_service = HabitService(db)
    
    try:
        habit = await habit_service.share_habit(
            habit_id=habit_id,
            owner_id=str(current_user["_id"]),
            share_user_id=share_data.userId,
            share_email=share_data.email
        )
        habit["_id"] = str(habit["_id"])
        return habit
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
