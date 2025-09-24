FROM node:20-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache curl python3 make g++

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Create required directories
RUN mkdir -p public/images/products

# Expose port (Render uses PORT env var)
EXPOSE ${PORT:-3001}

# Health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3001}/api/health || exit 1

# Start application
CMD ["sh", "-c", "node dist/main"]
