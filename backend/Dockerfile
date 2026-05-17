# Multi-stage build for optimized FastAPI backend
FROM python:3.12-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev \
    openssl-dev \
    python3-dev \
    cargo \
    rust

# Set working directory
WORKDIR /app

# Copy and install Python dependencies to /install (shared location)
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Production stage
FROM python:3.12-alpine

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/install/lib/python3.12/site-packages \
    PATH=/install/bin:$PATH

# Install runtime dependencies only
RUN apk add --no-cache \
    libffi \
    openssl \
    libmagic \
    wget

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy Python dependencies from builder to shared location
COPY --from=builder /install /install

# Copy application code
COPY --chown=appuser:appgroup . .

# Create uploads directory with correct permissions
RUN mkdir -p uploads/avatars && \
    chown -R appuser:appgroup uploads

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check (using wget instead of requests to avoid importing)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
