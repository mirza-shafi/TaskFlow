# TaskFlow FastAPI Backend

A modern, production-ready REST API built with FastAPI and MongoDB for the TaskFlow task management application.

## Features

- ✅ **FastAPI Framework** - High-performance async Python web framework
- ✅ **MongoDB with Motor** - Async MongoDB driver for optimal performance
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Pydantic Validation** - Automatic request/response validation
- ✅ **Swagger Documentation** - Interactive API documentation at `/docs`
- ✅ **Industry-Level Architecture** - Clean separation of concerns (routes, services, models)
- ✅ **File Upload Support** - Avatar upload with image optimization
- ✅ **Soft Delete** - Tasks can be moved to trash and restored
- ✅ **Password Management** - Secure password change functionality
- ✅ **Account Deletion** - Complete user data removal
- ✅ **CORS Support** - Configured for frontend integration

## Tech Stack

- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation using Python type annotations
- **python-jose** - JWT token handling
- **passlib** - Password hashing with bcrypt
- **Pillow** - Image processing and optimization
- **Uvicorn** - ASGI server

## Project Structure

```
backend-fastapi/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py          # Authentication endpoints
│   │       ├── users.py         # User profile endpoints
│   │       ├── tasks.py         # Task management endpoints
│   │       ├── folders.py       # Folder endpoints
│   │       └── teams.py         # Team endpoints
│   ├── core/
│   │   ├── security.py          # Password hashing, JWT
│   │   └── dependencies.py      # Auth dependencies
│   ├── models/                  # (Reserved for future use)
│   ├── schemas/
│   │   ├── user.py             # User Pydantic schemas
│   │   ├── task.py             # Task Pydantic schemas
│   │   ├── folder.py           # Folder Pydantic schemas
│   │   ├── team.py             # Team Pydantic schemas
│   │   └── common.py           # Common response schemas
│   ├── services/
│   │   ├── auth_service.py     # Authentication business logic
│   │   ├── user_service.py     # User business logic
│   │   ├── task_service.py     # Task business logic
│   │   ├── folder_service.py   # Folder business logic
│   │   └── team_service.py     # Team business logic
│   ├── utils/
│   │   ├── exceptions.py       # Custom exception classes
│   │   └── file_handler.py     # File upload utilities
│   ├── config.py               # Application configuration
│   ├── database.py             # MongoDB connection
│   └── main.py                 # FastAPI application
├── uploads/                    # File uploads directory
├── .env                        # Environment variables
├── .env.example               # Environment template
├── requirements.txt           # Python dependencies
└── README_FASTAPI.md         # This file
```

## Setup Instructions

### Prerequisites

- Python 3.9 or higher
- MongoDB Atlas account (or local MongoDB)
- pip (Python package manager)

### Installation

1. **Navigate to the FastAPI backend directory:**
   ```bash
   cd backend-fastapi
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration:
     ```env
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key_here
     CORS_ORIGINS=http://localhost:3000,https://your-frontend-url.com
     ```

### Running the Application

#### Development Mode

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

#### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once the server is running, visit http://localhost:8000/docs for interactive API documentation powered by Swagger UI.

### Main Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

#### Users
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update profile
- `POST /api/v1/users/upload-avatar` - Upload avatar image
- `PUT /api/v1/users/change-password` - Change password
- `DELETE /api/v1/users/profile` - Delete account

#### Tasks
- `GET /api/v1/tasks` - Get all tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/{id}` - Get single task
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Soft delete task
- `GET /api/v1/tasks/trash/all` - Get trashed tasks
- `POST /api/v1/tasks/{id}/restore` - Restore task
- `DELETE /api/v1/tasks/{id}/permanent` - Permanently delete

#### Folders
- `GET /api/v1/folders` - Get all folders
- `POST /api/v1/folders` - Create folder
- `PUT /api/v1/folders/{id}` - Update folder
- `DELETE /api/v1/folders/{id}` - Delete folder

#### Teams
- `GET /api/v1/teams` - Get all teams
- `POST /api/v1/teams` - Create team
- `PUT /api/v1/teams/{id}` - Update team
- `DELETE /api/v1/teams/{id}` - Delete team

## Testing with Swagger

1. Start the server
2. Open http://localhost:8000/docs
3. Register a new user via `/api/v1/auth/register`
4. Copy the JWT token from the response
5. Click "Authorize" button at the top
6. Enter: `Bearer <your_token>`
7. Now you can test all protected endpoints!

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 8000 |
| `ENVIRONMENT` | Environment (development/production) | development |
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_ALGORITHM` | JWT algorithm | HS256 |
| `JWT_EXPIRATION_MINUTES` | Token expiration time | 43200 (30 days) |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | http://localhost:3000 |
| `UPLOAD_DIR` | Upload directory path | uploads |
| `MAX_UPLOAD_SIZE` | Max file size in bytes | 5242880 (5MB) |
| `ALLOWED_EXTENSIONS` | Allowed file extensions | jpg,jpeg,png,gif,webp |

## Deployment

### Using Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - **Root Directory**: `backend-fastapi`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables in Render dashboard
5. Deploy!

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Development

### Code Style

The project follows Python best practices:
- Type hints for better IDE support
- Async/await for all I/O operations
- Service layer pattern for business logic
- Pydantic models for validation
- Custom exceptions for error handling

### Adding New Endpoints

1. Create schema in `app/schemas/`
2. Add business logic in `app/services/`
3. Create route handler in `app/api/v1/`
4. Register router in `app/main.py`

## Troubleshooting

### Database Connection Issues
- Verify MongoDB URI is correct
- Check network connectivity
- Ensure IP whitelist in MongoDB Atlas

### Import Errors
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### CORS Errors
- Update `CORS_ORIGINS` in `.env`
- Restart the server after changes

## License

This project is part of the TaskFlow application.
