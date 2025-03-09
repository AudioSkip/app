# WhatsApp Webhook Server

A TypeScript server that can receive webhook events from the WhatsApp Cloud API.

## Features

- Webhook verification endpoint for WhatsApp Cloud API
- Webhook endpoint to receive events from WhatsApp Cloud API
- Support for different message types (text, image, audio, document, video, location)
- Status update handling (sent, delivered, read, failed)
- Error handling
- Health check endpoint
- Test scripts for webhook verification and event simulation
- CORS support
- Security headers with Helmet
- Rate limiting

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A WhatsApp Business Account
- A Meta Developer Account

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   WHATSAPP_VERIFY_TOKEN=your_verify_token
   WHATSAPP_API_TOKEN=your_api_token
   NODE_ENV=development
   ```
   Replace `your_verify_token` with a random string of your choice and `your_api_token` with the token provided by Meta.

## Usage

1. Build the TypeScript code:
   ```
   npm run build
   ```

2. Start the server:
   ```
   npm start
   ```

3. For development with hot-reloading:
   ```
   npm run dev
   ```

## Testing

The server includes test scripts to verify functionality:

1. Test webhook verification:
   ```
   npm run test:webhook
   ```
   This script tests the webhook verification endpoint with correct and incorrect tokens.

2. Simulate webhook events:
   ```
   npm run test:simulate
   ```
   This script simulates WhatsApp webhook events (text message and status update).

## Deployment

### Using PM2 (recommended for production)

The repository includes a deployment script that uses PM2 to manage the Node.js process:

1. Make the script executable (if not already):
   ```
   chmod +x deploy.sh
   ```

2. Run the deployment script:
   ```
   ./deploy.sh
   ```

This script will:
- Install dependencies
- Build the project
- Install PM2 if not already installed
- Start the server with PM2
- Save the PM2 configuration

### Manual Deployment

1. Build the project:
   ```
   npm run build
   ```

2. Start the server:
   ```
   node dist/server.js
   ```

### Environment Variables for Production

For production deployment, set the following environment variables:

```
PORT=3000 (or your preferred port)
WHATSAPP_VERIFY_TOKEN=your_verify_token
WHATSAPP_API_TOKEN=your_api_token
NODE_ENV=production
```

## Setting up WhatsApp Cloud API Webhook

1. Go to the [Meta Developer Portal](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the WhatsApp product to your app
4. In the WhatsApp settings, set up the webhook:
   - Callback URL: `https://your-domain.com/api/webhook`
   - Verify Token: The same token you set in your `.env` file
   - Subscribe to the events you want to receive (messages, message_status)

## API Endpoints

- `GET /api/webhook`: Webhook verification endpoint
- `POST /api/webhook`: Webhook endpoint to receive events
- `GET /api/health`: Health check endpoint

## Project Structure

```
src/
├── config/             # Configuration files
├── controllers/        # Request handlers
├── middleware/         # Express middleware
├── public/             # Static files
├── routes/             # Route definitions
├── scripts/            # Test scripts
├── services/           # Business logic
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── server.ts           # Main application file
```

## Development

- `npm run build`: Build the TypeScript code
- `npm start`: Start the server
- `npm run dev`: Start the server with hot-reloading
- `npm run test:webhook`: Test webhook verification
- `npm run test:simulate`: Simulate webhook events

## Security Features

- **CORS**: Configurable Cross-Origin Resource Sharing
- **Helmet**: HTTP security headers
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Proper error handling and logging

## License

ISC 