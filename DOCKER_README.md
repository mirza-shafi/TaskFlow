# Docker Deployment Guide - TaskFlow

This guide explains how to run TaskFlow using Docker and Docker Compose with **optimized, production-ready images**.

## 🎯 Image Optimization Features

Our Docker images are highly optimized for production use:

### Backend Optimizations
- ✅ **Multi-stage build** - Separate build and runtime stages
- ✅ **Alpine Linux base** - ~3x smaller than Debian-based images
- ✅ **No build dependencies in final image** - Only runtime libs included
- ✅ **Non-root user** - Enhanced security with dedicated appuser
- ✅ **Layer caching** - Optimized build times with dependency caching
- ✅ **Minimal attack surface** - Only essential packages installed

### Frontend Optimizations
- ✅ **Multi-stage build** - Build with Node, serve with Nginx
- ✅ **Production dependencies only** - No dev packages in final image
- ✅ **Source maps removed** - Smaller bundle size
- ✅ **Nginx Alpine** - Minimal web server footprint
- ✅ **Non-root user** - Nginx runs as unprivileged user
- ✅ **Optimized compression** - Gzip with proper configuration
- ✅ **Static asset caching** - 1-year cache for immutable assets

### Expected Image Sizes
| Image | Approximate Size | Notes |
|-------|-----------------|-------|
| Backend (Python Alpine) | ~200-300 MB | vs ~800MB with Debian slim |
| Frontend (Nginx Alpine) | ~30-50 MB | vs ~150MB with standard Nginx |
| **Total** | **~250-350 MB** | **vs ~1GB+ unoptimized** |

## 📋 Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- MongoDB Atlas account (or local MongoDB instance)

## 🚀 Quick Start

### Option 1: Quick Start Script (Recommended)

**Linux/Mac:**
```bash
./start-docker.sh
```

**Windows:**
```cmd
start-docker.bat
```

### Option 2: Manual Setup

#### 1. Setup Environment Variables

Copy the example environment file:

```bash
cp # 2. Build Optimized Images

**Option A: Using build script**
```bash
./build-optimized.sh
```

**Option B: Using docker-compose**
```bash
docker-compose build
```

#### 3nv.example .env
```

Edit `.env` and add your credentials:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-change-this
SMTP� Image Size Comparison

To check your actual built image sizes:

```bash
docker images | grep taskflow
```

Example output:
```
taskflow-backend   latest    abc123    250MB
taskflow-frontend  latest    def456    45MB
```

## 📦 What's Different in Optimized Images?

### Backend (Before vs After)

| Aspect | Before (Debian Slim) | After (Alpine) |
|--------|---------------------|----------------|
| Base Image | python:3.12-slim (~800MB) | python:3.12-alpine (~200MB) |
| Build deps | Included in final image | Removed after build |
| User | root | Non-root (appuser) |
| Health check | Uses requests library | Uses wget (built-in) |
| Workers | Single process | Configurable |

### Frontend (Before vs After)

| Aspect | Before | After |
|--------|--------|-------|
| Port | 80 (privileged) | 8080 (non-privileged) |
| User | root | Non-root (nginx-user) |
| Source maps | Included | Removed |
| Dependencies | All node_modules copied | Only production build |
| Compression | Basic gzip | Optimized gzip with types |
| Cache headers | Basic | Aggressive for static assets |

## �_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:80
VITE_API_URL=http://localhost:8000
```

### 2. Run with Docker Compose

**Production Mode** (optimized builds):

```bash
docker-compose up -d
```

**Development Mode** (with hot reload):

```bash
docker-compose -f docker-compose.dev.yml up
```
with optimization script
./build-optimized.sh

# Or rebuild and restart with compose
docker-compose up -d --build

# Force rebuild without cache (slower but ensures clean build)
docker-compose build --no-cache
docker-compose up -d
```

## 🔒 Security Features

### Container Security

1. **Non-root users**: Both containers run as unprivileged users
   - Backend: `appuser` (UID 1001)
   - Frontend: `nginx-user` (UID 1001)

2. **Minimal attack surface**: Alpine Linux with only essential packages

3. **Read-only filesystem** (optional): Add to docker-compose.yml
  # Production Security Checklist

- [ ] Use strong, unique JWT_SECRET (min 32 characters)
- [ ] Never expose .env file or commit it to git
- [ ] Use environment-specific configurations
- [ ] Enable HTTPS with reverse proxy (Nginx/Caddy)
- **Base image**: Python 3.12 Alpine (multi-stage)
- **Stage 1**: Build dependencies with gcc, musl-dev
- **Stage 2**: Runtime with only essential libs
- **User**: Non-root appuser (UID 1001)
- **Exposes**: Port 8000
- **Health check**: wget-based (no extra dependencies)
- **Size**: ~200-300 MB

**Build manually**:

```bash
cd backend
docker build -t taskflow-backend .
docker run -p 8000:8000 --env-file .env taskflow-backend
```

**Development version** (`Dockerfile.dev`):
- Includes hot reload support
- More build tools for dev dependencies
- Used in docker-compose.dev.yml

### Frontend (React + Nginx)

Located at `client/Dockerfile`:

- **Base image**: Multi-stage (Node 18 Alpine + Nginx Alpine)
- **Stage 1**: Node for building (npm ci, vite build)
- **Stage 2**: Nginx Alpine for serving static files
- **User**: Non-root nginx-user (UID 1001)
- **Exposes**: Port 8080 (non-privileged)
- **Features**: 
  - Optimized gzip compression
  - Aggressive caching for assets
  - SPA routing support
  - API proxy configuration
- **Size**: ~30-50 MB

**Build manually**:

```bash
cd client
docker build -t taskflow-frontend .
docker run -p 80:8080 taskflow-frontend
```

## ⚡ Performance Optimizations

### Build Time Optimization

1. **Layer caching**: Dependencies installed before code copy
   ```dockerfile
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .  # This layer changes frequently
   ```

2. **Multi-stage builds**: Build artifacts separate from runtime

3. **`.dockerignore` files**: Exclude unnecessary files
   - node_modules
   - .git
   - test files
   - documentation

### Runtime Optimization

1. **Frontend**:
   - Gzip compression enabled (6 compression level)
   - Static assets cached for 1 year
   - Access logs disabled for static files
   - Only production build included

2. **Backend**:
   - Uvicorn with configurable workers
   - Python bytecode generation disabled (PYTHONDONTWRITEBYTECODE)
   - Unbuffered output (PYTHONUNBUFFERED)
   - Only production dependencies

### Start Services

```bash
# Start in detached mode
docker-compose up -d

# Start with logs
docker-compose up

# Start specific service
docker-compose up backend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### View Logs

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild After Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Force rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

## 🐳 Individual Service Dockerfiles

### Backend (FastAPI)

Located at `backend/Dockerfile`:

- Base image: Python 3.12-slim
- Exposes port 8000
- Includes health checks
- Production-ready with uvicorn

**Build manually**:

```bash
cd backend
docker build -t taskflow-backend .
docker run -p 8000:8000 --env-file .env taskflow-backend
```

### Frontend (React + Nginx)

Located at `client/Dockerfile`:

- Multi-stage build
- Stage 1: Node 18 for building
- Stage 2: Nginx Alpine for serving
- Exposes port 80
- Includes custom nginx configuration

**Build manually**:

```bash
cd client
docker build -t taskflow-frontend .
docker run -p 80:80 taskflow-frontend
```

## 🔧 Configuration Files

### docker-compose.yml
- Production setup with optimized builds
- Backend + Frontend with networking
- Health checks enabled
- Volume persistence for uploads

### docker-compose.dev.yml
- Development setup with hot reload
- Source code mounted as volumes
- Vite dev server for frontend
- Uvicorn with --reload for backend

### nginx.conf (client/)
- SPA routing configuration
- Static asset caching
- Security headers
- API proxy configuration
- Health check endpoint

## 🌐 Environment Variables

### Backend Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `SMTP_USER` | Email address for SMTP | Required |
| `SMTP_PASSWORD` | App password for email | Required |
| `SMTP_SERVER` | SMTP server address | smtp.gmail.com |
| `SMTP_PORT` | SMTP server port | 587 |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

### Frontend Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:8000 |

## 📊 Health Checks

Both services include health check endpoints:

- **Backend**: `http://localhost:8000/health`
- **Frontend**: `http://localhost/health`

Check status:

```bash
docker ps
# Look at the STATUS column for health status
```

## 🔒 Security Notes

1. **Never commit .env file** - Add it to .gitignore
2. **Use strong JWT_SECRET** - Generate a secure random string
3. **Use environment-specific configs** - Different .env for dev/staging/prod
4. **Update dependencies** - Regularly update Docker base images

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Invalid MONGO_URI
# - Missing environment variables
# - Port 8000 already in use
```

### Frontend won't build

```bash
# Check logs
docker-compose logs frontend

# Common issues:
# - Node modules installation failed
# - Build errors in code
# - Port 80 already in use (use sudo or change port)
```

### Database connection issues

```bash
# Verify MongoDB URI is correct
# Check if IP whitelist includes Docker container IPs
# For MongoDB Atlas: Add 0.0.0.0/0 or specific container IP
```

### Port conflicts

```bash
# Change ports in docker-compose.yml
ports:
  - "3000:80"    # Use port 3000 instead of 80
  - "8080:8000"  # Use port 8080 instead of 8000
```

## 🚀 Production Deployment

### Using Docker on VPS/Cloud

1. **Copy files to server**:
   ```bash
   scp -r TaskFlow/ user@server:/var/www/
   ```

2. **SSH into server**:
   ```bash
   ssh user@server
   cd /var/www/TaskFlow
   ```

3. **Setup environment**:
   ```bash
   nano .env
   # Add production values
   ```

4. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

5. **Setup reverse proxy** (optional - use Nginx or Caddy on host):
   ```nginx
   # /etc/nginx/sites-available/taskflow
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:80;
       }
       
       location /api {
           proxy_pass http://localhost:8000;
       }
   }
   ```

### Using Docker Swarm/Kubernetes

For orchestration at scale, convert docker-compose.yml to:
- Docker Swarm stack file
- Kubernetes deployment manifests

## 📝 Notes

- Backend uploads are persisted in `./backend/uploads` volume
- Frontend is served as static files through Nginx
- Both services communicate via `taskflow-network` bridge network
- Health checks ensure services are running properly

---

**Need help?** Open an issue on GitHub or contact the maintainer.
