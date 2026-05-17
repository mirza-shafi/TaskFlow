@echo off
REM Docker Image Build and Optimization Script for Windows

echo ====================================
echo Docker Image Optimization Build
echo ====================================
echo.

echo Building optimized images...
echo.

REM Build backend
echo Building backend (Python Alpine)...
docker build -t taskflow-backend:latest ./backend
if errorlevel 1 (
    echo Error building backend image
    exit /b 1
)
echo Backend built successfully
echo.

REM Build frontend
echo Building frontend (Node Alpine + Nginx)...
docker build -t taskflow-frontend:latest ./client
if errorlevel 1 (
    echo Error building frontend image
    exit /b 1
)
echo Frontend built successfully
echo.

REM Summary
echo ======================================
echo Build Complete!
echo ======================================
echo.
echo Optimizations Applied:
echo   - Multi-stage builds
echo   - Alpine Linux base images
echo   - Removed build dependencies
echo   - Non-root users
echo   - Production-only dependencies
echo   - Removed source maps
echo   - Optimized layer caching
echo.
echo To run the containers:
echo   docker-compose up -d
echo.
echo To check running containers:
echo   docker ps
echo.
pause
