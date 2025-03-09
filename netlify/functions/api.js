const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for simplicity in serverless context
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'whatsapp-webhook-server'
  });
});

// Webhook verification endpoint
app.get('/api/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    // Respond with '400 Bad Request' if required parameters are missing
    res.sendStatus(400);
  }
});

// Webhook endpoint to receive events
app.post('/api/webhook', (req, res) => {
  const body = req.body;

  // Check if this is an event from a WhatsApp API
  if (body.object === 'whatsapp_business_account') {
    // Process different types of events
    if (body.entry && 
        body.entry[0].changes && 
        body.entry[0].changes[0] && 
        body.entry[0].changes[0].value) {
      
      const value = body.entry[0].changes[0].value;
      
      // Handle different types of messages
      if (value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const phoneNumberId = value.metadata.phone_number_id;
        const from = message.from;
        
        console.log('Message received:', JSON.stringify(message));
        
        // Process the message (simplified for serverless function)
        console.log(`Processing message of type: ${message.type}`);
      }
      
      // Handle status updates
      if (value.statuses && value.statuses.length > 0) {
        const status = value.statuses[0];
        console.log('Status update received:', JSON.stringify(status));
        
        // Process the status update (simplified for serverless function)
        console.log(`Processing status update: ${status.status}`);
      }
    }
    
    // Return a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// Export the serverless function
module.exports.handler = serverless(app); 