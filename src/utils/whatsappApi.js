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
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
class WhatsAppApi {
    constructor() {
        this.baseUrl = config_1.default.whatsapp.baseUrl;
        this.apiToken = config_1.default.whatsapp.apiToken;
        if (!this.apiToken) {
            console.warn('WhatsApp API token is not set. Messages cannot be sent.');
        }
    }
    /**
     * Send a text message to a WhatsApp user
     */
    sendTextMessage(phoneNumberId, to, message) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const response = yield axios_1.default.post(url, data, {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                return response.data;
            }
            catch (error) {
                console.error('Error sending text message:', error);
                throw error;
            }
        });
    }
    /**
     * Send a media message to a WhatsApp user
     */
    sendMediaMessage(phoneNumberId, to, mediaType, mediaId, caption, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `${this.baseUrl}/${phoneNumberId}/messages`;
                const mediaObject = {
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
                const response = yield axios_1.default.post(url, data, {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                return response.data;
            }
            catch (error) {
                console.error('Error sending media message:', error);
                throw error;
            }
        });
    }
    /**
     * Send a location message to a WhatsApp user
     */
    sendLocationMessage(phoneNumberId, to, latitude, longitude, name, address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `${this.baseUrl}/${phoneNumberId}/messages`;
                const locationObject = {
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
                const response = yield axios_1.default.post(url, data, {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                return response.data;
            }
            catch (error) {
                console.error('Error sending location message:', error);
                throw error;
            }
        });
    }
    /**
     * Upload media to WhatsApp servers
     */
    uploadMedia(phoneNumberId, mediaType, mediaUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `${this.baseUrl}/${phoneNumberId}/media`;
                const formData = new FormData();
                formData.append('messaging_product', 'whatsapp');
                formData.append('file', mediaUrl);
                formData.append('type', mediaType);
                const response = yield axios_1.default.post(url, formData, {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return response.data;
            }
            catch (error) {
                console.error('Error uploading media:', error);
                throw error;
            }
        });
    }
}
exports.default = new WhatsAppApi();
