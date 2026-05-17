#!/bin/bash

# Docker Image Build and Optimization Script

set -e

echo "🐳 Docker Image Optimization Build"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to get image size
get_image_size() {
    docker images "$1" --format "{{.Size}}" | head -1
}

echo -e "${BLUE}Building optimized images...${NC}"
echo ""

# Build backend
echo "📦 Building backend (Python Alpine)..."
docker build -t taskflow-backend:latest ./backend
BACKEND_SIZE=$(get_image_size "taskflow-backend:latest")
echo -e "${GREEN}✓ Backend built: ${BACKEND_SIZE}${NC}"
echo ""

# Build frontend
echo "📦 Building frontend (Node Alpine + Nginx)..."
docker build -t taskflow-frontend:latest ./client
FRONTEND_SIZE=$(get_image_size "taskflow-frontend:latest")
echo -e "${GREEN}✓ Frontend built: ${FRONTEND_SIZE}${NC}"
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}Build Complete!${NC}"
echo "======================================"
echo ""
echo "Image Sizes:"
echo "  Backend:  ${BACKEND_SIZE}"
echo "  Frontend: ${FRONTEND_SIZE}"
echo ""
echo "Optimizations Applied:"
echo "  ✓ Multi-stage builds"
echo "  ✓ Alpine Linux base images"
echo "  ✓ Removed build dependencies"
echo "  ✓ Non-root users"
echo "  ✓ Production-only dependencies"
echo "  ✓ Removed source maps"
echo "  ✓ Optimized layer caching"
echo ""
echo "To run the containers:"
echo "  docker-compose up -d"
echo ""
echo "To check running containers:"
echo "  docker ps"
echo ""
