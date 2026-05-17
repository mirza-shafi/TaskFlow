# Multi-stage build for optimized React frontend

# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files only (better caching)
COPY package*.json ./

# Install all dependencies (dev deps needed for build)
RUN npm ci && \
    npm cache clean --force

# Copy source code and config files
COPY . .

# Build the application with optimizations
ENV NODE_ENV=production
RUN npm run build && \
    # Remove source maps for smaller size
    find dist -name "*.map" -type f -delete

# Stage 2: Serve with minimal Nginx
FROM nginx:1.25-alpine

# Remove default nginx configs and files
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/*

# Copy built assets from builder (only dist folder)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create directories for nginx to write (cache, pid, etc.)
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/run /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /var/run /usr/share/nginx/html

# Use nginx's built-in nginx user instead of creating new one
USER nginx

# Expose port 8080 (non-privileged port)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
