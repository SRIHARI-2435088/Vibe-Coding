import { 
  CreateKnowledgeRequest, 
  UpdateKnowledgeRequest, 
  KnowledgeItem,
  KnowledgeSearchOptions,
  ContentStatus
} from '../types/knowledge.types';
import { simpleDb } from '../config/simple-db';

// Helper function to generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Knowledge Service
 * Handles all knowledge-related business logic and database operations
 */
export class KnowledgeService {
  /**
   * Create a new knowledge item
   */
  async createKnowledgeItem(
    authorId: string, 
    data: CreateKnowledgeRequest
  ): Promise<any> {
    try {
      // Validate required fields
      if (!data.title || data.title.trim().length === 0) {
        throw new Error('Title is required');
      }

      if (!data.content || data.content.trim().length < 10) {
        throw new Error('Content must be at least 10 characters long');
      }

      if (!data.projectId) {
        throw new Error('Project ID is required');
      }

      const knowledgeData = {
        id: generateId(),
        title: data.title.trim(),
        description: data.description?.trim() || '',
        content: data.content.trim(),
        type: data.type || 'TECHNICAL',
        category: data.category?.trim() || '',
        tags: JSON.stringify(data.tags || []),
        difficulty: data.difficulty || 'INTERMEDIATE',
        status: 'DRAFT',
        isPublic: data.isPublic ? 1 : 0,
        viewCount: 0,
        authorId,
        projectId: data.projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: null
      };

      // Create the knowledge item
      const result = await simpleDb.createKnowledgeItem(knowledgeData);
      return result;

    } catch (error) {
      console.error('Error creating knowledge item:', error);
      throw error;
    }
  }

  /**
   * Get knowledge item by ID
   */
  async getKnowledgeItemById(id: string): Promise<any> {
    try {
      const item = await simpleDb.findKnowledgeById(id);
      if (!item) {
        return null;
      }

      // Get author information
      const author = await simpleDb.findUserById(item.authorId);
      const project = await simpleDb.findProjectById(item.projectId);

      return {
        ...item,
        tags: item.tags ? JSON.parse(item.tags) : [],
        isPublic: Boolean(item.isPublic),
        author: author ? {
          id: author.id,
          firstName: author.firstName,
          lastName: author.lastName,
          email: author.email
        } : null,
        project: project ? {
          id: project.id,
          name: project.name
        } : null
      };
    } catch (error) {
      console.error('Error getting knowledge item by ID:', error);
      throw error;
    }
  }

  /**
   * Get all knowledge items with basic filtering
   */
  async getKnowledgeItems(options: KnowledgeSearchOptions = {}): Promise<any> {
    try {
      const {
        projectId,
        search,
        type,
        difficulty,
        status = 'PUBLISHED',
        page = 1,
        limit = 10
      } = options;

      // Basic implementation - get all and filter in memory for now
      const allItems = await simpleDb.getAllKnowledgeItems();
      
      let filteredItems = allItems;

      // Apply filters
      if (projectId) {
        filteredItems = filteredItems.filter(item => item.projectId === projectId);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredItems = filteredItems.filter(item => 
          item.title.toLowerCase().includes(searchLower) ||
          item.content.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
        );
      }

      if (type) {
        filteredItems = filteredItems.filter(item => item.type === type);
      }

      if (difficulty) {
        filteredItems = filteredItems.filter(item => item.difficulty === difficulty);
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = filteredItems.slice(startIndex, endIndex);

      return {
        items: paginatedItems,
        total: filteredItems.length,
        page,
        limit,
        totalPages: Math.ceil(filteredItems.length / limit)
      };

    } catch (error) {
      console.error('Error getting knowledge items:', error);
      throw error;
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    try {
      await simpleDb.incrementKnowledgeViewCount(id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
      throw error;
    }
  }

  /**
   * Update knowledge item with authorization
   */
  async updateKnowledgeItem(
    id: string,
    userId: string,
    data: UpdateKnowledgeRequest
  ): Promise<any> {
    try {
      // Check if item exists and user has permission
      const existingItem = await simpleDb.findKnowledgeById(id);
      if (!existingItem) {
        throw new Error('Knowledge item not found');
      }

      if (existingItem.authorId !== userId) {
        throw new Error('Permission denied: You can only update your own knowledge items');
      }

      const updateData = {
        ...data,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
        isPublic: data.isPublic !== undefined ? (data.isPublic ? 1 : 0) : undefined,
        updatedAt: new Date().toISOString(),
        publishedAt: data.status === 'PUBLISHED' ? new Date().toISOString() : undefined
      };

      const result = await simpleDb.updateKnowledgeItem(id, updateData);
      return this.getKnowledgeItemById(id); // Return full item with relations
    } catch (error) {
      console.error('Error updating knowledge item:', error);
      throw error;
    }
  }

  /**
   * Delete knowledge item with authorization
   */
  async deleteKnowledgeItem(id: string, userId: string): Promise<boolean> {
    try {
      // Check if item exists and user has permission
      const existingItem = await simpleDb.findKnowledgeById(id);
      if (!existingItem) {
        throw new Error('Knowledge item not found');
      }

      if (existingItem.authorId !== userId) {
        throw new Error('Permission denied: You can only delete your own knowledge items');
      }

      const result = await simpleDb.deleteKnowledgeItem(id);
      return result;
    } catch (error) {
      console.error('Error deleting knowledge item:', error);
      throw error;
    }
  }

  /**
   * Publish knowledge item
   */
  async publishKnowledgeItem(id: string, userId: string): Promise<any> {
    try {
      const updateData = {
        status: 'PUBLISHED' as ContentStatus,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.updateKnowledgeItem(id, userId, updateData);
      return this.getKnowledgeItemById(id);
    } catch (error) {
      console.error('Error publishing knowledge item:', error);
      throw error;
    }
  }

  /**
   * Archive knowledge item
   */
  async archiveKnowledgeItem(id: string, userId: string): Promise<any> {
    try {
      const updateData = {
        status: 'ARCHIVED' as ContentStatus,
        updatedAt: new Date().toISOString()
      };

      await this.updateKnowledgeItem(id, userId, updateData);
      return this.getKnowledgeItemById(id);
    } catch (error) {
      console.error('Error archiving knowledge item:', error);
      throw error;
    }
  }

  /**
   * Enhanced search knowledge items
   */
  async searchKnowledgeItems(options: KnowledgeSearchOptions = {}): Promise<any> {
    try {
      const {
        search,
        type,
        difficulty,
        status = 'PUBLISHED',
        category,
        tags,
        authorId,
        projectId,
        isPublic,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Get all items and filter
      const allItems = await simpleDb.getAllKnowledgeItems();
      let filteredItems = allItems;

      // Apply filters
      if (projectId) {
        filteredItems = filteredItems.filter(item => item.projectId === projectId);
      }

      if (authorId) {
        filteredItems = filteredItems.filter(item => item.authorId === authorId);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredItems = filteredItems.filter(item => 
          item.title.toLowerCase().includes(searchLower) ||
          item.content.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower))
        );
      }

      if (type) {
        filteredItems = filteredItems.filter(item => item.type === type);
      }

      if (difficulty) {
        filteredItems = filteredItems.filter(item => item.difficulty === difficulty);
      }

      if (status) {
        filteredItems = filteredItems.filter(item => item.status === status);
      }

      if (category) {
        filteredItems = filteredItems.filter(item => item.category === category);
      }

      if (isPublic !== undefined) {
        filteredItems = filteredItems.filter(item => Boolean(item.isPublic) === isPublic);
      }

      if (tags && tags.length > 0) {
        filteredItems = filteredItems.filter(item => {
          const itemTags = item.tags ? JSON.parse(item.tags) : [];
          return tags.some(tag => itemTags.includes(tag));
        });
      }

      // Apply sorting
      filteredItems.sort((a, b) => {
        let aValue: any = a[sortBy as keyof typeof a];
        let bValue: any = b[sortBy as keyof typeof b];

        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const total = filteredItems.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = filteredItems.slice(startIndex, endIndex);

      // Enhance items with author and project info
      const enhancedItems = await Promise.all(
        paginatedItems.map(async (item) => {
          const author = await simpleDb.findUserById(item.authorId);
          const project = await simpleDb.findProjectById(item.projectId);

          return {
            ...item,
            tags: item.tags ? JSON.parse(item.tags) : [],
            isPublic: Boolean(item.isPublic),
            author: author ? {
              id: author.id,
              firstName: author.firstName,
              lastName: author.lastName,
              email: author.email
            } : null,
            project: project ? {
              id: project.id,
              name: project.name
            } : null
          };
        })
      );

      return {
        items: enhancedItems,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          search,
          type,
          difficulty,
          status,
          category,
          tags,
          authorId,
          projectId,
          isPublic
        }
      };
    } catch (error) {
      console.error('Error searching knowledge items:', error);
      throw error;
    }
  }

  /**
   * Get knowledge items by project
   */
  async getKnowledgeItemsByProject(
    projectId: string,
    options: Partial<KnowledgeSearchOptions> = {}
  ): Promise<any> {
    return this.searchKnowledgeItems({
      ...options,
      projectId
    });
  }

  /**
   * Get knowledge items by author
   */
  async getKnowledgeItemsByAuthor(
    authorId: string,
    options: Partial<KnowledgeSearchOptions> = {}
  ): Promise<any> {
    return this.searchKnowledgeItems({
      ...options,
      authorId
    });
  }

  /**
   * Search knowledge items (legacy method for backward compatibility)
   */
  async searchKnowledgeItems_old(query: string, options: KnowledgeSearchOptions = {}): Promise<any> {
    return this.getKnowledgeItems({
      ...options,
      search: query
    });
  }

  /**
   * Get knowledge statistics
   */
  async getKnowledgeStats(): Promise<any> {
    try {
      const knowledge = await simpleDb.getAllKnowledgeItems();

      const total = knowledge.length;
      const published = knowledge.filter((item: any) => item.status === 'PUBLISHED').length;
      const drafts = knowledge.filter((item: any) => item.status === 'DRAFT').length;
      const archived = knowledge.filter((item: any) => item.status === 'ARCHIVED').length;

      // Get popular tags
      const allTags: string[] = [];
      knowledge.forEach((item: any) => {
        if (item.tags) {
          try {
            const tags = JSON.parse(item.tags);
            allTags.push(...tags);
          } catch (e) {
            // Ignore parsing errors
          }
        }
      });

      const tagCounts: { [key: string]: number } = {};
      allTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      const popularTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get weekly stats (mock data for now)
      const weeklyViews = Math.floor(Math.random() * 1000) + 100;

      return {
        total,
        published,
        drafts,
        archived,
        myContributions: 0, // Will be calculated based on user context
        weeklyViews,
        popularTags
      };
    } catch (error) {
      console.error('Error getting knowledge stats:', error);
      throw new Error('Failed to get knowledge statistics');
    }
  }

  /**
   * Get featured/popular knowledge items
   */
  async getFeaturedKnowledgeItems(limit: number = 10): Promise<any[]> {
    try {
      const knowledge = await simpleDb.getAllKnowledgeItems();

      // Filter for published items and sort by view count (mock sorting for now)
      const featuredItems = knowledge
        .filter((item: any) => item.status === 'PUBLISHED' && item.isPublic !== false)
        .sort((a: any, b: any) => {
          // Sort by created date as a proxy for popularity
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, limit)
        .map((item: any) => ({
          ...item,
          tags: item.tags ? JSON.parse(item.tags) : [],
          viewCount: Math.floor(Math.random() * 100) + 10, // Mock view count
          rating: Math.floor(Math.random() * 50) / 10 + 1 // Mock rating 1-5
        }));

      return featuredItems;
    } catch (error) {
      console.error('Error getting featured knowledge items:', error);
      throw new Error('Failed to get featured knowledge items');
    }
  }

  /**
   * Search knowledge items with advanced filtering
   */
  async searchKnowledgeItemsAdvanced(options: KnowledgeSearchOptions): Promise<{
    items: any[];
    pagination: any;
    totalPages: number;
  }> {
    try {
      let knowledge = await simpleDb.getAllKnowledgeItems();

      // Apply filters
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        knowledge = knowledge.filter((item: any) => 
          item.title?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.content?.toLowerCase().includes(searchLower) ||
          item.category?.toLowerCase().includes(searchLower)
        );
      }

      if (options.type) {
        knowledge = knowledge.filter((item: any) => item.type === options.type);
      }

      if (options.difficulty) {
        knowledge = knowledge.filter((item: any) => item.difficulty === options.difficulty);
      }

      if (options.status) {
        knowledge = knowledge.filter((item: any) => item.status === options.status);
      }

      if (options.category) {
        knowledge = knowledge.filter((item: any) => 
          item.category?.toLowerCase().includes(options.category!.toLowerCase())
        );
      }

      if (options.projectId) {
        knowledge = knowledge.filter((item: any) => item.projectId === options.projectId);
      }

      if (options.authorId) {
        knowledge = knowledge.filter((item: any) => item.authorId === options.authorId);
      }

      if (options.isPublic !== undefined) {
        knowledge = knowledge.filter((item: any) => item.isPublic === options.isPublic);
      }

      if (options.tags && options.tags.length > 0) {
        knowledge = knowledge.filter((item: any) => {
          if (!item.tags) return false;
          try {
            const itemTags = JSON.parse(item.tags);
            return options.tags!.some(tag => itemTags.includes(tag));
          } catch (e) {
            return false;
          }
        });
      }

      // Date filtering can be added to KnowledgeSearchOptions type if needed

      // Sort
      const sortBy = options.sortBy || 'createdAt';
      const sortOrder = options.sortOrder || 'desc';

      knowledge.sort((a: any, b: any) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }

        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      // Pagination
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;
      const total = knowledge.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedItems = knowledge.slice(offset, offset + limit);

      // Format items
      const formattedItems = paginatedItems.map((item: any) => ({
        ...item,
        tags: item.tags ? JSON.parse(item.tags) : [],
        viewCount: Math.floor(Math.random() * 100) + 1, // Mock view count
        rating: Math.floor(Math.random() * 50) / 10 + 1 // Mock rating 1-5
      }));

      return {
        items: formattedItems,
        pagination: {
          page,
          limit,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        totalPages
      };
    } catch (error) {
      console.error('Error searching knowledge items:', error);
      throw new Error('Failed to search knowledge items');
    }
  }
}

// Export singleton instance
export const knowledgeService = new KnowledgeService(); 