"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
/**
 * Middleware to log incoming requests
 */
const requestLogger = (req, res, next) => {
    const { method, path, body, query } = req;
    console.log(`[${new Date().toISOString()}] ${method} ${path}`);
    if (Object.keys(query).length > 0) {
        console.log('Query:', query);
    }
    if (method !== 'GET' && Object.keys(body).length > 0) {
        console.log('Body:', JSON.stringify(body, null, 2));
    }
    next();
};
exports.requestLogger = requestLogger;
