from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
from datetime import date as date_type
from enum import Enum


class HabitFrequency(str, Enum):
    """Habit frequency enum."""
    DAILY = "daily"
    WEEKLY = "weekly"
    CUSTOM = "custom"


class HabitCategory(str, Enum):
    """Habit category enum."""
    HEALTH = "health"
    FITNESS = "fitness"
    PRODUCTIVITY = "productivity"
    MINDFULNESS = "mindfulness"
    LEARNING = "learning"
    SOCIAL = "social"
    OTHER = "other"


class HabitCreate(BaseModel):
    """Schema for creating a habit."""
    name: str = Field(..., min_length=1, max_length=100, description="Habit name")
    description: Optional[str] = Field(None, max_length=500, description="Habit description")
    category: HabitCategory = Field(HabitCategory.OTHER, description="Habit category")
    frequency: HabitFrequency = Field(HabitFrequency.DAILY, description="How often to perform")
    goal: Optional[int] = Field(None, description="Daily/weekly goal count")
    reminderTime: Optional[str] = Field(None, description="Reminder time (HH:MM format)")
    color: Optional[str] = Field(None, max_length=20, description="Color for visualization")
    isActive: bool = Field(True, description="Whether habit is active")


class HabitUpdate(BaseModel):
    """Schema for updating a habit."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    category: Optional[HabitCategory] = None
    frequency: Optional[HabitFrequency] = None
    goal: Optional[int] = None
    reminderTime: Optional[str] = None
    color: Optional[str] = Field(None, max_length=20)
    isActive: Optional[bool] = None


class HabitLog(BaseModel):
    """Schema for logging a habit completion."""
    date: date_type = Field(..., description="Date of completion (YYYY-MM-DD)")
    completed: bool = Field(True, description="Whether habit was completed")
    notes: Optional[str] = Field(None, max_length=500, description="Optional notes")


class HabitLogEntry(BaseModel):
    """Schema for habit log entry in response."""
    date: date_type
    completed: bool
    notes: Optional[str] = None
    loggedAt: datetime


class HabitResponse(BaseModel):
    """Schema for habit response."""
    id: str = Field(..., alias="_id")
    userId: str
    name: str
    description: Optional[str] = None
    category: str
    frequency: str
    goal: Optional[int] = None
    reminderTime: Optional[str] = None
    color: Optional[str] = None
    isActive: bool
    currentStreak: int = 0
    longestStreak: int = 0
    totalCompletions: int = 0
    sharedWith: List[str] = []
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        populate_by_name = True


class HabitList(BaseModel):
    """Schema for habits list response."""
    habits: List[HabitResponse]
    total: int


class HabitShare(BaseModel):
    """Schema for sharing a habit."""
    userId: Optional[str] = Field(None, description="User ID to share with")
    email: Optional[EmailStr] = Field(None, description="Email to share with")
    accessType: str = Field("viewer", description="Access type: viewer or collaborator")


class HabitLogsResponse(BaseModel):
    """Schema for habit logs response."""
    habitId: str
    habitName: str
    logs: List[HabitLogEntry]
    total: int


class MonthlyLogsResponse(BaseModel):
    """Schema for monthly logs response."""
    month: str
    year: int
    habits: List[Dict]
    totalDays: int


class StreakInfo(BaseModel):
    """Schema for streak information."""
    habitId: str
    habitName: str
    currentStreak: int
    longestStreak: int
    lastCompletedDate: Optional[date_type] = None


class AnalyticsSummary(BaseModel):
    """Schema for analytics summary."""
    totalHabits: int
    activeHabits: int
    completionRate: float
    currentMonthCompletions: int
    totalCompletions: int
    averageStreak: float
    topStreaks: List[StreakInfo]


class HeatmapData(BaseModel):
    """Schema for heatmap data point."""
    date: date_type
    completions: int
    habits: List[str]


class HeatmapResponse(BaseModel):
    """Schema for heatmap response."""
    startDate: date_type
    endDate: date_type
    data: List[HeatmapData]


class DashboardShare(BaseModel):
    """Schema for sharing dashboard."""
    expiresIn: Optional[int] = Field(30, description="Link expiry in days")


class DashboardShareResponse(BaseModel):
    """Schema for dashboard share response."""
    shareId: str
    shareLink: str
    expiresAt: datetime


class SocialFeedItem(BaseModel):
    """Schema for social feed item."""
    userId: str
    userName: str
    habitName: str
    completedAt: datetime
    streak: int


class SocialFeedResponse(BaseModel):
    """Schema for social feed response."""
    feed: List[SocialFeedItem]
    total: int
