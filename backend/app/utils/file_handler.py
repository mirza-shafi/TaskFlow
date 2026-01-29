import os
import uuid
import aiofiles
from pathlib import Path
from typing import Optional, List
from fastapi import UploadFile
from PIL import Image
from io import BytesIO

from app.config import settings
from app.utils.exceptions import ValidationException


class FileHandler:
    """Utility class for handling file uploads."""
    
    @staticmethod
    def validate_file_extension(filename: str, allowed_extensions: Optional[List[str]] = None) -> bool:
        """
        Validate file extension.
        
        Args:
            filename: Name of the file
            allowed_extensions: List of allowed extensions (without dot)
        
        Returns:
            True if valid, False otherwise
        """
        if allowed_extensions is None:
            allowed_extensions = settings.allowed_extensions_list
        
        ext = filename.split('.')[-1].lower() if '.' in filename else ''
        return ext in allowed_extensions
    
    @staticmethod
    def validate_file_size(file_size: int, max_size: Optional[int] = None) -> bool:
        """
        Validate file size.
        
        Args:
            file_size: Size of file in bytes
            max_size: Maximum allowed size in bytes
        
        Returns:
            True if valid, False otherwise
        """
        if max_size is None:
            max_size = settings.max_upload_size
        
        return file_size <= max_size
    
    @staticmethod
    def generate_unique_filename(original_filename: str) -> str:
        """
        Generate a unique filename while preserving extension.
        
        Args:
            original_filename: Original filename
        
        Returns:
            Unique filename
        """
        ext = original_filename.split('.')[-1] if '.' in original_filename else ''
        unique_name = f"{uuid.uuid4().hex}"
        return f"{unique_name}.{ext}" if ext else unique_name
    
    @staticmethod
    async def save_upload_file(
        upload_file: UploadFile,
        destination_path: str,
        max_size: Optional[int] = None
    ) -> str:
        """
        Save uploaded file to disk.
        
        Args:
            upload_file: FastAPI UploadFile object
            destination_path: Path where file should be saved
            max_size: Maximum file size in bytes
        
        Returns:
            Path to saved file
        
        Raises:
            ValidationException: If file validation fails
        """
        # Validate extension
        if not FileHandler.validate_file_extension(upload_file.filename):
            raise ValidationException(
                f"Invalid file type. Allowed types: {', '.join(settings.allowed_extensions_list)}"
            )
        
        # Read file content
        content = await upload_file.read()
        
        # Validate size
        if not FileHandler.validate_file_size(len(content), max_size):
            max_mb = (max_size or settings.max_upload_size) / (1024 * 1024)
            raise ValidationException(f"File too large. Maximum size: {max_mb:.1f}MB")
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(destination_path), exist_ok=True)
        
        # Save file
        async with aiofiles.open(destination_path, 'wb') as f:
            await f.write(content)
        
        return destination_path
    
    @staticmethod
    async def optimize_image(
        file_path: str,
        max_width: int = 800,
        max_height: int = 800,
        quality: int = 85
    ) -> None:
        """
        Optimize image by resizing and compressing.
        
        Args:
            file_path: Path to image file
            max_width: Maximum width in pixels
            max_height: Maximum height in pixels
            quality: JPEG quality (1-100)
        """
        try:
            with Image.open(file_path) as img:
                # Convert RGBA to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                
                # Resize if needed
                img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
                
                # Save optimized image
                img.save(file_path, 'JPEG', quality=quality, optimize=True)
        except Exception as e:
            # If optimization fails, keep original file
            print(f"Warning: Failed to optimize image: {e}")
    
    @staticmethod
    def delete_file(file_path: str) -> bool:
        """
        Delete a file from disk.
        
        Args:
            file_path: Path to file
        
        Returns:
            True if deleted, False otherwise
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False
