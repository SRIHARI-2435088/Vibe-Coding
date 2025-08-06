import { Request, Response, NextFunction } from 'express';
// import { Prisma } from '@prisma/client'; // Commented out until Prisma is properly set up
import { logger } from '../utils/logger.utils';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public field?: string;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    code?: string,
    field?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.field = field;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 422, true, 'VALIDATION_ERROR', field);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, true, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, true, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT');
  }
}

// Global error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let field: string | undefined;

  // Handle custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || 'APP_ERROR';
    field = error.field;
  }
  // Handle Prisma errors (commented out until Prisma is properly set up)
  // else if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //   switch (error.code) {
  //     case 'P2002':
  //       statusCode = 409;
  //       message = 'Resource already exists';
  //       code = 'DUPLICATE_ENTRY';
  //       field = Array.isArray(error.meta?.target) 
  //         ? (error.meta.target as string[]).join(', ')
  //         : error.meta?.target as string;
  //       break;
  //     case 'P2025':
  //       statusCode = 404;
  //       message = 'Resource not found';
  //       code = 'NOT_FOUND';
  //       break;
  //     case 'P2003':
  //       statusCode = 400;
  //       message = 'Invalid foreign key constraint';
  //       code = 'FOREIGN_KEY_CONSTRAINT';
  //       break;
  //     default:
  //       statusCode = 400;
  //       message = 'Database operation failed';
  //       code = 'DATABASE_ERROR';
  //   }
  // }
  // Handle validation errors from express-validator
  else if (error.name === 'ValidationError') {
    statusCode = 422;
    message = error.message;
    code = 'VALIDATION_ERROR';
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }
  // Handle multer errors (file upload)
  else if (error.name === 'MulterError') {
    statusCode = 400;
    switch ((error as any).code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large';
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        code = 'TOO_MANY_FILES';
        break;
      default:
        message = 'File upload error';
        code = 'UPLOAD_ERROR';
    }
  }

  // Log error details
  logger.error({
    message: error.message,
    stack: error.stack,
    statusCode,
    code,
    field,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(field && { field }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response) => {
  const message = `Route ${req.method} ${req.originalUrl} not found`;
  
  logger.warn({
    message,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    message,
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
}; 