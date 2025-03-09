"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorHandler {
    handleError(err, req, res, next) {
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
        const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
        res.status(statusCode).json({
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        });
    }
    catchAsync(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch((err) => next(err));
        };
    }
}
exports.default = new ErrorHandler();
