import { Options as RateLimitOptions } from 'express-rate-limit';

export const rateLimitConfig: Partial<RateLimitOptions> = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000, // Default 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // Default 100 requests per window
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again later',
    retryAfter: 'Retry after the specified time',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests
  skipFailedRequests: false, // Count failed requests
  keyGenerator: (req) => {
    // Use IP address as the key for rate limiting
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(rateLimitConfig.windowMs! / 1000),
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks in development
    if (process.env.NODE_ENV === 'development' && req.path === '/health') {
      return true;
    }
    return false;
  },
}; 