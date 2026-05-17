@echo off
REM TaskFlow Docker Quick Start Script for Windows

echo ================================
echo TaskFlow Docker Setup
echo ================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed.
    echo Please install Docker from https://docs.docker.com/get-docker/
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker Compose is not installed.
    echo Please install Docker Compose from https://docs.docker.com/compose/install/
    exit /b 1
)

echo Docker and Docker Compose are installed
echo.

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file and add your credentials:
    echo    - MONGO_URI
    echo    - JWT_SECRET
    echo    - SMTP_USER
    echo    - SMTP_PASSWORD
    echo.
    pause
) else (
    echo .env file exists
)

echo.
echo Building Docker images...
docker-compose build

echo.
echo Starting services...
docker-compose up -d

echo.
echo Waiting for services to be healthy...
timeout /t 5 /nobreak >nul

echo.
echo TaskFlow is now running!
echo.
echo Access points:
echo    Frontend:  http://localhost:80
echo    Backend:   http://localhost:8000
echo    API Docs:  http://localhost:8000/docs
echo.
echo View logs:
echo    docker-compose logs -f
echo.
echo Stop services:
echo    docker-compose down
echo.
pause
