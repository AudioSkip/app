import { Status } from '../types/whatsapp';

class StatusService {
  /**
   * Process WhatsApp message status updates
   */
  public async processStatusUpdate(status: Status): Promise<void> {
    try {
      console.log(`Processing status update: ${status.status} for message ID: ${status.id}`);
      
      switch (status.status) {
        case 'sent':
          await this.handleSentStatus(status);
          break;
        case 'delivered':
          await this.handleDeliveredStatus(status);
          break;
        case 'read':
          await this.handleReadStatus(status);
          break;
        case 'failed':
          await this.handleFailedStatus(status);
          break;
        default:
          console.log(`Unknown status type: ${status.status}`);
      }
    } catch (error) {
      console.error('Error processing status update:', error);
    }
  }

  /**
   * Handle 'sent' status
   */
  private async handleSentStatus(status: Status): Promise<void> {
    console.log(`Message ${status.id} was sent to ${status.recipient_id} at ${status.timestamp}`);
    
    // Additional logic for sent messages
    if (status.conversation) {
      console.log(`Conversation ID: ${status.conversation.id}`);
    }
  }

  /**
   * Handle 'delivered' status
   */
  private async handleDeliveredStatus(status: Status): Promise<void> {
    console.log(`Message ${status.id} was delivered to ${status.recipient_id} at ${status.timestamp}`);
    
    // Additional logic for delivered messages
    if (status.conversation) {
      console.log(`Conversation ID: ${status.conversation.id}`);
    }
  }

  /**
   * Handle 'read' status
   */
  private async handleReadStatus(status: Status): Promise<void> {
    console.log(`Message ${status.id} was read by ${status.recipient_id} at ${status.timestamp}`);
    
    // Additional logic for read messages
    if (status.conversation) {
      console.log(`Conversation ID: ${status.conversation.id}`);
    }
  }

  /**
   * Handle 'failed' status
   */
  private async handleFailedStatus(status: Status): Promise<void> {
    console.error(`Message ${status.id} failed to send to ${status.recipient_id} at ${status.timestamp}`);
    
    // Log error details if available
    if (status.errors && status.errors.length > 0) {
      status.errors.forEach(error => {
        console.error(`Error code: ${error.code}, Title: ${error.title}`);
      });
    }
    
    // Additional logic for failed messages
    if (status.pricing) {
      console.log(`Billable: ${status.pricing.billable}, Category: ${status.pricing.category}`);
    }
  }
}

export default new StatusService(); 