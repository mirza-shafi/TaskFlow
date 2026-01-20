import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError';

// Global error handling middleware
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging
  console.error('Error:', err);

  // Check if it's our custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: err.message
    });
    return;
  }

  // Handle Mongoose duplicate key errors
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
