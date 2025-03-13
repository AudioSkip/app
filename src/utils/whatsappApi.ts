import fetch from 'node-fetch';
import config from '../config';
import FormData from 'form-data';

// Error handler utility function
const errorHandler = async (fn: Function, ...args: any[]) => {
  try {
    return await fn(...args);
  } catch (error) {
    console.error(`Error in ${fn.name || 'anonymous function'}:`, error);
    throw error;
  }
};

class WhatsAppApi {
  private baseUrl = config.whatsapp.baseUrl;
  private apiToken: string;

  constructor() {
    this.apiToken = config.whatsapp.apiToken;
    if (!this.apiToken) {
      console.warn('WhatsApp API token is not set. Messages cannot be sent.');
    }
  }

  /**
   * Send a text message to a WhatsApp user
   */
  public async sendTextMessage(phoneNumberId: string, to: string, message: string) {
    return errorHandler(async () => {
      const url = `${this.baseUrl}/${phoneNumberId}/messages`;
      
      const data = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          body: message
        }
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    });
  }

  /**
   * Send a media message to a WhatsApp user
   */
  public async sendMediaMessage(
    phoneNumberId: string, 
    to: string, 
    mediaType: 'image' | 'audio' | 'document' | 'video', 
    mediaId: string,
    caption?: string,
    filename?: string
  ) {
    return errorHandler(async () => {
      const url = `${this.baseUrl}/${phoneNumberId}/messages`;
      
      const mediaObject: any = {
        id: mediaId
      };
      
      if (caption) {
        mediaObject.caption = caption;
      }
      
      if (mediaType === 'document' && filename) {
        mediaObject.filename = filename;
      }
      
      const data = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: mediaType,
        [mediaType]: mediaObject
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    });
  }

  /**
   * Send a location message to a WhatsApp user
   */
  public async sendLocationMessage(
    phoneNumberId: string, 
    to: string, 
    latitude: number, 
    longitude: number,
    name?: string,
    address?: string
  ) {
    return errorHandler(async () => {
      const url = `${this.baseUrl}/${phoneNumberId}/messages`;
      
      const locationObject: any = {
        latitude,
        longitude
      };
      
      if (name) {
        locationObject.name = name;
      }
      
      if (address) {
        locationObject.address = address;
      }
      
      const data = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'location',
        location: locationObject
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    });
  }

  /**
   * Upload media to WhatsApp servers
   */
  public async uploadMedia(phoneNumberId: string, mediaType: string, mediaUrl: string) {
    return errorHandler(async () => {
      const url = `${this.baseUrl}/${phoneNumberId}/media`;
      
      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('file', mediaUrl);
      formData.append('type', mediaType);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
          // FormData will set its own content-type with boundary
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    });
  }
}

export default new WhatsAppApi(); 