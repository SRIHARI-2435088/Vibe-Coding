import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.utils';

// Global Prisma client instance
let prisma: PrismaClient;

// Initialize Prisma client with proper configuration
export const initializePrisma = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // Add logging listeners
    prisma.$on('query', (e) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Query: ' + e.query);
        logger.debug('Params: ' + e.params);
        logger.debug('Duration: ' + e.duration + 'ms');
      }
    });

    prisma.$on('error', (e) => {
      logger.error('Prisma error:', e);
    });

    prisma.$on('info', (e) => {
      logger.info('Prisma info:', e.message);
    });

    prisma.$on('warn', (e) => {
      logger.warn('Prisma warning:', e.message);
    });

    logger.info('Prisma client initialized successfully');
  }

  return prisma;
};

// Get the Prisma client instance
export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    return initializePrisma();
  }
  return prisma;
};

// Close Prisma connection
export const closePrisma = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Prisma client disconnected');
  }
};

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await closePrisma();
});

process.on('SIGINT', async () => {
  await closePrisma();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePrisma();
  process.exit(0);
});

// Export the singleton instance
export const prismaClient = getPrismaClient(); 