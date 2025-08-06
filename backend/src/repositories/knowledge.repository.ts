import { KnowledgeItem, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface CreateKnowledgeData {
  title: string;
  description?: string;
  content: string;
  type: string;
  category?: string;
  tags?: string[];
  difficulty?: string;
  status?: string;
  isPublic?: boolean;
  authorId: string;
  projectId: string;
}

export interface UpdateKnowledgeData {
  title?: string;
  description?: string;
  content?: string;
  type?: string;
  category?: string;
  tags?: string[];
  difficulty?: string;
  status?: string;
  isPublic?: boolean;
  publishedAt?: Date;
}

export interface FindKnowledgeOptions {
  search?: string;
  type?: string;
  difficulty?: string;
  category?: string;
  tags?: string[];
  authorId?: string;
  projectId?: string;
  status?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

export interface KnowledgeWithRelations extends KnowledgeItem {
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  project: {
    id: string;
    name: string;
  };
  _count: {
    comments: number;
    reviews: number;
    attachments: number;
  };
}

/**
 * Knowledge Repository
 * Handles all database operations related to knowledge items
 */
export class KnowledgeRepository extends BaseRepository {
  /**
   * Create a new knowledge item
   */
  async create(data: CreateKnowledgeData): Promise<KnowledgeWithRelations> {
    try {
      const knowledgeItem = await this.prisma.knowledgeItem.create({
        data: {
          title: data.title,
          description: data.description,
          content: data.content,
          type: data.type as any,
          category: data.category,
          tags: JSON.stringify(data.tags || []),
          difficulty: data.difficulty as any || 'INTERMEDIATE',
          status: data.status as any || 'DRAFT',
          isPublic: data.isPublic || false,
          authorId: data.authorId,
          projectId: data.projectId,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
              reviews: true,
              attachments: true,
            },
          },
        },
      });

      return this.formatKnowledgeItem(knowledgeItem);
    } catch (error) {
      this.handlePrismaError(error, 'create knowledge item');
    }
  }

  /**
   * Find knowledge item by ID
   */
  async findById(id: string): Promise<KnowledgeWithRelations | null> {
    try {
      const item = await this.prisma.knowledgeItem.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
              reviews: true,
              attachments: true,
            },
          },
        },
      });

      return item ? this.formatKnowledgeItem(item) : null;
    } catch (error) {
      this.handlePrismaError(error, 'find knowledge item by id');
    }
  }

  /**
   * Update knowledge item
   */
  async update(id: string, data: UpdateKnowledgeData): Promise<KnowledgeWithRelations> {
    try {
      const updateData: any = {
        ...data,
        updatedAt: new Date(),
      };

      if (data.tags) {
        updateData.tags = JSON.stringify(data.tags);
      }

      const item = await this.prisma.knowledgeItem.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
              reviews: true,
              attachments: true,
            },
          },
        },
      });

      return this.formatKnowledgeItem(item);
    } catch (error) {
      this.handlePrismaError(error, 'update knowledge item');
    }
  }

  /**
   * Delete knowledge item
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.knowledgeItem.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error, 'delete knowledge item');
    }
  }

  /**
   * Find knowledge items with search and filtering
   */
  async findMany(options: FindKnowledgeOptions = {}) {
    try {
      const { skip, take, page, limit } = this.buildPagination(options.page, options.limit);

      // Build where conditions
      const where: Prisma.KnowledgeItemWhereInput = {};

      if (options.search) {
        const searchConditions = this.buildSearchConditions(
          options.search,
          ['title', 'description', 'content', 'category']
        );
        if (searchConditions) {
          where.OR = searchConditions;
        }
      }

      if (options.type) {
        where.type = options.type as any;
      }

      if (options.difficulty) {
        where.difficulty = options.difficulty as any;
      }

      if (options.category) {
        where.category = options.category;
      }

      if (options.authorId) {
        where.authorId = options.authorId;
      }

      if (options.projectId) {
        where.projectId = options.projectId;
      }

      if (options.status) {
        where.status = options.status as any;
      }

      if (options.isPublic !== undefined) {
        where.isPublic = options.isPublic;
      }

      if (options.tags && options.tags.length > 0) {
        // For tags search, we need to handle JSON search
        where.AND = options.tags.map(tag => ({
          tags: {
            contains: tag,
          },
        }));
      }

      // Build order by
      const orderBy: Prisma.KnowledgeItemOrderByWithRelationInput = {};
      const sortBy = options.sortBy || 'createdAt';
      const sortOrder = options.sortOrder || 'desc';
      orderBy[sortBy] = sortOrder;

      // Execute queries in parallel
      const [items, total] = await Promise.all([
        this.prisma.knowledgeItem.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePicture: true,
              },
            },
            project: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                comments: true,
                reviews: true,
                attachments: true,
              },
            },
          },
        }),
        this.prisma.knowledgeItem.count({ where }),
      ]);

      const pagination = this.calculatePagination(total, page, limit);
      const formattedItems = items.map(item => this.formatKnowledgeItem(item));

      return {
        items: formattedItems,
        pagination,
      };
    } catch (error) {
      this.handlePrismaError(error, 'find knowledge items');
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    try {
      await this.prisma.knowledgeItem.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'increment view count');
    }
  }

  /**
   * Find knowledge items by project
   */
  async findByProject(projectId: string, options: Partial<FindKnowledgeOptions> = {}) {
    return this.findMany({
      ...options,
      projectId,
    });
  }

  /**
   * Find knowledge items by author
   */
  async findByAuthor(authorId: string, options: Partial<FindKnowledgeOptions> = {}) {
    return this.findMany({
      ...options,
      authorId,
    });
  }

  /**
   * Get knowledge statistics
   */
  async getStatistics() {
    try {
      const [
        total,
        published,
        draft,
        byType,
        byDifficulty,
      ] = await Promise.all([
        this.prisma.knowledgeItem.count(),
        this.prisma.knowledgeItem.count({
          where: { status: 'PUBLISHED' },
        }),
        this.prisma.knowledgeItem.count({
          where: { status: 'DRAFT' },
        }),
        this.prisma.knowledgeItem.groupBy({
          by: ['type'],
          _count: { type: true },
        }),
        this.prisma.knowledgeItem.groupBy({
          by: ['difficulty'],
          _count: { difficulty: true },
        }),
      ]);

      return {
        total,
        published,
        draft,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {} as Record<string, number>),
        byDifficulty: byDifficulty.reduce((acc, item) => {
          acc[item.difficulty] = item._count.difficulty;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      this.handlePrismaError(error, 'get knowledge statistics');
    }
  }

  /**
   * Search by full text
   */
  async fullTextSearch(query: string, options: Partial<FindKnowledgeOptions> = {}) {
    return this.findMany({
      ...options,
      search: query,
    });
  }

  /**
   * Find related knowledge items
   */
  async findRelated(id: string, limit = 5): Promise<KnowledgeWithRelations[]> {
    try {
      const currentItem = await this.findById(id);
      if (!currentItem) {
        return [];
      }

      // Find items with similar tags, category, or type
      const items = await this.prisma.knowledgeItem.findMany({
        where: {
          AND: [
            { id: { not: id } },
            { status: 'PUBLISHED' },
            {
              OR: [
                { type: currentItem.type },
                { category: currentItem.category },
                { projectId: currentItem.projectId },
              ],
            },
          ],
        },
        take: limit,
        orderBy: { viewCount: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
              reviews: true,
              attachments: true,
            },
          },
        },
      });

      return items.map(item => this.formatKnowledgeItem(item));
    } catch (error) {
      this.handlePrismaError(error, 'find related knowledge items');
    }
  }

  /**
   * Format knowledge item with parsed tags
   */
  private formatKnowledgeItem(item: any): KnowledgeWithRelations {
    return {
      ...item,
      tags: item.tags ? JSON.parse(item.tags) : [],
    };
  }
} 