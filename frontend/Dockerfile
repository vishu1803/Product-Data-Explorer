FROM node:18-alpine

WORKDIR /app

# Copy package files FIRST
COPY package*.json ./

# Install ALL dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# ✅ DON'T remove dependencies - keep them for runtime
# (Slightly larger image, but more reliable)

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
