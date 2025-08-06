import { config } from 'dotenv';
import path from 'path';

// Load environment variables with fallback paths
const loadEnv = () => {
  const envPaths = [
    path.join(__dirname, '../.env'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'backend/.env')
  ];

  for (const envPath of envPaths) {
    try {
      const result = config({ path: envPath });
      if (result.parsed) {
        console.log(`Environment loaded from: ${envPath}`);
        return;
      }
    } catch (error) {
      // Continue to next path
    }
  }
  
  // Fallback: try loading without explicit path
  config();
  console.log('Environment loaded from default location');
};

loadEnv();

import app from './app';
import { logger } from './utils/logger.utils';

const PORT = process.env['PORT'] || 3001;

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Knowledge Transfer Tool API Server is running on port ${PORT}`);
  logger.info(`📍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  logger.info(`📊 Database: ${process.env['DATABASE_URL'] || 'Not configured'}`);
  
  if (process.env['NODE_ENV'] === 'development') {
    logger.info(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
    logger.info(`🎯 Health Check: http://localhost:${PORT}/api/health`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  server.close(() => {
    process.exit(1);
  });
});

export default server; 