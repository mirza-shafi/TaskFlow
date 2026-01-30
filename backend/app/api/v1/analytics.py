from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import date

from app.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.habit import (
    AnalyticsSummary, HeatmapResponse, SocialFeedResponse
)
from app.services.habit_service import HabitService


router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get comprehensive analytics summary for the user's habits.
    
    Returns:
    - **totalHabits**: Total number of active habits
    - **completionRate**: Overall completion percentage
    - **currentStreaks**: Current streaks for all habits
    - **longestStreaks**: Longest streaks achieved
    - **totalCompletions**: Total habit completions
    - **categoryBreakdown**: Habits grouped by category
    - **weeklyProgress**: Completion rate for the current week
    - **monthlyProgress**: Completion rate for the current month
    
    Perfect for dashboard overview showing user progress at a glance.
    """
    habit_service = HabitService(db)
    
    try:
        summary = await habit_service.get_analytics_summary(str(current_user["_id"]))
        return summary
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/heatmap", response_model=HeatmapResponse)
async def get_heatmap_data(
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get heatmap data for habit completions within a date range.
    
    Returns daily completion counts for visualization (GitHub-style contribution graph).
    
    Each day shows:
    - **date**: Date in YYYY-MM-DD format
    - **completions**: Number of habits completed that day
    - **habits**: Array of habit names completed
    
    Perfect for rendering visual heatmaps/calendar views showing activity intensity.
    
    - **start_date**: Start date (required)
    - **end_date**: End date (required)
    """
    habit_service = HabitService(db)
    
    try:
        heatmap_data = await habit_service.get_heatmap_data(
            user_id=str(current_user["_id"]),
            start_date=start_date,
            end_date=end_date
        )
        
        return {
            "data": heatmap_data,
            "startDate": start_date,
            "endDate": end_date
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/social/feed", response_model=SocialFeedResponse)
async def get_social_feed(
    limit: int = Query(20, description="Number of items to return", ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get social activity feed from habits shared with the user.
    
    Shows recent completions from accountability partners for motivation.
    
    Each item shows:
    - **habitId**: Habit ID
    - **habitName**: Name of the habit
    - **userName**: User who completed the habit
    - **completedAt**: Completion timestamp
    - **notes**: Optional completion notes
    
    Perfect for "Recent Activity" or "Friends' Progress" feed.
    
    - **limit**: Maximum items to return (default: 20, max: 100)
    """
    habit_service = HabitService(db)
    
    try:
        feed = await habit_service.get_social_feed(
            user_id=str(current_user["_id"]),
            limit=limit
        )
        
        return {
            "feed": feed,
            "total": len(feed)
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
