from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional

from app.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskList
from app.schemas.common import MessageResponse
from app.services.task_service import TaskService
from app.utils.exceptions import NotFoundException


router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=TaskList)
async def get_tasks(
    folder_id: Optional[str] = Query(None, description="Filter by folder ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all tasks for the current user.
    
    Optional filters:
    - **folder_id**: Filter by folder
    - **status**: Filter by status (todo, doing, done)
    """
    task_service = TaskService(db)
    
    try:
        tasks = await task_service.get_tasks(
            user_id=str(current_user["_id"]),
            folder_id=folder_id,
            status=status
        )
        
        # Convert ObjectIds to strings
        for task in tasks:
            task["_id"] = str(task["_id"])
        
        return {"tasks": tasks, "total": len(tasks)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a new task.
    
    - **title**: Task title (required)
    - **description**: Task description (optional)
    - **status**: Task status (todo, doing, done)
    - **priority**: Task priority (low, medium, high)
    - **dueDate**: Due date (optional)
    - **folderId**: Folder ID (optional)
    - **teamId**: Team ID (optional)
    """
    task_service = TaskService(db)
    
    try:
        task = await task_service.create_task(
            user_id=str(current_user["_id"]),
            task_data=task_data.model_dump()
        )
        task["_id"] = str(task["_id"])
        return task
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a single task by ID."""
    task_service = TaskService(db)
    
    try:
        task = await task_service.get_task_by_id(task_id, str(current_user["_id"]))
        task["_id"] = str(task["_id"])
        return task
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update a task.
    
    All fields are optional. Only provided fields will be updated.
    """
    task_service = TaskService(db)
    
    try:
        task = await task_service.update_task(
            task_id=task_id,
            user_id=str(current_user["_id"]),
            task_data=task_data.model_dump(exclude_unset=True)
        )
        task["_id"] = str(task["_id"])
        return task
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{task_id}", response_model=MessageResponse)
async def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Soft delete a task (move to trash).
    
    The task can be restored later.
    """
    task_service = TaskService(db)
    
    try:
        result = await task_service.delete_task(task_id, str(current_user["_id"]))
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/trash/all", response_model=TaskList)
async def get_trashed_tasks(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all trashed (soft-deleted) tasks."""
    task_service = TaskService(db)
    
    try:
        tasks = await task_service.get_trashed_tasks(str(current_user["_id"]))
        
        # Convert ObjectIds to strings
        for task in tasks:
            task["_id"] = str(task["_id"])
        
        return {"tasks": tasks, "total": len(tasks)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{task_id}/restore", response_model=TaskResponse)
async def restore_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Restore a trashed task."""
    task_service = TaskService(db)
    
    try:
        task = await task_service.restore_task(task_id, str(current_user["_id"]))
        task["_id"] = str(task["_id"])
        return task
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{task_id}/permanent", response_model=MessageResponse)
async def permanently_delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Permanently delete a task.
    
    This action cannot be undone.
    """
    task_service = TaskService(db)
    
    try:
        result = await task_service.permanently_delete_task(task_id, str(current_user["_id"]))
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
