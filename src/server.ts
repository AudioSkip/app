import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import webhookRoutes from './routes/webhookRoutes';
import errorHandler from './utils/errorHandler';
import { requestLogger } from './middleware/logger';
import { corsMiddleware, corsErrorHandler } from './middleware/cors';
import { securityMiddleware, rateLimiter } from './middleware/security';
import config from './config';

// Initialize express app
const app = express();
const PORT = config.port;

// Security middleware
app.use(securityMiddleware);
app.use(corsMiddleware);

// Rate limiting - 100 requests per minute for webhook endpoints
const webhookRateLimiter = rateLimiter(100, 60 * 1000);
app.use('/api/webhook', webhookRateLimiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', webhookRoutes);

// Root route - serve the HTML page
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use(corsErrorHandler);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler.handleError(err, req, res, next);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/api/webhook`);
  console.log(`Health check URL: http://localhost:${PORT}/api/health`);
  console.log(`Environment: ${config.environment}`);
}); 