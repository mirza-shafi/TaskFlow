"""
Gravatar service for generating profile photo URLs from email addresses.

Gravatar (Globally Recognized Avatar) is a service that provides profile images
based on email addresses. If a user has a Gravatar account, their photo will be
displayed. Otherwise, a default avatar is shown.
"""

import hashlib
from typing import Optional


class GravatarService:
    """Service for generating Gravatar URLs."""
    
    GRAVATAR_BASE_URL = "https://www.gravatar.com/avatar/"
    DEFAULT_SIZE = 200
    DEFAULT_RATING = "pg"  # pg, g, r, x
    DEFAULT_TYPE = "identicon"  # identicon, monsterid, wavatar, retro, robohash
    
    @staticmethod
    def get_gravatar_url(
        email: str,
        size: int = DEFAULT_SIZE,
        default: str = DEFAULT_TYPE,
        rating: str = DEFAULT_RATING
    ) -> str:
        """
        Generate Gravatar URL from email address.
        
        Args:
            email: User's email address
            size: Image size in pixels (1-2048)
            default: Default image type if no Gravatar exists
            rating: Maximum rating (g, pg, r, x)
            
        Returns:
            Gravatar URL
            
        Example:
            >>> GravatarService.get_gravatar_url("user@example.com")
            'https://www.gravatar.com/avatar/b58996c504c5638798eb6b511e6f49af?s=200&d=identicon&r=pg'
        """
        # Normalize email: lowercase and strip whitespace
        email_normalized = email.lower().strip()
        
        # Generate MD5 hash of email
        email_hash = hashlib.md5(email_normalized.encode('utf-8')).hexdigest()
        
        # Build URL with parameters
        url = f"{GravatarService.GRAVATAR_BASE_URL}{email_hash}"
        params = f"?s={size}&d={default}&r={rating}"
        
        return url + params
    
    @staticmethod
    def get_profile_photo_url(email: str, size: Optional[int] = None) -> str:
        """
        Get profile photo URL for a user.
        
        This is a convenience method that uses sensible defaults.
        
        Args:
            email: User's email address
            size: Optional custom size
            
        Returns:
            Profile photo URL
        """
        return GravatarService.get_gravatar_url(
            email=email,
            size=size or GravatarService.DEFAULT_SIZE,
            default=GravatarService.DEFAULT_TYPE,
            rating=GravatarService.DEFAULT_RATING
        )
