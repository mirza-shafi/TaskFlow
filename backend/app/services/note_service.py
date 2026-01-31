from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.utils.exceptions import NotFoundException, ValidationException


class NoteService:
    """Service for note operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.notes_collection = db.notes
        self.folders_collection = db.folders
        self.users_collection = db.users
    
    async def get_notes(
        self,
        user_id: str,
        include_deleted: bool = False,
        folder_id: Optional[str] = None,
        tags: Optional[List[str]] = None,
        is_pinned: Optional[bool] = None,
        is_favorite: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all notes for a user (owned or shared with them) with optional filters.
        
        Args:
            user_id: User's ID
            include_deleted: Whether to include soft-deleted notes
            folder_id: Filter by folder ID (optional)
            tags: Filter by tags (optional)
            is_pinned: Filter by pinned status (optional)
            is_favorite: Filter by favorite status (optional)
        
        Returns:
            List of note documents sorted by pinned status and creation date
        """
        query = {
            "$or": [
                {"userId": user_id},  # Notes owned by user
                {"collaborators.userId": user_id}  # Notes shared with user
            ]
        }
        
        if not include_deleted:
            query["isDeleted"] = {"$ne": True}
        
        if folder_id:
            query["folderId"] = folder_id
        
        if tags:
            query["tags"] = {"$in": tags}
        
        if is_pinned is not None:
            query["isPinned"] = is_pinned
        
        if is_favorite is not None:
            query["isFavorite"] = is_favorite
        
        # Sort: pinned notes first, then by creation date (newest first)
        notes = await self.notes_collection.find(query).sort([
            ("isPinned", -1),
            ("createdAt", -1)
        ]).to_list(length=None)
        
        return notes
    
    async def get_favorite_notes(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all favorite/starred notes for a user.
        
        Args:
            user_id: User's ID
        
        Returns:
            List of favorite note documents
        """
        query = {
            "userId": user_id,
            "isFavorite": True,
            "isDeleted": {"$ne": True}
        }
        
        notes = await self.notes_collection.find(query).sort([
            ("isPinned", -1),
            ("createdAt", -1)
        ]).to_list(length=None)
        
        return notes
    
    async def get_note_by_id(self, note_id: str, user_id: str) -> Dict[str, Any]:
        """
        Get a single note by ID with permission check.
        
        Args:
            note_id: Note's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            Note document
        
        Raises:
            NotFoundException: If note not found or user doesn't have access
            ValidationException: If note_id is invalid
        """
        if not ObjectId.is_valid(note_id):
            raise ValidationException("Invalid note ID format")
        
        note = await self.notes_collection.find_one({
            "_id": ObjectId(note_id),
            "$or": [
                {"userId": user_id},  # Owner
                {"collaborators.userId": user_id}  # Collaborator
            ]
        })
        
        if not note:
            raise NotFoundException(f"Note with ID {note_id} not found or you don't have access")
        
        return note
    
    async def create_note(self, user_id: str, note_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new note.
        
        Args:
            user_id: User's ID
            note_data: Note data from request
        
        Returns:
            Created note document
        
        Raises:
            ValidationException: If folder doesn't exist
        """
        # Validate folder if provided (handle empty strings)
        folder_id = note_data.get("folderId")
        if folder_id and folder_id.strip():  # Only validate if not empty
            if not ObjectId.is_valid(folder_id):
                raise ValidationException("Invalid folder ID format")
            
            folder = await self.folders_collection.find_one({
                "_id": ObjectId(folder_id),
                "userId": user_id
            })
            if not folder:
                raise ValidationException(f"Folder with ID {folder_id} not found")
        else:
            # Set to None if empty string or falsy value
            note_data["folderId"] = None
        
        # Prepare note document
        now = datetime.utcnow()
        note_document = {
            "userId": user_id,
            "title": note_data["title"],
            "content": note_data.get("content", ""),
            "folderId": note_data.get("folderId"),
            "tags": note_data.get("tags", []),
            "color": note_data.get("color"),  # Hex color code
            "isPinned": note_data.get("isPinned", False),
            "isFavorite": note_data.get("isFavorite", False),
            "collaborators": [],  # Initialize empty collaborators list
            "isDeleted": False,
            "deletedAt": None,
            "createdAt": now,
            "updatedAt": now
        }
        
        result = await self.notes_collection.insert_one(note_document)
        note_document["_id"] = result.inserted_id
        
        return note_document
    
    async def update_note(
        self,
        note_id: str,
        user_id: str,
        note_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update a note.
        
        Args:
            note_id: Note's ObjectId as string
            user_id: User's ID (for authorization)
            note_data: Updated note data
        
        Returns:
            Updated note document
        
        Raises:
            NotFoundException: If note not found
            ValidationException: If validation fails
        """
        if not ObjectId.is_valid(note_id):
            raise ValidationException("Invalid note ID format")
        
        # Check if note exists and belongs to user
        note = await self.notes_collection.find_one({
            "_id": ObjectId(note_id),
            "userId": user_id
        })
        
        if not note:
            raise NotFoundException(f"Note with ID {note_id} not found")
        
        # Validate folder if being updated (handle empty strings)
        if "folderId" in note_data:
            folder_id = note_data["folderId"]
            if folder_id and folder_id.strip():  # Only validate if not empty
                if not ObjectId.is_valid(folder_id):
                    raise ValidationException("Invalid folder ID format")
                
                folder = await self.folders_collection.find_one({
                    "_id": ObjectId(folder_id),
                    "userId": user_id
                })
                if not folder:
                    raise ValidationException(f"Folder with ID {folder_id} not found")
            else:
                # Set to None if empty string to remove from folder
                note_data["folderId"] = None
        
        # Prepare update data
        update_data = {**note_data, "updatedAt": datetime.utcnow()}
        
        # Update note
        await self.notes_collection.update_one(
            {"_id": ObjectId(note_id)},
            {"$set": update_data}
        )
        
        # Return updated note
        updated_note = await self.notes_collection.find_one({"_id": ObjectId(note_id)})
        return updated_note
    
    async def pin_unpin_note(
        self,
        note_id: str,
        user_id: str,
        is_pinned: bool
    ) -> Dict[str, Any]:
        """
        Pin or unpin a note.
        
        Args:
            note_id: Note's ObjectId as string
            user_id: User's ID (for authorization)
            is_pinned: Whether to pin or unpin
        
        Returns:
            Updated note document
        
        Raises:
            NotFoundException: If note not found
            ValidationException: If note_id is invalid
        """
        if not ObjectId.is_valid(note_id):
            raise ValidationException("Invalid note ID format")
        
        # Check if note exists and belongs to user
        note = await self.notes_collection.find_one({
            "_id": ObjectId(note_id),
            "userId": user_id
        })
        
        if not note:
            raise NotFoundException(f"Note with ID {note_id} not found")
        
        # Update pin status
        await self.notes_collection.update_one(
            {"_id": ObjectId(note_id)},
            {"$set": {"isPinned": is_pinned, "updatedAt": datetime.utcnow()}}
        )
        
        # Return updated note
        updated_note = await self.notes_collection.find_one({"_id": ObjectId(note_id)})
        return updated_note
    
    async def delete_note(self, note_id: str, user_id: str) -> Dict[str, str]:
        """
        Soft delete a note (move to trash).
        
        Args:
            note_id: Note's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            Success message
        
        Raises:
            NotFoundException: If note not found
            ValidationException: If note_id is invalid
        """
        if not ObjectId.is_valid(note_id):
            raise ValidationException("Invalid note ID format")
        
        # Check if note exists and belongs to user
        note = await self.notes_collection.find_one({
            "_id": ObjectId(note_id),
            "userId": user_id
        })
        
        if not note:
            raise NotFoundException(f"Note with ID {note_id} not found")
        
        # Soft delete
        await self.notes_collection.update_one(
            {"_id": ObjectId(note_id)},
            {
                "$set": {
                    "isDeleted": True,
                    "deletedAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        return {"message": "Note moved to trash successfully"}
    
    async def restore_note(self, note_id: str, user_id: str) -> Dict[str, Any]:
        """
        Restore a soft-deleted note.
        
        Args:
            note_id: Note's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            Restored note document
        
        Raises:
            NotFoundException: If note not found
            ValidationException: If note_id is invalid
        """
        if not ObjectId.is_valid(note_id):
            raise ValidationException("Invalid note ID format")
        
        # Check if note exists and belongs to user
        note = await self.notes_collection.find_one({
            "_id": ObjectId(note_id),
            "userId": user_id,
            "isDeleted": True
        })
        
        if not note:
            raise NotFoundException(f"Deleted note with ID {note_id} not found")
        
        # Restore note
        await self.notes_collection.update_one(
            {"_id": ObjectId(note_id)},
            {
                "$set": {
                    "isDeleted": False,
                    "deletedAt": None,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        # Return restored note
        restored_note = await self.notes_collection.find_one({"_id": ObjectId(note_id)})
        return restored_note
    
    async def permanently_delete_note(self, note_id: str, user_id: str) -> Dict[str, str]:
        """
        Permanently delete a note from database.
        
        Args:
            note_id: Note's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            Success message
        
        Raises:
            NotFoundException: If note not found
            ValidationException: If note_id is invalid
        """
        if not ObjectId.is_valid(note_id):
            raise ValidationException("Invalid note ID format")
        
        # Check if note exists and belongs to user
        note = await self.notes_collection.find_one({
            "_id": ObjectId(note_id),
            "userId": user_id
        })
        
        if not note:
            raise NotFoundException(f"Note with ID {note_id} not found")
        
        # Permanently delete
        await self.notes_collection.delete_one({"_id": ObjectId(note_id)})
        
        return {"message": "Note permanently deleted"}
    
    async def get_trashed_notes(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all soft-deleted notes for a user.
        
        Args:
            user_id: User's ID
        
        Returns:
            List of trashed note documents
        """
        notes = await self.notes_collection.find({
            "userId": user_id,
            "isDeleted": True
        }).sort("deletedAt", -1).to_list(length=None)
        
        return notes
    
    async def _has_note_permission(
        self,
        note: Dict[str, Any],
        user_id: str,
        required_role: Optional[str] = None
    ) -> bool:
        """
        Check if user has permission to access a note.
        
        Args:
            note: Note document
            user_id: User's ID
            required_role: Required role (viewer, editor) or None for any access
        
        Returns:
            True if user has permission, False otherwise
        """
        # Owner has all permissions
        if note["userId"] == user_id:
            return True
        
        # Check if user is a collaborator
        collaborators = note.get("collaborators", [])
        for collab in collaborators:
            if collab["userId"] == user_id:
                if required_role is None:
                    return True
                # Check role: editor > viewer
                if required_role == "viewer":
                    return True
                elif required_role == "editor" and collab["role"] == "editor":
                    return True
        
        return False
    
    async def invite_note_collaborator(
        self,
        note_id: str,
        owner_id: str,
        email: str,
        role: str = "editor"
    ) -> Dict[str, Any]:
        """
        Invite a user by email to collaborate on a note.
        
        Args:
            note_id: Note's ObjectId as string
            owner_id: Owner's ID (for authorization)
            email: Email of user to invite
            role: Role to assign (viewer or editor, default: "editor")
        
        Returns:
            Updated note document
        
        Raises:
            NotFoundException: If note or user not found
            ValidationException: If user lacks permission or already invited
        """
        if not ObjectId.is_valid(note_id):
            raise ValidationException("Invalid note ID format")
        
        # Get note and check ownership
        note = await self.notes_collection.find_one({"_id": ObjectId(note_id)})
        
        if not note:
            raise NotFoundException("Note not found")
        
        # Check if requester has permission (owner or editor)
        if note["userId"] != owner_id:
            has_permission = await self._has_note_permission(note, owner_id, "editor")
            if not has_permission:
                raise ValidationException("Only note owner or editors can invite collaborators")
        
        # Find user by email
        invited_user = await self.users_collection.find_one({"email": email})
        if not invited_user:
            raise NotFoundException(f"User with email {email} not found")
        
        invited_user_id = str(invited_user["_id"])
        
        # Check if user is the owner
        if note["userId"] == invited_user_id:
            raise ValidationException("Cannot invite the note owner as a collaborator")
        
        # Check if already a collaborator
        collaborators = note.get("collaborators", [])
        if any(c["userId"] == invited_user_id for c in collaborators):
            raise ValidationException("User is already a collaborator on this note")
        
        # Add collaborator
        new_collaborator = {
            "userId": invited_user_id,
            "role": role,
            "addedAt": datetime.utcnow()
        }
        
        await self.notes_collection.update_one(
            {"_id": ObjectId(note_id)},
            {
                "$push": {"collaborators": new_collaborator},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )
        
        # Return updated note
        updated_note = await self.notes_collection.find_one({"_id": ObjectId(note_id)})
        return updated_note
    
    async def get_note_collaborators(
        self,
        note_id: str,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """
        Get all collaborators for a note.
        
        Args:
            note_id: Note's ObjectId as string
            user_id: User's ID (for authorization)
        
        Returns:
            List of collaborators with user details
        
        Raises:
            NotFoundException: If note not found
            ValidationException: If user doesn't have access
        """
        if not ObjectId.is_valid(note_id):
            raise ValidationException("Invalid note ID format")
        
        # Get note and check permission
        note = await self.notes_collection.find_one({"_id": ObjectId(note_id)})
        
        if not note:
            raise NotFoundException("Note not found")
        
        # Check if user has permission to view
        has_permission = await self._has_note_permission(note, user_id)
        if not has_permission:
            raise ValidationException("You don't have permission to view this note's collaborators")
        
        # Get collaborator details
        collaborators_list = []
        for collab in note.get("collaborators", []):
            user = await self.users_collection.find_one({"_id": ObjectId(collab["userId"])})
            if user:
                collaborators_list.append({
                    "userId": str(user["_id"]),
                    "email": user.get("email", ""),
                    "name": user.get("name", "Unknown"),
                    "role": collab["role"],
                    "addedAt": collab.get("addedAt", note.get("createdAt"))
                })
        
        return collaborators_list
    
    async def remove_note_collaborator(
        self,
        note_id: str,
        owner_id: str,
        collaborator_id: str
    ) -> Dict[str, str]:
        """
        Remove a collaborator from a note.
        
        Args:
            note_id: Note's ObjectId as string
            owner_id: Owner's ID (for authorization)
            collaborator_id: Collaborator's user ID to remove
        
        Returns:
            Success message
        
        Raises:
            NotFoundException: If note or collaborator not found
            ValidationException: If user lacks permission
        """
        if not ObjectId.is_valid(note_id):
            raise ValidationException("Invalid note ID format")
        
        # Get note and check ownership
        note = await self.notes_collection.find_one({"_id": ObjectId(note_id)})
        
        if not note:
            raise NotFoundException("Note not found")
        
        # Check if requester has permission (owner or editor)
        if note["userId"] != owner_id:
            has_permission = await self._has_note_permission(note, owner_id, "editor")
            if not has_permission:
                raise ValidationException("Only note owner or editors can remove collaborators")
        
        # Check if collaborator exists
        collaborators = note.get("collaborators", [])
        if not any(c["userId"] == collaborator_id for c in collaborators):
            raise NotFoundException("Collaborator not found on this note")
        
        # Remove collaborator
        await self.notes_collection.update_one(
            {"_id": ObjectId(note_id)},
            {
                "$pull": {"collaborators": {"userId": collaborator_id}},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )
        
        return {"message": "Collaborator removed successfully"}

