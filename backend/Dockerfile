FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl python3 make g++

# Copy package files FIRST
COPY package*.json ./

# THEN install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create public directory
RUN mkdir -p public/images/products

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/main"]
