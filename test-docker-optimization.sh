#!/bin/bash

# Test Docker image sizes and optimization

echo "🧪 Testing Docker Image Optimizations"
echo "====================================="
echo ""

# Check if images exist
echo "Checking for existing images..."
BACKEND_EXISTS=$(docker images -q taskflow-backend:latest 2>/dev/null)
FRONTEND_EXISTS=$(docker images -q taskflow-frontend:latest 2>/dev/null)

if [ -z "$BACKEND_EXISTS" ] || [ -z "$FRONTEND_EXISTS" ]; then
    echo "⚠️  Images not found. Building..."
    ./build-optimized.sh
    echo ""
fi

# Display image information
echo "📊 Image Analysis"
echo "=================="
echo ""

docker images | grep -E "REPOSITORY|taskflow"

echo ""
echo "📈 Detailed Image Info:"
echo ""

# Backend details
echo "Backend Image:"
docker inspect taskflow-backend:latest --format='  Size: {{.Size}} bytes ({{div .Size 1048576}} MB)' 2>/dev/null || echo "  Not built yet"
docker inspect taskflow-backend:latest --format='  Layers: {{len .RootFS.Layers}}' 2>/dev/null
docker inspect taskflow-backend:latest --format='  Created: {{.Created}}' 2>/dev/null
echo ""

# Frontend details
echo "Frontend Image:"
docker inspect taskflow-frontend:latest --format='  Size: {{.Size}} bytes ({{div .Size 1048576}} MB)' 2>/dev/null || echo "  Not built yet"
docker inspect taskflow-frontend:latest --format='  Layers: {{len .RootFS.Layers}}' 2>/dev/null
docker inspect taskflow-frontend:latest --format='  Created: {{.Created}}' 2>/dev/null
echo ""

# Security check
echo "🔒 Security Check"
echo "================="
echo ""

echo "Backend user:"
docker run --rm taskflow-backend:latest whoami 2>/dev/null || echo "  Image not available"
echo ""

echo "Frontend user:"
docker run --rm taskflow-frontend:latest whoami 2>/dev/null || echo "  Image not available"
echo ""

# Test containers
echo "🧪 Quick Health Check"
echo "====================="
echo ""

# Start containers
echo "Starting containers for health check..."
docker-compose up -d > /dev/null 2>&1

sleep 10

# Check health
echo "Backend health:"
curl -s http://localhost:8000/health || echo "  ❌ Backend not responding"
echo ""

echo "Frontend health:"
curl -s http://localhost:80/health || echo "  ❌ Frontend not responding"  
echo ""

# Cleanup
echo "Stopping test containers..."
docker-compose down > /dev/null 2>&1

echo ""
echo "✅ Test complete!"
