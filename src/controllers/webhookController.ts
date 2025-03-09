import { Request, Response } from 'express';
import errorHandler from '../utils/errorHandler';
import { WhatsAppWebhookEvent, Message, Status } from '../types/whatsapp';
import messageService from '../services/messageService';
import statusService from '../services/statusService';
import config from '../config';

class WebhookController {
  /**
   * Verify webhook endpoint for WhatsApp Cloud API
   * This is required for the initial setup of the webhook
   */
  public verifyWebhook = errorHandler.catchAsync(async (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
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

  /**
   * Receive webhook events from WhatsApp Cloud API
   */
  public receiveWebhook = errorHandler.catchAsync(async (req: Request, res: Response) => {
    const body = req.body as WhatsAppWebhookEvent;

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
          
          // Process the message using the message service
          await messageService.processIncomingMessage(message, phoneNumberId, from);
        }
        
        // Handle status updates
        if (value.statuses && value.statuses.length > 0) {
          const status = value.statuses[0];
          console.log('Status update received:', JSON.stringify(status));
          
          // Process the status update using the status service
          await statusService.processStatusUpdate(status);
        }
      }
      
      // Return a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Return a '404 Not Found' if event is not from a WhatsApp API
      res.sendStatus(404);
    }
  });
}

export default new WebhookController(); 