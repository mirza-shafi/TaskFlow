"""Custom exception classes for the application."""


class AppException(Exception):
    """Base exception class for application errors."""
    
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(AppException):
    """Exception raised when a resource is not found."""
    
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class UnauthorizedException(AppException):
    """Exception raised when authentication fails."""
    
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=401)


class ForbiddenException(AppException):
    """Exception raised when access is forbidden."""
    
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, status_code=403)


class ValidationException(AppException):
    """Exception raised when validation fails."""
    
    def __init__(self, message: str = "Validation error"):
        super().__init__(message, status_code=400)


class DuplicateException(AppException):
    """Exception raised when a duplicate resource is created."""
    
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, status_code=409)


class BadRequestException(AppException):
    """Exception raised for bad requests."""
    
    def __init__(self, message: str = "Bad request"):
        super().__init__(message, status_code=400)
