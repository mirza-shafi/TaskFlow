from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

from app.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.folder import FolderCreate, FolderUpdate, FolderResponse
from app.schemas.common import MessageResponse
from app.services.folder_service import FolderService
from app.utils.exceptions import NotFoundException


router = APIRouter(prefix="/folders", tags=["Folders"])


@router.get("", response_model=List[FolderResponse])
async def get_folders(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all folders for the current user."""
    folder_service = FolderService(db)
    
    try:
        folders = await folder_service.get_folders(str(current_user["_id"]))
        
        # Convert ObjectIds to strings
        for folder in folders:
            folder["_id"] = str(folder["_id"])
        
        return folders
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder_data: FolderCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a new folder.
    
    - **name**: Folder name (required)
    - **color**: Folder color (optional)
    """
    folder_service = FolderService(db)
    
    try:
        folder = await folder_service.create_folder(
            user_id=str(current_user["_id"]),
            folder_data=folder_data.model_dump()
        )
        folder["_id"] = str(folder["_id"])
        return folder
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: str,
    folder_data: FolderUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update a folder."""
    folder_service = FolderService(db)
    
    try:
        folder = await folder_service.update_folder(
            folder_id=folder_id,
            user_id=str(current_user["_id"]),
            folder_data=folder_data.model_dump(exclude_unset=True)
        )
        folder["_id"] = str(folder["_id"])
        return folder
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{folder_id}", response_model=MessageResponse)
async def delete_folder(
    folder_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a folder."""
    folder_service = FolderService(db)
    
    try:
        result = await folder_service.delete_folder(folder_id, str(current_user["_id"]))
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
