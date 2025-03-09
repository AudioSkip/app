"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const webhookRoutes_1 = __importDefault(require("./routes/webhookRoutes"));
const errorHandler_1 = __importDefault(require("./utils/errorHandler"));
const logger_1 = require("./middleware/logger");
const config_1 = __importDefault(require("./config"));
// Initialize express app
const app = (0, express_1.default)();
const PORT = config_1.default.port;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_1.requestLogger);
// Serve static files
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Routes
app.use('/api', webhookRoutes_1.default);
// Root route - serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
// Error handling middleware
app.use((err, req, res, next) => {
    errorHandler_1.default.handleError(err, req, res, next);
});
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Webhook URL: http://localhost:${PORT}/api/webhook`);
    console.log(`Health check URL: http://localhost:${PORT}/api/health`);
    console.log(`Environment: ${config_1.default.environment}`);
});
