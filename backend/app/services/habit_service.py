from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta
import calendar

from app.utils.exceptions import NotFoundException, ValidationException


class HabitService:
    """Service for habit tracking operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.habits_collection = db.habits
        self.habit_logs_collection = db.habit_logs
        self.users_collection = db.users
        self.dashboard_shares_collection = db.dashboard_shares
    
    async def get_habits(
        self,
        user_id: str,
        is_active: Optional[bool] = None,
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all habits for a user or shared with them.
        
        Args:
            user_id: User's ID
            is_active: Filter by active status (optional)
            category: Filter by category (optional)
        
        Returns:
            List of habit documents with streak information
        """
        query = {
            "$or": [
                {"userId": user_id},  # Owned habits
                {"sharedWith": user_id}  # Shared habits
            ]
        }
        
        if is_active is not None:
            query["isActive"] = is_active
        
        if category:
            query["category"] = category
        
        habits = await self.habits_collection.find(query).to_list(length=None)
        
        # Calculate streaks for each habit
        for habit in habits:
            habit["currentStreak"] = await self._calculate_current_streak(str(habit["_id"]))
            habit["longestStreak"] = await self._calculate_longest_streak(str(habit["_id"]))
            habit["totalCompletions"] = await self._count_total_completions(str(habit["_id"]))
        
        return habits
    
    async def get_habit_by_id(self, habit_id: str, user_id: str) -> Dict[str, Any]:
        """
        Get a single habit by ID with permission check.
        
        Args:
            habit_id: Habit's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            Habit document with streak information
        
        Raises:
            NotFoundException: If habit not found or user doesn't have access
            ValidationException: If habit_id is invalid
        """
        if not ObjectId.is_valid(habit_id):
            raise ValidationException("Invalid habit ID format")
        
        habit = await self.habits_collection.find_one({
            "_id": ObjectId(habit_id),
            "$or": [
                {"userId": user_id},
                {"sharedWith": user_id}
            ]
        })
        
        if not habit:
            raise NotFoundException(f"Habit with ID {habit_id} not found or you don't have access")
        
        # Calculate streaks
        habit["currentStreak"] = await self._calculate_current_streak(habit_id)
        habit["longestStreak"] = await self._calculate_longest_streak(habit_id)
        habit["totalCompletions"] = await self._count_total_completions(habit_id)
        
        return habit
    
    async def create_habit(self, user_id: str, habit_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new habit.
        
        Args:
            user_id: User's ID
            habit_data: Habit data from request
        
        Returns:
            Created habit document
        """
        now = datetime.utcnow()
        habit_document = {
            "userId": user_id,
            "name": habit_data["name"],
            "description": habit_data.get("description"),
            "category": habit_data.get("category", "other"),
            "frequency": habit_data.get("frequency", "daily"),
            "goal": habit_data.get("goal"),
            "reminderTime": habit_data.get("reminderTime"),
            "color": habit_data.get("color"),
            "isActive": habit_data.get("isActive", True),
            "sharedWith": [],
            "createdAt": now,
            "updatedAt": now
        }
        
        result = await self.habits_collection.insert_one(habit_document)
        habit_document["_id"] = result.inserted_id
        
        # Add initial streak info
        habit_document["currentStreak"] = 0
        habit_document["longestStreak"] = 0
        habit_document["totalCompletions"] = 0
        
        return habit_document
    
    async def update_habit(
        self,
        habit_id: str,
        user_id: str,
        habit_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update a habit.
        
        Args:
            habit_id: Habit's ObjectId as string
            user_id: User's ID (for authorization, must be owner)
            habit_data: Updated habit data
        
        Returns:
            Updated habit document
        
        Raises:
            NotFoundException: If habit not found
            ValidationException: If user is not the owner
        """
        if not ObjectId.is_valid(habit_id):
            raise ValidationException("Invalid habit ID format")
        
        # Check if habit exists and user is owner
        habit = await self.habits_collection.find_one({
            "_id": ObjectId(habit_id),
            "userId": user_id
        })
        
        if not habit:
            raise NotFoundException(f"Habit with ID {habit_id} not found or you're not the owner")
        
        # Prepare update data
        update_data = {**habit_data, "updatedAt": datetime.utcnow()}
        
        # Update habit
        await self.habits_collection.update_one(
            {"_id": ObjectId(habit_id)},
            {"$set": update_data}
        )
        
        # Return updated habit with streaks
        updated_habit = await self.get_habit_by_id(habit_id, user_id)
        return updated_habit
    
    async def delete_habit(self, habit_id: str, user_id: str) -> Dict[str, str]:
        """
        Archive/delete a habit (set isActive to False).
        
        Args:
            habit_id: Habit's ObjectId as string
            user_id: User's ID (for authorization, must be owner)
        
        Returns:
            Success message
        
        Raises:
            NotFoundException: If habit not found
            ValidationException: If user is not the owner
        """
        if not ObjectId.is_valid(habit_id):
            raise ValidationException("Invalid habit ID format")
        
        # Check if habit exists and user is owner
        habit = await self.habits_collection.find_one({
            "_id": ObjectId(habit_id),
            "userId": user_id
        })
        
        if not habit:
            raise NotFoundException(f"Habit with ID {habit_id} not found or you're not the owner")
        
        # Archive habit (set isActive to False)
        await self.habits_collection.update_one(
            {"_id": ObjectId(habit_id)},
            {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
        )
        
        return {"message": "Habit archived successfully"}
    
    async def log_habit(
        self,
        habit_id: str,
        user_id: str,
        log_date: date,
        completed: bool = True,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Log a habit completion for a specific date.
        
        Args:
            habit_id: Habit's ObjectId as string
            user_id: User's ID (for authorization)
            log_date: Date of completion
            completed: Whether habit was completed
            notes: Optional notes
        
        Returns:
            Created log document
        
        Raises:
            NotFoundException: If habit not found
            ValidationException: If user doesn't have access
        """
        if not ObjectId.is_valid(habit_id):
            raise ValidationException("Invalid habit ID format")
        
        # Check if habit exists and user has access
        habit = await self.habits_collection.find_one({
            "_id": ObjectId(habit_id),
            "$or": [
                {"userId": user_id},
                {"sharedWith": user_id}
            ]
        })
        
        if not habit:
            raise NotFoundException(f"Habit with ID {habit_id} not found or you don't have access")
        
        # Check if log already exists for this date
        existing_log = await self.habit_logs_collection.find_one({
            "habitId": habit_id,
            "userId": user_id,
            "date": log_date
        })
        
        if existing_log:
            # Update existing log
            await self.habit_logs_collection.update_one(
                {"_id": existing_log["_id"]},
                {
                    "$set": {
                        "completed": completed,
                        "notes": notes,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            log_document = await self.habit_logs_collection.find_one({"_id": existing_log["_id"]})
        else:
            # Create new log
            log_document = {
                "habitId": habit_id,
                "userId": user_id,
                "date": log_date,
                "completed": completed,
                "notes": notes,
                "loggedAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            
            result = await self.habit_logs_collection.insert_one(log_document)
            log_document["_id"] = result.inserted_id
        
        return log_document
    
    async def delete_habit_log(
        self,
        habit_id: str,
        user_id: str,
        log_date: date
    ) -> Dict[str, str]:
        """
        Delete a habit log entry.
        
        Args:
            habit_id: Habit's ObjectId as string
            user_id: User's ID (for authorization)
            log_date: Date of the log to delete
        
        Returns:
            Success message
        
        Raises:
            NotFoundException: If log not found
        """
        if not ObjectId.is_valid(habit_id):
            raise ValidationException("Invalid habit ID format")
        
        result = await self.habit_logs_collection.delete_one({
            "habitId": habit_id,
            "userId": user_id,
            "date": log_date
        })
        
        if result.deleted_count == 0:
            raise NotFoundException(f"Log not found for date {log_date}")
        
        return {"message": "Log deleted successfully"}
    
    async def get_habit_logs(
        self,
        habit_id: str,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        """
        Get logs for a specific habit within a date range.
        
        Args:
            habit_id: Habit's ObjectId as string
            user_id: User's ID (for authorization)
            start_date: Start date (optional)
            end_date: End date (optional)
        
        Returns:
            List of log documents
        """
        if not ObjectId.is_valid(habit_id):
            raise ValidationException("Invalid habit ID format")
        
        # Verify access to habit
        habit = await self.habits_collection.find_one({
            "_id": ObjectId(habit_id),
            "$or": [
                {"userId": user_id},
                {"sharedWith": user_id}
            ]
        })
        
        if not habit:
            raise NotFoundException(f"Habit with ID {habit_id} not found or you don't have access")
        
        query = {"habitId": habit_id, "userId": user_id}
        
        if start_date or end_date:
            date_filter = {}
            if start_date:
                date_filter["$gte"] = start_date
            if end_date:
                date_filter["$lte"] = end_date
            query["date"] = date_filter
        
        logs = await self.habit_logs_collection.find(query).sort("date", -1).to_list(length=None)
        return logs
    
    async def get_monthly_logs(
        self,
        user_id: str,
        month: int,
        year: int
    ) -> Dict[str, Any]:
        """
        Get all habit logs for a specific month.
        
        Args:
            user_id: User's ID
            month: Month (1-12)
            year: Year
        
        Returns:
            Dictionary with habits and their logs for the month
        """
        # Get date range for the month
        start_date = date(year, month, 1)
        _, last_day = calendar.monthrange(year, month)
        end_date = date(year, month, last_day)
        
        # Get all active habits
        habits = await self.get_habits(user_id, is_active=True)
        
        result = {
            "month": calendar.month_name[month],
            "year": year,
            "habits": [],
            "totalDays": last_day
        }
        
        for habit in habits:
            logs = await self.get_habit_logs(
                str(habit["_id"]),
                user_id,
                start_date,
                end_date
            )
            
            result["habits"].append({
                "habitId": str(habit["_id"]),
                "habitName": habit["name"],
                "category": habit["category"],
                "color": habit.get("color"),
                "logs": logs,
                "completions": len([l for l in logs if l.get("completed", False)])
            })
        
        return result
    
    async def share_habit(
        self,
        habit_id: str,
        owner_id: str,
        share_user_id: Optional[str] = None,
        share_email: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Share a habit with another user.
        
        Args:
            habit_id: Habit's ObjectId as string
            owner_id: Owner's ID (for authorization)
            share_user_id: User ID to share with (optional)
            share_email: Email to share with (optional)
        
        Returns:
            Updated habit document
        
        Raises:
            NotFoundException: If habit or user not found
            ValidationException: If user is not the owner
        """
        if not ObjectId.is_valid(habit_id):
            raise ValidationException("Invalid habit ID format")
        
        # Check if habit exists and user is owner
        habit = await self.habits_collection.find_one({
            "_id": ObjectId(habit_id),
            "userId": owner_id
        })
        
        if not habit:
            raise NotFoundException(f"Habit with ID {habit_id} not found or you're not the owner")
        
        # Find user to share with
        target_user_id = share_user_id
        if share_email and not share_user_id:
            user = await self.users_collection.find_one({"email": share_email})
            if not user:
                raise NotFoundException(f"User with email {share_email} not found")
            target_user_id = str(user["_id"])
        
        if not target_user_id:
            raise ValidationException("Must provide either userId or email")
        
        # Check if already shared
        if target_user_id in habit.get("sharedWith", []):
            raise ValidationException("Habit is already shared with this user")
        
        # Share habit
        await self.habits_collection.update_one(
            {"_id": ObjectId(habit_id)},
            {
                "$addToSet": {"sharedWith": target_user_id},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )
        
        # Return updated habit
        updated_habit = await self.get_habit_by_id(habit_id, owner_id)
        return updated_habit
    
    async def unshare_habit(
        self,
        habit_id: str,
        owner_id: str,
        user_id: str
    ) -> Dict[str, str]:
        """
        Remove a user from habit sharing (unshare).
        
        Args:
            habit_id: Habit's ObjectId as string
            owner_id: Owner's ID (for authorization)
            user_id: User ID to remove
        
        Returns:
            Success message
        
        Raises:
            NotFoundException: If habit not found
            ValidationException: If user is not the owner
        """
        if not ObjectId.is_valid(habit_id):
            raise ValidationException("Invalid habit ID format")
        
        # Check if habit exists and user is owner
        habit = await self.habits_collection.find_one({
            "_id": ObjectId(habit_id),
            "userId": owner_id
        })
        
        if not habit:
            raise NotFoundException(f"Habit with ID {habit_id} not found or you're not the owner")
        
        # Remove user from sharedWith
        await self.habits_collection.update_one(
            {"_id": ObjectId(habit_id)},
            {
                "$pull": {"sharedWith": user_id},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )
        
        return {"message": "Habit unshared successfully"}
    
    async def get_habit_collaborators(
        self,
        habit_id: str,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """
        Get list of users a habit is shared with.
        
        Args:
            habit_id: Habit's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            List of collaborators
        
        Raises:
            NotFoundException: If habit not found
            ValidationException: If user doesn't have access
        """
        if not ObjectId.is_valid(habit_id):
            raise ValidationException("Invalid habit ID format")
        
        habit = await self.habits_collection.find_one({"_id": ObjectId(habit_id)})
        
        if not habit:
            raise NotFoundException(f"Habit with ID {habit_id} not found")
        
        # Check if user is owner or has access
        if habit["userId"] != user_id and user_id not in habit.get("sharedWith", []):
            raise ValidationException("You don't have access to this habit")
        
        # Get collaborator details
        collaborators = []
        for shared_user_id in habit.get("sharedWith", []):
            user = await self.users_collection.find_one({"_id": ObjectId(shared_user_id)})
            if user:
                collaborators.append({
                    "userId": str(user["_id"]),
                    "email": user["email"],
                    "name": user.get("name", user["email"]),
                    "accessType": "viewer",  # Can be enhanced later with role system
                    "sharedAt": habit.get("updatedAt", habit["createdAt"])
                })
        
        return collaborators
    
    async def _calculate_current_streak(self, habit_id: str) -> int:
        """Calculate current streak for a habit."""
        today = date.today()
        streak = 0
        check_date = today
        
        # Check backwards from today
        while True:
            log = await self.habit_logs_collection.find_one({
                "habitId": habit_id,
                "date": check_date,
                "completed": True
            })
            
            if log:
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break
            
            # Safety limit
            if streak > 365:
                break
        
        return streak
    
    async def _calculate_longest_streak(self, habit_id: str) -> int:
        """Calculate longest streak for a habit."""
        logs = await self.habit_logs_collection.find({
            "habitId": habit_id,
            "completed": True
        }).sort("date", 1).to_list(length=None)
        
        if not logs:
            return 0
        
        max_streak = 0
        current_streak = 1
        
        for i in range(1, len(logs)):
            prev_date = logs[i-1]["date"]
            curr_date = logs[i]["date"]
            
            # Check if dates are consecutive
            if (curr_date - prev_date).days == 1:
                current_streak += 1
            else:
                max_streak = max(max_streak, current_streak)
                current_streak = 1
        
        max_streak = max(max_streak, current_streak)
        return max_streak
    
    async def _count_total_completions(self, habit_id: str) -> int:
        """Count total completions for a habit."""
        count = await self.habit_logs_collection.count_documents({
            "habitId": habit_id,
            "completed": True
        })
        return count
    
    async def get_analytics_summary(self, user_id: str) -> Dict[str, Any]:
        """
        Get analytics summary for user's habits.
        
        Args:
            user_id: User's ID
        
        Returns:
            Dictionary with analytics data
        """
        habits = await self.get_habits(user_id)
        active_habits = [h for h in habits if h.get("isActive", True)]
        
        # Get current month stats
        today = date.today()
        start_of_month = date(today.year, today.month, 1)
        
        current_month_completions = 0
        total_completions = 0
        streaks = []
        
        for habit in active_habits:
            habit_id = str(habit["_id"])
            
            # Monthly completions
            monthly_logs = await self.habit_logs_collection.count_documents({
                "habitId": habit_id,
                "completed": True,
                "date": {"$gte": start_of_month, "$lte": today}
            })
            current_month_completions += monthly_logs
            
            # Total completions
            total = habit.get("totalCompletions", 0)
            total_completions += total
            
            # Streak info
            streaks.append({
                "habitId": habit_id,
                "habitName": habit["name"],
                "currentStreak": habit.get("currentStreak", 0),
                "longestStreak": habit.get("longestStreak", 0),
                "lastCompletedDate": None  # Could calculate if needed
            })
        
        # Calculate completion rate
        days_in_month = today.day
        expected_completions = len(active_habits) * days_in_month
        completion_rate = (current_month_completions / expected_completions * 100) if expected_completions > 0 else 0
        
        # Average streak
        average_streak = sum(s["currentStreak"] for s in streaks) / len(streaks) if streaks else 0
        
        # Top streaks
        top_streaks = sorted(streaks, key=lambda x: x["currentStreak"], reverse=True)[:5]
        
        return {
            "totalHabits": len(habits),
            "activeHabits": len(active_habits),
            "completionRate": round(completion_rate, 2),
            "currentMonthCompletions": current_month_completions,
            "totalCompletions": total_completions,
            "averageStreak": round(average_streak, 2),
            "topStreaks": top_streaks
        }
    
    async def get_heatmap_data(
        self,
        user_id: str,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Get heatmap data for a date range.
        
        Args:
            user_id: User's ID
            start_date: Start date
            end_date: End date
        
        Returns:
            List of daily completion counts
        """
        # Get all logs in date range
        logs = await self.habit_logs_collection.find({
            "userId": user_id,
            "completed": True,
            "date": {"$gte": start_date, "$lte": end_date}
        }).to_list(length=None)
        
        # Group by date
        daily_data = {}
        for log in logs:
            log_date = log["date"]
            if log_date not in daily_data:
                daily_data[log_date] = {
                    "date": log_date,
                    "completions": 0,
                    "habits": []
                }
            daily_data[log_date]["completions"] += 1
            
            # Get habit name
            habit = await self.habits_collection.find_one({"_id": ObjectId(log["habitId"])})
            if habit:
                daily_data[log_date]["habits"].append(habit["name"])
        
        # Fill in missing dates with zero completions
        current_date = start_date
        result = []
        while current_date <= end_date:
            if current_date in daily_data:
                result.append(daily_data[current_date])
            else:
                result.append({
                    "date": current_date,
                    "completions": 0,
                    "habits": []
                })
            current_date += timedelta(days=1)
        
        return result
    
    async def get_social_feed(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get social feed of recent habit completions from shared habits.
        
        Args:
            user_id: User's ID
            limit: Maximum number of items
        
        Returns:
            List of recent completions
        """
        # Get habits shared with this user
        habits = await self.habits_collection.find({
            "sharedWith": user_id
        }).to_list(length=None)
        
        habit_ids = [str(h["_id"]) for h in habits]
        
        if not habit_ids:
            return []
        
        # Get recent logs from these habits
        recent_logs = await self.habit_logs_collection.find({
            "habitId": {"$in": habit_ids},
            "completed": True
        }).sort("loggedAt", -1).limit(limit).to_list(length=limit)
        
        feed = []
        for log in recent_logs:
            habit = next((h for h in habits if str(h["_id"]) == log["habitId"]), None)
            if habit:
                user = await self.users_collection.find_one({"_id": ObjectId(habit["userId"])})
                if user:
                    # Calculate streak at that time
                    streak = await self._calculate_current_streak(log["habitId"])
                    
                    feed.append({
                        "userId": str(user["_id"]),
                        "userName": user.get("name", "Unknown"),
                        "habitName": habit["name"],
                        "completedAt": log["loggedAt"],
                        "streak": streak
                    })
        
        return feed
