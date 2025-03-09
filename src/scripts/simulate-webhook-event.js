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
/**
 * Simulate a WhatsApp webhook event
 */
function simulateWebhookEvent() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const baseUrl = `http://localhost:${config_1.default.port}/api/webhook`;
            console.log('Simulating WhatsApp webhook event...');
            console.log(`URL: ${baseUrl}`);
            // Simulate a text message event
            const textMessageEvent = {
                object: 'whatsapp_business_account',
                entry: [
                    {
                        id: '123456789',
                        changes: [
                            {
                                value: {
                                    messaging_product: 'whatsapp',
                                    metadata: {
                                        display_phone_number: '15551234567',
                                        phone_number_id: '987654321'
                                    },
                                    contacts: [
                                        {
                                            profile: {
                                                name: 'Test User'
                                            },
                                            wa_id: '15557654321'
                                        }
                                    ],
                                    messages: [
                                        {
                                            from: '15557654321',
                                            id: 'wamid.abcdefghijklmnopqrstuvwxyz',
                                            timestamp: new Date().toISOString(),
                                            type: 'text',
                                            text: {
                                                body: 'Hello, this is a test message!'
                                            }
                                        }
                                    ]
                                },
                                field: 'messages'
                            }
                        ]
                    }
                ]
            };
            console.log('\nSending text message event:');
            console.log(JSON.stringify(textMessageEvent, null, 2));
            const textResponse = yield axios_1.default.post(baseUrl, textMessageEvent, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(`Status: ${textResponse.status}`);
            console.log(`Response: ${textResponse.data}`);
            if (textResponse.status === 200 && textResponse.data === 'EVENT_RECEIVED') {
                console.log('✅ Text message event simulation successful!');
            }
            else {
                console.log('❌ Text message event simulation failed!');
            }
            // Simulate a status update event
            const statusUpdateEvent = {
                object: 'whatsapp_business_account',
                entry: [
                    {
                        id: '123456789',
                        changes: [
                            {
                                value: {
                                    messaging_product: 'whatsapp',
                                    metadata: {
                                        display_phone_number: '15551234567',
                                        phone_number_id: '987654321'
                                    },
                                    statuses: [
                                        {
                                            id: 'wamid.abcdefghijklmnopqrstuvwxyz',
                                            recipient_id: '15557654321',
                                            status: 'delivered',
                                            timestamp: new Date().toISOString(),
                                            conversation: {
                                                id: 'conversation_id_123'
                                            }
                                        }
                                    ]
                                },
                                field: 'messages'
                            }
                        ]
                    }
                ]
            };
            console.log('\nSending status update event:');
            console.log(JSON.stringify(statusUpdateEvent, null, 2));
            const statusResponse = yield axios_1.default.post(baseUrl, statusUpdateEvent, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(`Status: ${statusResponse.status}`);
            console.log(`Response: ${statusResponse.data}`);
            if (statusResponse.status === 200 && statusResponse.data === 'EVENT_RECEIVED') {
                console.log('✅ Status update event simulation successful!');
            }
            else {
                console.log('❌ Status update event simulation failed!');
            }
        }
        catch (error) {
            console.error('Error simulating webhook event:', error);
        }
    });
}
// Run the simulation
simulateWebhookEvent();
