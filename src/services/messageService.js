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
const whatsappApi_1 = __importDefault(require("../utils/whatsappApi"));
class MessageService {
    /**
     * Process incoming WhatsApp messages
     */
    processIncomingMessage(message, phoneNumberId, from) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                switch (message.type) {
                    case 'text':
                        if (message.text) {
                            yield this.handleTextMessage(message.text.body, phoneNumberId, from);
                        }
                        break;
                    case 'image':
                        yield this.handleImageMessage(message, phoneNumberId, from);
                        break;
                    case 'audio':
                        yield this.handleAudioMessage(message, phoneNumberId, from);
                        break;
                    case 'document':
                        if (message.document) {
                            yield this.handleDocumentMessage(message, phoneNumberId, from);
                        }
                        break;
                    case 'video':
                        yield this.handleVideoMessage(message, phoneNumberId, from);
                        break;
                    case 'location':
                        if (message.location) {
                            yield this.handleLocationMessage(message, phoneNumberId, from);
                        }
                        break;
                    default:
                        yield this.handleUnknownMessageType(message, phoneNumberId, from);
                }
            }
            catch (error) {
                console.error('Error processing message:', error);
            }
        });
    }
    /**
     * Handle text messages
     */
    handleTextMessage(text, phoneNumberId, from) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Processing text message: "${text}" from ${from}`);
            // Echo the message back to the user
            const response = `You said: ${text}`;
            yield whatsappApi_1.default.sendTextMessage(phoneNumberId, from, response);
        });
    }
    /**
     * Handle image messages
     */
    handleImageMessage(message, phoneNumberId, from) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Processing image message from ${from}`);
            // Acknowledge receipt of image
            yield whatsappApi_1.default.sendTextMessage(phoneNumberId, from, "Thanks for the image! I've received it.");
        });
    }
    /**
     * Handle audio messages
     */
    handleAudioMessage(message, phoneNumberId, from) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Processing audio message from ${from}`);
            // Acknowledge receipt of audio
            yield whatsappApi_1.default.sendTextMessage(phoneNumberId, from, "Thanks for the audio! I've received it.");
        });
    }
    /**
     * Handle document messages
     */
    handleDocumentMessage(message, phoneNumberId, from) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Processing document message from ${from}`);
            if (message.document) {
                const filename = message.document.filename;
                // Acknowledge receipt of document
                yield whatsappApi_1.default.sendTextMessage(phoneNumberId, from, `Thanks for the document "${filename}"! I've received it.`);
            }
        });
    }
    /**
     * Handle video messages
     */
    handleVideoMessage(message, phoneNumberId, from) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Processing video message from ${from}`);
            // Acknowledge receipt of video
            yield whatsappApi_1.default.sendTextMessage(phoneNumberId, from, "Thanks for the video! I've received it.");
        });
    }
    /**
     * Handle location messages
     */
    handleLocationMessage(message, phoneNumberId, from) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield whatsappApi_1.default.sendTextMessage(phoneNumberId, from, `Thanks for sharing your location! I've received: ${locationInfo}`);
            }
        });
    }
    /**
     * Handle unknown message types
     */
    handleUnknownMessageType(message, phoneNumberId, from) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Processing unknown message type from ${from}`);
            // Acknowledge receipt of unknown message type
            yield whatsappApi_1.default.sendTextMessage(phoneNumberId, from, "I received your message, but I don't know how to process this type of content yet.");
        });
    }
}
exports.default = new MessageService();
