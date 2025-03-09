import axios from 'axios';
import config from '../config';

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
    try {
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
      
      const response = await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
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
    try {
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
      
      const response = await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
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
    try {
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
      
      const response = await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending location message:', error);
      throw error;
    }
  }

  /**
   * Upload media to WhatsApp servers
   */
  public async uploadMedia(phoneNumberId: string, mediaType: string, mediaUrl: string) {
    try {
      const url = `${this.baseUrl}/${phoneNumberId}/media`;
      
      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('file', mediaUrl);
      formData.append('type', mediaType);
      
      const response = await axios.post(url, formData, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }
}

export default new WhatsAppApi(); 