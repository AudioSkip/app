"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const webhookController_1 = __importDefault(require("../controllers/webhookController"));
const router = express_1.default.Router();
// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'whatsapp-webhook-server'
    });
});
// GET endpoint for webhook verification
router.get('/webhook', webhookController_1.default.verifyWebhook);
// POST endpoint for receiving webhook events
router.post('/webhook', webhookController_1.default.receiveWebhook);
exports.default = router;
