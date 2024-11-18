# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose port 5000
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]