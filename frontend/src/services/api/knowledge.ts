import { apiClient } from './client';
import { handleApiError } from '@/lib/error-handler';

// Knowledge Types (matching backend)
export interface KnowledgeItem {
  id: string;
  title: string;
  description?: string;
  content: string;
  type: KnowledgeType;
  category?: string;
  tags: string[];
  difficulty: DifficultyLevel;
  status: ContentStatus;
  isPublic: boolean;
  viewCount: number;
  rating?: number;
  authorId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  
  // Relations
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
  attachmentCount?: number;
}

export enum KnowledgeType {
  TECHNICAL = 'TECHNICAL',
  BUSINESS = 'BUSINESS',
  PROCESS = 'PROCESS',
  CULTURAL = 'CULTURAL',
  TROUBLESHOOTING = 'TROUBLESHOOTING',
  BEST_PRACTICE = 'BEST_PRACTICE'
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface CreateKnowledgeRequest {
  title: string;
  description?: string;
  content: string;
  type: KnowledgeType;
  category?: string;
  tags: string[];
  difficulty?: DifficultyLevel;
  isPublic?: boolean;
  projectId: string;
}

export interface UpdateKnowledgeRequest {
  title?: string;
  description?: string;
  content?: string;
  type?: KnowledgeType;
  category?: string;
  tags?: string[];
  difficulty?: DifficultyLevel;
  status?: ContentStatus;
  isPublic?: boolean;
}

export interface KnowledgeSearchOptions {
  search?: string;
  type?: KnowledgeType;
  difficulty?: DifficultyLevel;
  category?: string;
  tags?: string[];
  status?: ContentStatus;
  projectId?: string;
  authorId?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'viewCount' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface KnowledgeSearchResult {
  items: KnowledgeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Knowledge API Service
 * Handles all knowledge-related API operations
 */
export const knowledgeApi = {
  /**
   * Search and list knowledge items
   */
  async searchKnowledge(options: KnowledgeSearchOptions = {}): Promise<KnowledgeSearchResult> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.get<PaginatedResponse<KnowledgeItem[]>>(
        `/knowledge?${params.toString()}`
      );

      return {
        items: response.data.data,
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.pages,
      };
    } catch (error) {
      console.error('Failed to search knowledge:', error);
      throw handleApiError(error, 'Failed to load knowledge items');
    }
  },

  /**
   * Get a single knowledge item by ID
   */
  async getKnowledgeById(id: string): Promise<KnowledgeItem> {
    try {
      const response = await apiClient.get<ApiResponse<KnowledgeItem>>(`/knowledge/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get knowledge item:', error);
      throw handleApiError(error, 'Failed to load knowledge item');
    }
  },

  /**
   * Create a new knowledge item
   */
  async createKnowledge(data: CreateKnowledgeRequest): Promise<KnowledgeItem> {
    try {
      const response = await apiClient.post<ApiResponse<KnowledgeItem>>('/knowledge', data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create knowledge item:', error);
      throw handleApiError(error, 'Failed to create knowledge item');
    }
  },

  /**
   * Update an existing knowledge item
   */
  async updateKnowledge(id: string, data: UpdateKnowledgeRequest): Promise<KnowledgeItem> {
    try {
      const response = await apiClient.put<ApiResponse<KnowledgeItem>>(`/knowledge/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update knowledge item:', error);
      throw handleApiError(error, 'Failed to update knowledge item');
    }
  },

  /**
   * Delete a knowledge item
   */
  async deleteKnowledge(id: string): Promise<void> {
    try {
      await apiClient.delete(`/knowledge/${id}`);
    } catch (error) {
      console.error('Failed to delete knowledge item:', error);
      throw handleApiError(error, 'Failed to delete knowledge item');
    }
  },

  /**
   * Increment view count for a knowledge item
   */
  async incrementViewCount(id: string): Promise<void> {
    try {
      await apiClient.post(`/knowledge/${id}/view`);
    } catch (error) {
      console.error('Failed to increment view count:', error);
      // Don't throw error for view count as it's not critical
    }
  },

  /**
   * Get popular knowledge items
   */
  async getPopularKnowledge(limit: number = 10): Promise<KnowledgeItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<KnowledgeItem[]>>(
        `/knowledge/popular?limit=${limit}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get popular knowledge:', error);
      throw handleApiError(error, 'Failed to load popular knowledge items');
    }
  },

  /**
   * Get recent knowledge items
   */
  async getRecentKnowledge(limit: number = 10): Promise<KnowledgeItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<KnowledgeItem[]>>(
        `/knowledge/recent?limit=${limit}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get recent knowledge:', error);
      throw handleApiError(error, 'Failed to load recent knowledge items');
    }
  },

  /**
   * Get knowledge items by author
   */
  async getKnowledgeByAuthor(authorId: string, options: KnowledgeSearchOptions = {}): Promise<KnowledgeSearchResult> {
    try {
      return await knowledgeApi.searchKnowledge({
        ...options,
        authorId,
      });
    } catch (error) {
      console.error('Failed to get knowledge by author:', error);
      throw handleApiError(error, 'Failed to load author knowledge items');
    }
  },

  /**
   * Get knowledge items by project
   */
  async getKnowledgeByProject(projectId: string, options: KnowledgeSearchOptions = {}): Promise<KnowledgeSearchResult> {
    try {
      return await knowledgeApi.searchKnowledge({
        ...options,
        projectId,
      });
    } catch (error) {
      console.error('Failed to get knowledge by project:', error);
      throw handleApiError(error, 'Failed to load project knowledge items');
    }
  }
};

/**
 * Knowledge utility functions
 */
export const knowledgeUtils = {
  /**
   * Get display color for knowledge type
   */
  getTypeColor: (type: KnowledgeType): string => {
    switch (type) {
      case KnowledgeType.TECHNICAL:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case KnowledgeType.BUSINESS:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case KnowledgeType.PROCESS:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case KnowledgeType.CULTURAL:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case KnowledgeType.TROUBLESHOOTING:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case KnowledgeType.BEST_PRACTICE:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  },

  /**
   * Get display color for difficulty level
   */
  getDifficultyColor: (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case DifficultyLevel.INTERMEDIATE:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case DifficultyLevel.ADVANCED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  },

  /**
   * Get display color for content status
   */
  getStatusColor: (status: ContentStatus): string => {
    switch (status) {
      case ContentStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case ContentStatus.UNDER_REVIEW:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case ContentStatus.PUBLISHED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case ContentStatus.ARCHIVED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  },

  /**
   * Format author name
   */
  formatAuthorName: (author?: { firstName: string; lastName: string }): string => {
    if (!author) return 'Unknown Author';
    return `${author.firstName} ${author.lastName}`;
  },

  /**
   * Format relative date
   */
  formatRelativeDate: (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  },

  /**
   * Truncate text to specified length
   */
  truncateText: (text: string, length: number): string => {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
  },

  /**
   * Validate knowledge item data
   */
  validateKnowledgeData: (data: CreateKnowledgeRequest): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (data.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Content is required');
    } else if (data.content.length < 10) {
      errors.push('Content must be at least 10 characters long');
    }

    if (!data.type) {
      errors.push('Knowledge type is required');
    }

    if (!data.projectId) {
      errors.push('Project selection is required');
    }

    if (data.tags.length === 0) {
      errors.push('At least one tag is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}; 