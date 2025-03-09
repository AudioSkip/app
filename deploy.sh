#!/bin/bash

# WhatsApp Webhook Server Deployment Script

# Exit on error
set -e

echo "Starting deployment process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building the project..."
npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

# Check if the app is already running
if pm2 list | grep -q "whatsapp-webhook"; then
    echo "Stopping existing server..."
    pm2 stop whatsapp-webhook
    pm2 delete whatsapp-webhook
fi

# Start the server with PM2
echo "Starting server with PM2..."
pm2 start dist/server.js --name "whatsapp-webhook" --log-date-format "YYYY-MM-DD HH:mm:ss"

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

echo "Deployment completed successfully!"
echo "Server is running with PM2. Use 'pm2 logs whatsapp-webhook' to view logs."
echo "Use 'pm2 monit' to monitor the server." 