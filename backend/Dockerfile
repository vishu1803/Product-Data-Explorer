# Use Node 20 instead of 18 (required by NestJS 11+)
FROM node:20-alpine

# Install system dependencies for Playwright
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    git \
    curl

# Set browser paths for Playwright/Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy package files first (better Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Don't install Playwright browsers separately - use system chromium
# RUN npx playwright install chromium --with-deps  <- REMOVED

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Build the application
RUN npm run build

# Switch back to root for cleanup
USER root
# Clean up dev dependencies
RUN npm ci --only=production && npm cache clean --force

# Create necessary directories
RUN mkdir -p public/images/products && \
    chown -R nestjs:nodejs /app

# Switch back to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"]
