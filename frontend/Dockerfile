FROM node:18-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start application
CMD ["npm", "start"]
