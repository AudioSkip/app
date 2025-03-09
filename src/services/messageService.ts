import { Message } from '../types/whatsapp';
import whatsappApi from '../utils/whatsappApi';

class MessageService {
  /**
   * Process incoming WhatsApp messages
   */
  public async processIncomingMessage(message: Message, phoneNumberId: string, from: string): Promise<void> {
    try {
      switch (message.type) {
        case 'text':
          if (message.text) {
            await this.handleTextMessage(message.text.body, phoneNumberId, from);
          }
          break;
        case 'image':
          await this.handleImageMessage(message, phoneNumberId, from);
          break;
        case 'audio':
          await this.handleAudioMessage(message, phoneNumberId, from);
          break;
        case 'document':
          if (message.document) {
            await this.handleDocumentMessage(message, phoneNumberId, from);
          }
          break;
        case 'video':
          await this.handleVideoMessage(message, phoneNumberId, from);
          break;
        case 'location':
          if (message.location) {
            await this.handleLocationMessage(message, phoneNumberId, from);
          }
          break;
        default:
          await this.handleUnknownMessageType(message, phoneNumberId, from);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  /**
   * Handle text messages
   */
  private async handleTextMessage(text: string, phoneNumberId: string, from: string): Promise<void> {
    console.log(`Processing text message: "${text}" from ${from}`);
    
    // Echo the message back to the user
    const response = `You said: ${text}`;
    await whatsappApi.sendTextMessage(phoneNumberId, from, response);
  }

  /**
   * Handle image messages
   */
  private async handleImageMessage(message: Message, phoneNumberId: string, from: string): Promise<void> {
    console.log(`Processing image message from ${from}`);
    
    // Acknowledge receipt of image
    await whatsappApi.sendTextMessage(
      phoneNumberId, 
      from, 
      "Thanks for the image! I've received it."
    );
  }

  /**
   * Handle audio messages
   */
  private async handleAudioMessage(message: Message, phoneNumberId: string, from: string): Promise<void> {
    console.log(`Processing audio message from ${from}`);
    
    // Acknowledge receipt of audio
    await whatsappApi.sendTextMessage(
      phoneNumberId, 
      from, 
      "Thanks for the audio! I've received it."
    );
  }

  /**
   * Handle document messages
   */
  private async handleDocumentMessage(message: Message, phoneNumberId: string, from: string): Promise<void> {
    console.log(`Processing document message from ${from}`);
    
    if (message.document) {
      const filename = message.document.filename;
      
      // Acknowledge receipt of document
      await whatsappApi.sendTextMessage(
        phoneNumberId, 
        from, 
        `Thanks for the document "${filename}"! I've received it.`
      );
    }
  }

  /**
   * Handle video messages
   */
  private async handleVideoMessage(message: Message, phoneNumberId: string, from: string): Promise<void> {
    console.log(`Processing video message from ${from}`);
    
    // Acknowledge receipt of video
    await whatsappApi.sendTextMessage(
      phoneNumberId, 
      from, 
      "Thanks for the video! I've received it."
    );
  }

  /**
   * Handle location messages
   */
  private async handleLocationMessage(message: Message, phoneNumberId: string, from: string): Promise<void> {
    console.log(`Processing location message from ${from}`);
    
    if (message.location) {
      const { latitude, longitude, name, address } = message.location;
      let locationInfo = `Latitude: ${latitude}, Longitude: ${longitude}`;
      
      if (name) {
        locationInfo += `, Name: ${name}`;
      }
      
      if (address) {
        locationInfo += `, Address: ${address}`;
      }
      
      // Acknowledge receipt of location
      await whatsappApi.sendTextMessage(
        phoneNumberId, 
        from, 
        `Thanks for sharing your location! I've received: ${locationInfo}`
      );
    }
  }

  /**
   * Handle unknown message types
   */
  private async handleUnknownMessageType(message: Message, phoneNumberId: string, from: string): Promise<void> {
    console.log(`Processing unknown message type from ${from}`);
    
    // Acknowledge receipt of unknown message type
    await whatsappApi.sendTextMessage(
      phoneNumberId, 
      from, 
      "I received your message, but I don't know how to process this type of content yet."
    );
  }
}

export default new MessageService(); 