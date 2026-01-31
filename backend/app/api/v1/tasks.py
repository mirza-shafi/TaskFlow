from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional

from app.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskList,
    TaskAssign, TaskInvite, TaskCollaboratorList,
    TaskReorderRequest
)
from app.schemas.common import MessageResponse
from app.services.task_service import TaskService
from app.utils.exceptions import NotFoundException, ValidationException


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


@router.post("/{task_id}/assign", response_model=TaskResponse)
async def assign_task(
    task_id: str,
    assign_data: TaskAssign,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Assign a specific user to a task.
    
    Enables granular task-level collaboration. Only task owners or editors can assign users.
    
    - **userId**: User ID to assign (required)
    - **role**: Role to assign (viewer, editor, assignee - default: assignee)
    """
    task_service = TaskService(db)
    
    try:
        task = await task_service.assign_task(
            task_id=task_id,
            owner_id=str(current_user["_id"]),
            assignee_id=assign_data.userId,
            role=assign_data.role.value
        )
        task["_id"] = str(task["_id"])
        return task
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{task_id}/invite", response_model=TaskResponse)
async def invite_task_collaborator(
    task_id: str,
    invite_data: TaskInvite,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Invite an external user by email to view/edit only this task.
    
    Perfect for ad-hoc collaboration without sharing entire teams or folders.
    Only task owners or editors can invite collaborators.
    
    - **email**: Email of user to invite (required)
    - **role**: Role to assign (viewer, editor, assignee - default: editor)
    """
    task_service = TaskService(db)
    
    try:
        task = await task_service.invite_task_collaborator(
            task_id=task_id,
            owner_id=str(current_user["_id"]),
            email=invite_data.email,
            role=invite_data.role.value
        )
        task["_id"] = str(task["_id"])
        return task
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{task_id}/collaborators", response_model=TaskCollaboratorList)
async def get_task_collaborators(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    See everyone who has access to this specific task.
    
    Shows all users who have been assigned or invited to collaborate on this task.
    """
    task_service = TaskService(db)
    
    try:
        collaborators = await task_service.get_task_collaborators(
            task_id=task_id,
            user_id=str(current_user["_id"])
        )
        return {"collaborators": collaborators, "total": len(collaborators)}
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{task_id}/collaborators/{collaborator_id}", response_model=MessageResponse)
async def remove_task_collaborator(
    task_id: str,
    collaborator_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Revoke a specific person's access to the task.
    
    Only task owners or editors can remove collaborators.
    """
    task_service = TaskService(db)
    
    try:
        result = await task_service.remove_task_collaborator(
            task_id=task_id,
            owner_id=str(current_user["_id"]),
            collaborator_id=collaborator_id
        )
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{task_id}/duplicate", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Duplicate an existing task.
    
    Creates a copy of the task with all its properties except collaborators.
    The new task will have "(Copy)" appended to its title.
    """
    task_service = TaskService(db)
    
    try:
        task = await task_service.duplicate_task(task_id, str(current_user["_id"]))
        task["_id"] = str(task["_id"])
        return task
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("/reorder", response_model=MessageResponse)
async def reorder_tasks(
    reorder_data: TaskReorderRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Bulk update task positions and optionally status.
    
    Used for drag-and-drop functionality in the board view.
    Updates multiple tasks' positions and/or status in a single request.
    
    - **updates**: List of task position updates with taskId, position, and optional status
    """
    task_service = TaskService(db)
    
    try:
        result = await task_service.reorder_tasks(
            user_id=str(current_user["_id"]),
            updates=[update.model_dump() for update in reorder_data.updates]
        )
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

