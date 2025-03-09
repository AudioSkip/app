import helmet from 'helmet';
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Configure helmet with custom options
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
});

// Rate limiting middleware (simple implementation)
export const rateLimiter = (maxRequests: number, timeWindow: number): RequestHandler => {
  const requestCounts = new Map<string, { count: number, resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    
    // Initialize or get the request count for this IP
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, {
        count: 0,
        resetTime: now + timeWindow
      });
    }
    
    const requestData = requestCounts.get(ip)!;
    
    // Reset count if time window has passed
    if (now > requestData.resetTime) {
      requestData.count = 0;
      requestData.resetTime = now + timeWindow;
    }
    
    // Increment request count
    requestData.count++;
    
    // Check if rate limit is exceeded
    if (requestData.count > maxRequests) {
      res.status(429).json({
        status: 'error',
        message: 'Too many requests, please try again later.'
      });
      return;
    }
    
    next();
  };
}; 