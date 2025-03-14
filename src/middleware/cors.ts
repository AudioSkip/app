import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import config from '../config';

// Configure CORS options
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
	callback(null, true);
	return;

    // // In development, allow all origins
    // if (config.environment === 'development') {
    //   callback(null, true);
    //   return;
    // }
    
    // // In production, you might want to restrict to specific origins
    // const allowedOrigins = [
    //   'https://your-domain.com',
    //   'https://www.your-domain.com'
    // ];
    
    // if (!origin || allowedOrigins.indexOf(origin) !== -1) {
    //   callback(null, true);
    // } else {
    //   callback(new Error('Not allowed by CORS'));
    // }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Export the configured CORS middleware
export const corsMiddleware = cors(corsOptions);

// Custom CORS error handler
export const corsErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({
      status: 'error',
      message: 'CORS not allowed for this origin'
    });
  } else {
    next(err);
  }
}; 