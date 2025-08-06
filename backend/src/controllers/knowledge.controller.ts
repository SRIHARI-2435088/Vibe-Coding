import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { knowledgeService } from '../services/knowledge.service';
import { activityService } from '../services/activity.service';
import { 
  CreateKnowledgeRequest, 
  UpdateKnowledgeRequest,
  KnowledgeSearchOptions 
} from '../types/knowledge.types';
import { logger } from '../utils/logger.utils';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Knowledge Controller
 * Handles all knowledge-related HTTP requests
 */
export class KnowledgeController {
  /**
   * Create a new knowledge item
   * POST /api/knowledge
   */
  async createKnowledgeItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
        return;
      }

      const createData: CreateKnowledgeRequest = req.body;
      
      const knowledgeItem = await knowledgeService.createKnowledgeItem(userId, createData);

      // Log activity
      await activityService.logKnowledgeCreated(userId, knowledgeItem.id, knowledgeItem.title);

      logger.info('Knowledge item created successfully', {
        knowledgeId: knowledgeItem.id,
        authorId: userId,
        title: knowledgeItem.title
      });

      res.status(201).json({
        success: true,
        data: knowledgeItem,
        message: 'Knowledge item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get knowledge items with search and filtering
   * GET /api/knowledge
   */
  async getKnowledgeItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchOptions: KnowledgeSearchOptions = {
        search: req.query.search as string,
        type: req.query.type as any,
        difficulty: req.query.difficulty as any,
        category: req.query.category as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        authorId: req.query.authorId as string,
        projectId: req.query.projectId as string,
        status: req.query.status as any,
        isPublic: req.query.isPublic === 'true',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any
      };

      const result = await knowledgeService.searchKnowledgeItems(searchOptions);

      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        filters: result.filters,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific knowledge item by ID
   * GET /api/knowledge/:id
   */
  async getKnowledgeItemById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const knowledgeItem = await knowledgeService.getKnowledgeItemById(id);

      if (!knowledgeItem) {
        res.status(404).json({
          success: false,
          message: 'Knowledge item not found',
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
        return;
      }

      // Increment view count
      await knowledgeService.incrementViewCount(id);

      res.status(200).json({
        success: true,
        data: knowledgeItem,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a knowledge item
   * PUT /api/knowledge/:id
   */
  async updateKnowledgeItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
        return;
      }

      const updateData: UpdateKnowledgeRequest = req.body;
      
      const updatedItem = await knowledgeService.updateKnowledgeItem(id, userId, updateData);

      // Log activity
      await activityService.logKnowledgeUpdated(userId, id, updatedItem.title);

      logger.info('Knowledge item updated successfully', {
        knowledgeId: id,
        authorId: userId,
        title: updatedItem.title
      });

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Knowledge item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a knowledge item
   * DELETE /api/knowledge/:id
   */
  async deleteKnowledgeItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
        return;
      }

      await knowledgeService.deleteKnowledgeItem(id, userId);

      logger.info('Knowledge item deleted successfully', {
        knowledgeId: id,
        authorId: userId
      });

      res.status(200).json({
        success: true,
        message: 'Knowledge item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publish a knowledge item
   * PUT /api/knowledge/:id/publish
   */
  async publishKnowledgeItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
        return;
      }

      const publishedItem = await knowledgeService.publishKnowledgeItem(id, userId);

      logger.info('Knowledge item published successfully', {
        knowledgeId: id,
        authorId: userId,
        title: publishedItem.title
      });

      res.status(200).json({
        success: true,
        data: publishedItem,
        message: 'Knowledge item published successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Archive a knowledge item
   * PUT /api/knowledge/:id/archive
   */
  async archiveKnowledgeItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
        return;
      }

      const archivedItem = await knowledgeService.archiveKnowledgeItem(id, userId);

      logger.info('Knowledge item archived successfully', {
        knowledgeId: id,
        authorId: userId,
        title: archivedItem.title
      });

      res.status(200).json({
        success: true,
        data: archivedItem,
        message: 'Knowledge item archived successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get knowledge items by project
   * GET /api/knowledge/project/:projectId
   */
  async getKnowledgeItemsByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId } = req.params;
      const searchOptions: Partial<KnowledgeSearchOptions> = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        type: req.query.type as any,
        difficulty: req.query.difficulty as any
      };

      const result = await knowledgeService.getKnowledgeItemsByProject(projectId, searchOptions);

      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        filters: result.filters,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get knowledge items by author
   * GET /api/knowledge/author/:authorId
   */
  async getKnowledgeItemsByAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { authorId } = req.params;
      const searchOptions: Partial<KnowledgeSearchOptions> = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        type: req.query.type as any,
        difficulty: req.query.difficulty as any
      };

      const result = await knowledgeService.getKnowledgeItemsByAuthor(authorId, searchOptions);

      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        filters: result.filters,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get knowledge statistics
   * GET /api/knowledge/stats
   */
  async getKnowledgeStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await knowledgeService.getKnowledgeStats();

      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get knowledge stats failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Get featured/popular knowledge items
   * GET /api/knowledge/featured
   */
  async getFeaturedKnowledgeItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const items = await knowledgeService.getFeaturedKnowledgeItems(limit);

      res.status(200).json({
        success: true,
        data: { items },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get featured knowledge items failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Search knowledge items with advanced filtering
   * GET /api/knowledge/search
   */
  async searchKnowledgeItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
        return;
      }

      const options: KnowledgeSearchOptions = {
        search: req.query.search as string,
        type: req.query.type as any,
        difficulty: req.query.difficulty as any,
        status: req.query.status as any,
        category: req.query.category as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        projectId: req.query.projectId as string,
        authorId: req.query.authorId as string,
        isPublic: req.query.isPublic ? req.query.isPublic === 'true' : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 10, 50),
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };

      const result = await knowledgeService.searchKnowledgeItemsAdvanced(options);

      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        totalPages: result.totalPages,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Search knowledge items failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        options: req.query
      });
      next(error);
    }
  }
}

// Export singleton instance
export const knowledgeController = new KnowledgeController(); 