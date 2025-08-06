import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.utils';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  // Log the incoming request
  logger.info(`📨 ${method} ${originalUrl}`, {
    method,
    url: originalUrl,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
  });

  // Override res.end to log the response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    
    // Determine log level based on status code
    const logLevel = statusCode >= 400 ? 'warn' : 'info';
    const icon = statusCode >= 400 ? '❌' : '✅';
    
    logger[logLevel](`${icon} ${method} ${originalUrl} - ${statusCode} - ${duration}ms`, {
      method,
      url: originalUrl,
      statusCode,
      duration,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
    
    // Call the original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
}; 