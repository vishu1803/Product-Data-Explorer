# Use Node 20 Alpine (most reliable for minimal containers)
FROM node:20-alpine

# Install only essential system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    curl \
    dumb-init

# ✅ CORRECTED: Set proper Alpine Linux browser paths
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    CHROME_BIN=/usr/bin/chromium \
    CHROME_PATH=/usr/bin/chromium \
    NODE_OPTIONS="--max_old_space_size=512"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Clean up dev dependencies (keep only production)
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Create necessary directories
RUN mkdir -p public/images/products

# Add non-root user for security (but simpler approach)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start application with memory limit
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "--max_old_space_size=512", "dist/main"]
