FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p public/images/products

# Expose port
EXPOSE 3001

# Start development server
CMD ["npm", "run", "start:dev"]
