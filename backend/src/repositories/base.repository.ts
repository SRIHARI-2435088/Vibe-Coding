import { PrismaClient } from '@prisma/client';
import { prismaClient } from '../config/prisma';

/**
 * Base Repository Class
 * Provides common database operations and utilities for all repositories
 */
export abstract class BaseRepository {
  protected readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  /**
   * Execute a transaction with multiple operations
   */
  protected async executeTransaction<T>(
    operations: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    return await this.prisma.$transaction(async (prisma) => {
      return await operations(prisma);
    });
  }

  /**
   * Handle Prisma errors and convert to application errors
   */
  protected handlePrismaError(error: any, operation: string): never {
    if (error.code === 'P2002') {
      throw new Error(`Duplicate entry: ${error.meta?.target || 'unknown field'}`);
    }
    if (error.code === 'P2025') {
      throw new Error('Record not found');
    }
    if (error.code === 'P2003') {
      throw new Error('Foreign key constraint failed');
    }
    
    // Log the original error for debugging
    console.error(`Repository error in ${operation}:`, error);
    throw new Error(`Database operation failed: ${operation}`);
  }

  /**
   * Build pagination parameters
   */
  protected buildPagination(page = 1, limit = 10) {
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.min(100, Math.max(1, limit));
    const skip = (normalizedPage - 1) * normalizedLimit;

    return {
      skip,
      take: normalizedLimit,
      page: normalizedPage,
      limit: normalizedLimit,
    };
  }

  /**
   * Build search conditions for text fields
   */
  protected buildSearchConditions(
    search?: string,
    fields: string[] = []
  ): any[] | undefined {
    if (!search || fields.length === 0) {
      return undefined;
    }

    return fields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as const
      }
    }));
  }

  /**
   * Calculate pagination metadata
   */
  protected calculatePagination(
    total: number,
    page: number,
    limit: number
  ) {
    const pages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    };
  }
} 