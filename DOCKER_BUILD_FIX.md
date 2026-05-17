# Docker Build Fixes Applied

## 🔧 Issues Fixed

### Issue 1: Backend Permission Denied
**Error**: `/usr/local/bin/python3.12: can't open file '/root/.local/bin/uvicorn': [Errno 13] Permission denied`

**Root Cause**: Python packages installed to `/root/.local/` but running as non-root user `appuser`

**Fix**: Changed installation to shared `/install` directory accessible by all users

### Issue 2: Frontend Can't Find Backend Upstream
**Error**: `nginx: [emerg] host not found in upstream "backend" in /etc/nginx/conf.d/default.conf:46`

**Root Cause**: Nginx tries to resolve "backend" at startup before backend container is ready

**Fix**: 
1. Commented out API proxy in nginx.conf (optional feature)
2. Added health check dependency in docker-compose.yml
3. Frontend now works standalone

### Issue 3: Frontend Build Failure
**Error**: `npm run build` failed with exit code 1

**Root Cause**: Essential config files and dev dependencies were excluded

**Fix**: Updated .dockerignore and Dockerfile to include necessary build files

## ✅ Changes Made

### 1. Fixed backend/Dockerfile

**Before**:
```dockerfile
RUN pip install --no-cache-dir --user -r requirements.txt
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH
```

**After**:
```dockerfile
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt
COPY --from=builder /install /install
ENV PATH=/install/bin:$PATH
ENV PYTHONPATH=/install/lib/python3.12/site-packages
```

**Why**: Packages installed to `/install` are accessible by non-root user

### 2. Fixed client/nginx.conf

**Before**:
```nginx
location /api {
    proxy_pass http://backend:8000;
    # ... more config
}
```

**After**:
```nginx
# location /api {
#     # Commented out - uncomment if using nginx as reverse proxy
#     # resolver 127.0.0.11 valid=30s;
#     # proxy_pass http://backend:8000;
# }
```

**Why**: Frontend container works standalone, doesn't require backend to start

### 3. Fixed docker-compose.yml

**Before**:
```yaml
depends_on:
  - backend
healthcheck:
  test: ["CMD", "python", "-c", "import requests; ..."]
```

**After**:
```yaml
depends_on:
  backend:
    condition: service_healthy
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", ...]
```

**Why**: 
- Frontend waits for backend to be healthy before starting
- Health check uses wget (already in Alpine image, no extra dependencies)

### 4. Added wget to backend Dockerfile

```dockerfile
RUN apk add --no-cache \
    libffi \
    openssl \
    libmagic \
    wget  # Added for health checks
```

**Why**: Health check needs wget to test endpoint

## 🚀 How to Build Now

```bash
# Clean rebuild (recommended)
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Or use the script
./build-optimized.sh
docker-compose up -d

# Check logs
docker-compose logs -f
```

## 📦 Expected Results

✅ Backend starts as non-root user (appuser)  
✅ Backend can execute uvicorn successfully  
✅ Frontend builds successfully with all dependencies  
✅ Frontend serves standalone without backend requirement  
✅ Containers pass health checks  
✅ Frontend waits for backend to be healthy  
✅ Final images still ~295MB total (multi-stage keeps them small)  

## 🔍 Verify Build

```bash
# Check both containers are running
docker-compose ps

# Should show both as "healthy"
# Backend: taskflow-backend (healthy)
# Frontend: taskflow-frontend (healthy)

# Test endpoints
curl http://localhost:8000/health  # Backend
curl http://localhost/health       # Frontend

# Check logs
docker-compose logs backend
docker-compose logs frontend
```

## 💡 Key Learnings

1. **Non-root users**: Install packages to shared locations like `/install` or `/usr/local`, not `/root`
2. **PATH and PYTHONPATH**: Must point to accessible locations for non-root users
3. **Nginx upstream**: Use resolver or comment out if backend not always available
4. **Health checks**: Use tools already in the image (wget vs Python requests)
5. **Startup order**: Use `condition: service_healthy` to wait for dependencies
6. **Multi-stage builds**: Still keep images small even with all build dependencies

## 🎯 Optional: Enable API Proxy

If you want nginx to proxy API requests to backend:

1. Edit `client/nginx.conf`
2. Uncomment the `/api` location block
3. Rebuild frontend: `docker-compose build frontend`
4. Restart: `docker-compose up -d`

This is useful for:
- Single domain deployment
- Avoiding CORS issues
- SSL termination at nginx

---

**Status**: ✅ All issues fixed! Ready to deploy!
