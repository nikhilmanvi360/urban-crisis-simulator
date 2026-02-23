# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install ALL dependencies (including devDeps for build)
RUN npm ci

# Copy source code
COPY . .


# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install PRODUCTION only
COPY package*.json ./
RUN npm ci --only=production

# Copy source from builder (no devDeps, no test files)
COPY --from=builder /app/config         ./config
COPY --from=builder /app/engine         ./engine
COPY --from=builder /app/middleware     ./middleware
COPY --from=builder /app/models         ./models
COPY --from=builder /app/routes         ./routes
COPY --from=builder /app/seed           ./seed
COPY --from=builder /app/services       ./services
COPY --from=builder /app/server.js      ./server.js

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose API port
EXPOSE 5000

# Health check – hits the /ping route every 30s
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/ping || exit 1

# Start the server
CMD ["node", "server.js"]
