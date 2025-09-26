FROM node:20-slim

# Update package list and install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Alternative: If Google Chrome fails, use Chromium
# RUN apt-get update && apt-get install -y \
#     chromium-browser \
#     fonts-liberation \
#     libasound2 \
#     libatk-bridge2.0-0 \
#     libdrm2 \
#     libgtk-3-0 \
#     libnss3 \
#     xvfb \
#     && rm -rf /var/lib/apt/lists/*

# Set environment variables for browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    CHROME_BIN=/usr/bin/google-chrome-stable \
    CHROME_PATH=/usr/bin/google-chrome-stable \
    NODE_OPTIONS="--max_old_space_size=1024"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code  
COPY . .

# Build application
RUN npm run build

# Clean up dev dependencies
RUN npm prune --production

# Create directories
RUN mkdir -p public/images/products

# Add user for running the application
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start with optimized memory
CMD ["node", "--max_old_space_size=1024", "dist/main"]
