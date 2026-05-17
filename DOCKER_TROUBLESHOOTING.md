# Docker Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Issue 1: Backend Permission Denied

**Symptoms**:
```
/usr/local/bin/python3.12: can't open file '/root/.local/bin/uvicorn': [Errno 13] Permission denied
```

**Solution**: ✅ Fixed in latest Dockerfile
- Packages now installed to `/install` (shared location)
- Non-root user can access binaries

**Verify Fix**:
```bash
docker-compose down
docker-compose build backend
docker-compose up backend
```

---

### Issue 2: Nginx Can't Find Backend Upstream

**Symptoms**:
```
nginx: [emerg] host not found in upstream "backend" in /etc/nginx/conf.d/default.conf:46
```

**Solution**: ✅ API proxy is now commented out by default
- Frontend works standalone
- Uncomment in `client/nginx.conf` if you need API proxy

**Verify Fix**:
```bash
docker-compose up frontend
# Should start without errors
```

---

### Issue 3: Frontend Build Fails

**Symptoms**:
```
npm run build failed: exit code 1
vite: command not found
```

**Solution**: ✅ Fixed in latest Dockerfile
- All dependencies installed with `npm ci`
- Config files included in build

**Verify Fix**:
```bash
cd client
docker build -t test-frontend .
```

---

### Issue 4: Containers Not Healthy

**Symptoms**:
```bash
docker-compose ps
# Shows: unhealthy or starting
```

**Solution**:
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Common causes:
# 1. Missing .env file
cp .env.example .env
nano .env  # Add your MONGO_URI, JWT_SECRET, etc.

# 2. MongoDB connection issue
# Check MONGO_URI in .env
# Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0

# 3. Port already in use
# Change ports in docker-compose.yml
ports:
  - "3000:8080"  # Instead of 80:8080
  - "8080:8000"  # Instead of 8000:8000
```

---

### Issue 5: Cannot Connect to MongoDB

**Symptoms**:
```
pymongo.errors.ServerSelectionTimeoutError
```

**Solutions**:
1. **Check MONGO_URI** in .env file
2. **Whitelist IP** in MongoDB Atlas: Add `0.0.0.0/0` 
3. **Test connection**:
```bash
docker-compose exec backend python -c "from app.database import Database; print('Connected' if Database.client else 'Failed')"
```

---

### Issue 6: Image Build is Slow

**Symptoms**:
- Build takes 5+ minutes

**Solutions**:
```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker-compose build

# Or enable BuildKit globally
echo '{"features":{"buildkit":true}}' > ~/.docker/daemon.json
# Restart Docker Desktop

# Clean build cache if needed
docker builder prune
```

---

### Issue 7: Container Runs Out of Memory

**Symptoms**:
```
docker-compose ps  # Shows "Killed" or exits immediately
```

**Solutions**:
```yaml
# Add memory limits to docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

---

## 🛠️ Useful Commands

### Development

```bash
# Start in development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up

# Rebuild single service
docker-compose build backend
docker-compose up -d backend

# View logs
docker-compose logs -f
docker-compose logs -f backend

# Execute command in running container
docker-compose exec backend sh
docker-compose exec frontend sh

# Install new Python package
docker-compose exec backend pip install package-name
# Then update requirements.txt and rebuild
```

### Production

```bash
# Clean build
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Check status
docker-compose ps

# Monitor resources
docker stats

# Update and restart
git pull
docker-compose up -d --build
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes too
docker-compose down -v

# Remove all unused images
docker image prune -a

# Remove all unused containers, networks, images
docker system prune -a

# Nuclear option (clean everything)
docker system prune -a --volumes
```

### Debugging

```bash
# Check container logs
docker logs taskflow-backend
docker logs taskflow-frontend

# Inspect container
docker inspect taskflow-backend

# Check health
docker inspect taskflow-backend | grep -A 10 Health

# Run health check manually
docker exec taskflow-backend wget --no-verbose --tries=1 --spider http://localhost:8000/health

# Check network
docker network inspect taskflow_taskflow-network

# Test connectivity between containers
docker-compose exec frontend ping backend
docker-compose exec backend ping frontend
```

---

## 🔍 Health Check Verification

### Backend
```bash
# From host
curl http://localhost:8000/health

# From inside container
docker-compose exec backend wget -O- http://localhost:8000/health

# Expected response:
{"status": "healthy"}
```

### Frontend
```bash
# From host
curl http://localhost/health

# Expected response:
healthy
```

---

## 📊 Performance Monitoring

```bash
# Resource usage
docker stats

# Disk usage
docker system df

# Image sizes
docker images | grep taskflow

# Container processes
docker-compose top
```

---

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Build Docker images
  run: |
    docker-compose build
    docker images

- name: Test containers
  run: |
    docker-compose up -d
    sleep 10
    docker-compose ps
    curl http://localhost:8000/health
    curl http://localhost/health
```

### Manual Deployment
```bash
# Build on local, save, transfer, load
docker save taskflow-backend:latest | gzip > backend.tar.gz
docker save taskflow-frontend:latest | gzip > frontend.tar.gz

# On server:
gunzip < backend.tar.gz | docker load
gunzip < frontend.tar.gz | docker load
```

---

## 📝 Quick Reference

| Command | Purpose |
|---------|---------|
| `docker-compose up -d` | Start services in background |
| `docker-compose down` | Stop and remove containers |
| `docker-compose logs -f` | Follow logs |
| `docker-compose ps` | List running containers |
| `docker-compose build` | Build images |
| `docker-compose restart` | Restart services |
| `docker-compose exec <service> sh` | Shell into container |
| `docker system prune` | Clean up unused resources |

---

**Need more help?** Check:
- [DOCKER_README.md](DOCKER_README.md) - Full Docker guide
- [DOCKER_BUILD_FIX.md](DOCKER_BUILD_FIX.md) - Build issue fixes
- [DOCKER_OPTIMIZATION.md](DOCKER_OPTIMIZATION.md) - Optimization details
