import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
// import rateLimit from 'express-rate-limit'; // Disabled
import path from 'path';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
// import { authMiddleware } from './middleware/auth.middleware';

// Import routes
import routes from './routes';

// Import configuration
import { corsConfig } from './config/cors';
import { sessionConfig } from './config/session';
// import { rateLimitConfig } from './config/rateLimit'; // Disabled

// Import utilities
import { logger } from './utils/logger.utils';

const app = express();

// ===== SECURITY MIDDLEWARE =====
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ===== CORS CONFIGURATION =====
app.use(cors(corsConfig));

// ===== RATE LIMITING =====
// app.use(rateLimit(rateLimitConfig)); // Disabled rate limiting

// ===== BASIC MIDDLEWARE =====
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ===== SESSION CONFIGURATION =====
app.use(session(sessionConfig));

// ===== LOGGING MIDDLEWARE =====
if (process.env['LOG_API_REQUESTS'] === 'true') {
  app.use(loggingMiddleware);
}

// ===== STATIC FILES =====
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== HEALTH CHECK =====
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Knowledge Transfer Tool API is running',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development',
    version: '1.0.0',
  });
});

// ===== API ROUTES =====
app.use('/api', routes);

// ===== API DOCUMENTATION =====
app.get('/api/docs', (_req, res) => {
  res.json({
    name: 'Knowledge Transfer Tool API',
    version: '1.0.0',
    description: 'API for managing knowledge transfer and documentation',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      knowledge: '/api/knowledge',
      files: '/api/files',
      comments: '/api/comments',
    },
    documentation: 'https://github.com/your-org/knowledge-transfer-tool',
  });
});

// ===== ROOT ENDPOINT =====
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Knowledge Transfer Tool API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
  });
});

// ===== INITIALIZATION =====
// Default users are automatically initialized in AuthService constructor
logger.info('Application initialization completed');

// ===== ERROR HANDLING =====
app.use(notFoundHandler);
app.use(errorHandler);

// Log successful startup
logger.info('Express application configured successfully');

export default app; 