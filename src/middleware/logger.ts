import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to log incoming requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
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