FROM node:18-alpine

WORKDIR /app

# Copy package files FIRST (before npm install)
COPY package*.json ./

# ✅ FIXED: Install ALL dependencies (including TypeScript)
RUN npm ci --silent

# Copy source code
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application (TypeScript is now available)
RUN npm run build

# ✅ CLEAN UP: Remove devDependencies AFTER build
RUN npm ci --only=production --silent && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
