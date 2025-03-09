FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built app
COPY dist/ ./dist/

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "dist/server.js"] 