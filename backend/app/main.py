from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.config import settings
from app.database import Database
from app.api.v1 import auth, users, tasks, folders, teams, notes, habits, analytics, notifications
from app.utils.exceptions import AppException


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    await Database.connect_db()
    
    # Ensure upload directories exist
    os.makedirs(os.path.join(settings.upload_dir, "avatars"), exist_ok=True)
    
    yield
    
    # Shutdown
    await Database.close_db()


# Create FastAPI application
app = FastAPI(
    title="TaskFlow API",
    description="""
    ## TaskFlow - Professional Task Management API
    
    A comprehensive RESTful API for task management built with FastAPI and MongoDB.
    
    ### Features
    - 🔐 **JWT Authentication** - Secure user authentication and authorization
    - 📝 **Task Management** - Full CRUD operations with soft delete support
    - 📁 **Folders** - Organize tasks into folders
    - 👥 **Teams** - Collaborative team management
    - 👤 **User Profiles** - Profile management with avatar uploads
    - 🗑️ **Trash Management** - Restore or permanently delete tasks
    - 🔒 **Password Management** - Secure password change functionality
    - 🚀 **High Performance** - Async operations with Motor (async MongoDB driver)
    - 📚 **Auto Documentation** - Interactive API documentation with Swagger UI
    
    ### Authentication
    Most endpoints require authentication via Bearer token in the Authorization header:
    ```
    Authorization: Bearer <your_jwt_token>
    ```
    
    Get your token by registering or logging in via the `/api/v1/auth` endpoints.
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
if os.path.exists(settings.upload_dir):
    app.mount(f"/{settings.upload_dir}", StaticFiles(directory=settings.upload_dir), name="uploads")

# Global exception handler for custom exceptions
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handle custom application exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.message}
    )

# Include API routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")
app.include_router(folders.router, prefix="/api/v1")
app.include_router(teams.router, prefix="/api/v1")
app.include_router(notes.router, prefix="/api/v1")
app.include_router(habits.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API status check."""
    return {
        "message": "TaskFlow API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "healthy"
    }

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "environment": settings.environment
    }

# Detailed health check
@app.get("/health/detailed", tags=["Health"])
async def detailed_health_check():
    """Detailed health check with database connectivity."""
    db_status = "unknown"
    
    try:
        # Test database connection
        db = Database.get_db()
        await db.command('ping')
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "environment": settings.environment,
        "database": db_status,
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.environment == "development"
    )
