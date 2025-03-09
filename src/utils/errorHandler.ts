import { Request, Response, NextFunction } from 'express';

class ErrorHandler {
  public handleError(err: Error, req: Request, res: Response, next: NextFunction): void {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
  }

  public catchAsync(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    };
  }
}

export default new ErrorHandler(); 