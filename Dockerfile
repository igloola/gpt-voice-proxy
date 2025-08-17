FROM node:18-alpine

# Install FFmpeg for audio conversion
RUN apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY server.js ./
COPY test-client.html ./

# Create temp directory for audio conversion
RUN mkdir -p temp

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]