import express from 'express';
import webhookController from '../controllers/webhookController';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'whatsapp-webhook-server'
  });
});

// GET endpoint for webhook verification
router.get('/webhook', webhookController.verifyWebhook);

// POST endpoint for receiving webhook events
router.post('/webhook', webhookController.receiveWebhook);

export default router; 