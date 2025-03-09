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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const messageService_1 = __importDefault(require("../services/messageService"));
const statusService_1 = __importDefault(require("../services/statusService"));
const config_1 = __importDefault(require("../config"));
class WebhookController {
    constructor() {
        /**
         * Verify webhook endpoint for WhatsApp Cloud API
         * This is required for the initial setup of the webhook
         */
        this.verifyWebhook = errorHandler_1.default.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const mode = req.query['hub.mode'];
            const token = req.query['hub.verify_token'];
            const challenge = req.query['hub.challenge'];
            // Check if a token and mode is in the query string of the request
            if (mode && token) {
                // Check the mode and token sent are correct
                if (mode === 'subscribe' && token === config_1.default.whatsapp.verifyToken) {
                    // Respond with the challenge token from the request
                    console.log('WEBHOOK_VERIFIED');
                    res.status(200).send(challenge);
                }
                else {
                    // Respond with '403 Forbidden' if verify tokens do not match
                    res.sendStatus(403);
                }
            }
            else {
                // Respond with '400 Bad Request' if required parameters are missing
                res.sendStatus(400);
            }
        }));
        /**
         * Receive webhook events from WhatsApp Cloud API
         */
        this.receiveWebhook = errorHandler_1.default.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
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
                        // Process the message using the message service
                        yield messageService_1.default.processIncomingMessage(message, phoneNumberId, from);
                    }
                    // Handle status updates
                    if (value.statuses && value.statuses.length > 0) {
                        const status = value.statuses[0];
                        console.log('Status update received:', JSON.stringify(status));
                        // Process the status update using the status service
                        yield statusService_1.default.processStatusUpdate(status);
                    }
                }
                // Return a '200 OK' response to all requests
                res.status(200).send('EVENT_RECEIVED');
            }
            else {
                // Return a '404 Not Found' if event is not from a WhatsApp API
                res.sendStatus(404);
            }
        }));
    }
}
exports.default = new WebhookController();
