from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
import os

from app.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.user import UserResponse, ProfileUpdate, PasswordChange
from app.schemas.common import MessageResponse
from app.services.user_service import UserService
from app.utils.file_handler import FileHandler
from app.utils.exceptions import NotFoundException, UnauthorizedException, ValidationException
from app.config import settings


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get current user's profile.
    
    Requires authentication via Bearer token.
    """
    user_service = UserService(db)
    
    try:
        user = await user_service.get_user_by_id(str(current_user["_id"]))
        user["_id"] = str(user["_id"])
        return user
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update current user's profile.
    
    - **name**: New name (optional)
    - **bio**: New bio (optional)
    - **avatarUrl**: New avatar URL (optional)
    """
    user_service = UserService(db)
    
    try:
        user = await user_service.update_profile(
            user_id=str(current_user["_id"]),
            name=profile_data.name,
            bio=profile_data.bio,
            avatar_url=profile_data.avatarUrl
        )
        user["_id"] = str(user["_id"])
        return user
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/upload-avatar")
async def upload_avatar(
    avatar: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Upload user avatar image.
    
    Accepts: jpg, jpeg, png, gif, webp
    Max size: 5MB
    """
    user_service = UserService(db)
    
    try:
        # Generate unique filename
        unique_filename = FileHandler.generate_unique_filename(avatar.filename)
        
        # Save file
        upload_path = os.path.join(settings.upload_dir, "avatars", unique_filename)
        await FileHandler.save_upload_file(avatar, upload_path)
        
        # Optimize image
        await FileHandler.optimize_image(upload_path)
        
        # Update user profile with avatar URL
        avatar_url = f"/{settings.upload_dir}/avatars/{unique_filename}"
        user = await user_service.update_profile(
            user_id=str(current_user["_id"]),
            avatar_url=avatar_url
        )
        
        user["_id"] = str(user["_id"])
        
        return {
            "message": "Avatar uploaded successfully",
            "avatarUrl": avatar_url,
            "user": user
        }
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/change-password", response_model=MessageResponse)
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Change user password.
    
    - **currentPassword**: Current password
    - **newPassword**: New password (min 6 characters)
    """
    user_service = UserService(db)
    
    try:
        result = await user_service.change_password(
            user_id=str(current_user["_id"]),
            current_password=password_data.currentPassword,
            new_password=password_data.newPassword
        )
        return result
    except UnauthorizedException as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/profile", response_model=MessageResponse)
async def delete_account(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Delete user account and all associated data.
    
    This action is permanent and cannot be undone.
    """
    user_service = UserService(db)
    
    try:
        result = await user_service.delete_user(str(current_user["_id"]))
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
