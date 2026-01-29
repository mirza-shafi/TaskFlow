from pydantic import BaseModel
from typing import Optional, Any


class SuccessResponse(BaseModel):
    """Standard success response."""
    success: bool = True
    message: str
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    message: str
    detail: Optional[str] = None


class MessageResponse(BaseModel):
    """Simple message response."""
    message: str
