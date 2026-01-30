from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List

from app.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.note import (
    NoteCreate, NoteUpdate, NotePinUpdate, NoteResponse, NoteList,
    NoteInvite, NoteCollaboratorList
)
from app.schemas.common import MessageResponse
from app.services.note_service import NoteService
from app.utils.exceptions import NotFoundException, ValidationException


router = APIRouter(prefix="/notes", tags=["Notes"])


@router.get("", response_model=NoteList)
async def get_notes(
    folder_id: Optional[str] = Query(None, description="Filter by folder ID"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    is_pinned: Optional[bool] = Query(None, description="Filter by pinned status"),
    is_favorite: Optional[bool] = Query(None, description="Filter by favorite status"),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all notes for the current user.
    
    Optional filters:
    - **folder_id**: Filter by folder
    - **tags**: Filter by tags (can specify multiple)
    - **is_pinned**: Filter pinned notes
    - **is_favorite**: Filter favorite notes
    
    Notes are returned with pinned notes first, then sorted by creation date (newest first).
    """
    note_service = NoteService(db)
    
    try:
        notes = await note_service.get_notes(
            user_id=str(current_user["_id"]),
            folder_id=folder_id,
            tags=tags,
            is_pinned=is_pinned,
            is_favorite=is_favorite
        )
        
        # Convert ObjectIds to strings
        for note in notes:
            note["_id"] = str(note["_id"])
        
        return {"notes": notes, "total": len(notes)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/favorites", response_model=NoteList)
async def get_favorite_notes(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all favorite/starred notes for the current user.
    
    Returns notes marked as favorite, with pinned notes first.
    """
    note_service = NoteService(db)
    
    try:
        notes = await note_service.get_favorite_notes(
            user_id=str(current_user["_id"])
        )
        
        # Convert ObjectIds to strings
        for note in notes:
            note["_id"] = str(note["_id"])
        
        return {"notes": notes, "total": len(notes)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: NoteCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a new note.
    
    - **title**: Note title (required)
    - **content**: Note content supporting Markdown or JSON-based Rich Text (optional)
    - **folderId**: Folder ID to organize the note (optional)
    - **tags**: List of tags for categorization (optional)
    - **isPinned**: Pin note to the top (optional, default: false)
    - **isFavorite**: Mark note as favorite (optional, default: false)
    """
    note_service = NoteService(db)
    
    try:
        note = await note_service.create_note(
            user_id=str(current_user["_id"]),
            note_data=note_data.model_dump()
        )
        note["_id"] = str(note["_id"])
        return note
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get a single note by ID with full content.
    
    Supports Markdown or JSON-based Rich Text content.
    """
    note_service = NoteService(db)
    
    try:
        note = await note_service.get_note_by_id(note_id, str(current_user["_id"]))
        note["_id"] = str(note["_id"])
        return note
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    note_data: NoteUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update a note.
    
    All fields are optional. Only provided fields will be updated.
    - **title**: Note title
    - **content**: Note content (Markdown or JSON-based Rich Text)
    - **folderId**: Folder ID
    - **tags**: List of tags
    - **isPinned**: Pin status
    - **isFavorite**: Favorite status
    """
    note_service = NoteService(db)
    
    try:
        note = await note_service.update_note(
            note_id=note_id,
            user_id=str(current_user["_id"]),
            note_data=note_data.model_dump(exclude_unset=True)
        )
        note["_id"] = str(note["_id"])
        return note
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("/{note_id}/pin", response_model=NoteResponse)
async def pin_unpin_note(
    note_id: str,
    pin_data: NotePinUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Pin or unpin a note to the top (like Google Keep).
    
    Pinned notes appear at the top of the notes list.
    
    - **isPinned**: true to pin, false to unpin
    """
    note_service = NoteService(db)
    
    try:
        note = await note_service.pin_unpin_note(
            note_id=note_id,
            user_id=str(current_user["_id"]),
            is_pinned=pin_data.isPinned
        )
        note["_id"] = str(note["_id"])
        return note
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{note_id}", response_model=MessageResponse)
async def delete_note(
    note_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Soft delete a note (move to trash).
    
    The note can be restored later.
    """
    note_service = NoteService(db)
    
    try:
        result = await note_service.delete_note(note_id, str(current_user["_id"]))
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/trash/all", response_model=NoteList)
async def get_trashed_notes(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all trashed (soft-deleted) notes."""
    note_service = NoteService(db)
    
    try:
        notes = await note_service.get_trashed_notes(str(current_user["_id"]))
        
        # Convert ObjectIds to strings
        for note in notes:
            note["_id"] = str(note["_id"])
        
        return {"notes": notes, "total": len(notes)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{note_id}/restore", response_model=NoteResponse)
async def restore_note(
    note_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Restore a trashed note."""
    note_service = NoteService(db)
    
    try:
        note = await note_service.restore_note(note_id, str(current_user["_id"]))
        note["_id"] = str(note["_id"])
        return note
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{note_id}/permanent", response_model=MessageResponse)
async def permanently_delete_note(
    note_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Permanently delete a note.
    
    This action cannot be undone.
    """
    note_service = NoteService(db)
    
    try:
        result = await note_service.permanently_delete_note(note_id, str(current_user["_id"]))
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{note_id}/invite", response_model=NoteResponse)
async def invite_note_collaborator(
    note_id: str,
    invite_data: NoteInvite,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Invite a user by email to collaborate on a specific note.
    
    Perfect for sharing individual notes without exposing entire notebooks.
    Only note owners or editors can invite collaborators.
    
    - **email**: Email of user to invite (required)
    - **role**: Role to assign (viewer or editor - default: editor)
    """
    note_service = NoteService(db)
    
    try:
        note = await note_service.invite_note_collaborator(
            note_id=note_id,
            owner_id=str(current_user["_id"]),
            email=invite_data.email,
            role=invite_data.role.value
        )
        note["_id"] = str(note["_id"])
        return note
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{note_id}/collaborators", response_model=NoteCollaboratorList)
async def get_note_collaborators(
    note_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    See everyone who has access to this specific note.
    
    Shows all users who have been invited to collaborate on this note.
    """
    note_service = NoteService(db)
    
    try:
        collaborators = await note_service.get_note_collaborators(
            note_id=note_id,
            user_id=str(current_user["_id"])
        )
        return {"collaborators": collaborators, "total": len(collaborators)}
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{note_id}/collaborators/{collaborator_id}", response_model=MessageResponse)
async def remove_note_collaborator(
    note_id: str,
    collaborator_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Revoke a specific person's access to the note.
    
    Only note owners or editors can remove collaborators.
    """
    note_service = NoteService(db)
    
    try:
        result = await note_service.remove_note_collaborator(
            note_id=note_id,
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

