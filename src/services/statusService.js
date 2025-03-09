"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class StatusService {
    /**
     * Process WhatsApp message status updates
     */
    processStatusUpdate(status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Processing status update: ${status.status} for message ID: ${status.id}`);
                switch (status.status) {
                    case 'sent':
                        yield this.handleSentStatus(status);
                        break;
                    case 'delivered':
                        yield this.handleDeliveredStatus(status);
                        break;
                    case 'read':
                        yield this.handleReadStatus(status);
                        break;
                    case 'failed':
                        yield this.handleFailedStatus(status);
                        break;
                    default:
                        console.log(`Unknown status type: ${status.status}`);
                }
            }
            catch (error) {
                console.error('Error processing status update:', error);
            }
        });
    }
    /**
     * Handle 'sent' status
     */
    handleSentStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Message ${status.id} was sent to ${status.recipient_id} at ${status.timestamp}`);
            // Additional logic for sent messages
            if (status.conversation) {
                console.log(`Conversation ID: ${status.conversation.id}`);
            }
        });
    }
    /**
     * Handle 'delivered' status
     */
    handleDeliveredStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Message ${status.id} was delivered to ${status.recipient_id} at ${status.timestamp}`);
            // Additional logic for delivered messages
            if (status.conversation) {
                console.log(`Conversation ID: ${status.conversation.id}`);
            }
        });
    }
    /**
     * Handle 'read' status
     */
    handleReadStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Message ${status.id} was read by ${status.recipient_id} at ${status.timestamp}`);
            // Additional logic for read messages
            if (status.conversation) {
                console.log(`Conversation ID: ${status.conversation.id}`);
            }
        });
    }
    /**
     * Handle 'failed' status
     */
    handleFailedStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
}
exports.default = new StatusService();
