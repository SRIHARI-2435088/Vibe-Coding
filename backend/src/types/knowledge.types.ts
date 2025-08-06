import { PaginationParams, SearchParams } from './api.types';

// Core Knowledge Types
export interface KnowledgeItem {
  id: string;
  title: string;
  description?: string;
  content: string;
  type: KnowledgeType;
  category: string;
  tags: string[];
  difficulty: DifficultyLevel;
  status: ContentStatus;
  isPublic: boolean;
  viewCount: number;
  authorId: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;

  // Populated relationships
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  project?: {
    id: string;
    name: string;
  };
  attachments?: Attachment[];
  comments?: Comment[];
  reviews?: Review[];
  _count?: {
    comments: number;
    reviews: number;
    attachments: number;
  };
}

export interface CreateKnowledgeRequest {
  title: string;
  description?: string;
  content: string;
  type: KnowledgeType;
  category?: string;
  tags?: string[];
  difficulty?: DifficultyLevel;
  projectId: string;
  isPublic?: boolean;
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

export interface KnowledgeSearchParams extends SearchParams, PaginationParams {
  type?: KnowledgeType;
  difficulty?: DifficultyLevel;
  status?: ContentStatus;
  isPublic?: boolean;
  tags?: string[];
  category?: string;
}

// Attachment Types
export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  mimeType: string;
  isVideo: boolean;
  videoDuration?: number;
  thumbnailPath?: string;
  knowledgeItemId: string;
  uploadedAt: Date;
  annotations?: VideoAnnotation[];
}

export interface VideoAnnotation {
  id: string;
  attachmentId: string;
  timestamp: number;
  title: string;
  description?: string;
  annotationType: AnnotationType;
  createdAt: Date;
}

export interface CreateAttachmentRequest {
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  mimeType: string;
  isVideo?: boolean;
  videoDuration?: number;
  thumbnailPath?: string;
}

export interface CreateVideoAnnotationRequest {
  timestamp: number;
  title: string;
  description?: string;
  annotationType: AnnotationType;
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  parentId?: string;
  authorId: string;
  knowledgeItemId: string;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated relationships
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  replies?: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
  knowledgeItemId: string;
}

export interface UpdateCommentRequest {
  content?: string;
  isResolved?: boolean;
}

// Review Types
export interface Review {
  id: string;
  rating: number;
  feedback?: string;
  isHelpful?: boolean;
  reviewerId: string;
  knowledgeItemId: string;
  createdAt: Date;
  
  // Populated relationships
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

export interface CreateReviewRequest {
  rating: number;
  feedback?: string;
  isHelpful?: boolean;
  knowledgeItemId: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  feedback?: string;
  isHelpful?: boolean;
}

// Knowledge Statistics
export interface KnowledgeStats {
  totalItems: number;
  publishedItems: number;
  draftItems: number;
  averageRating: number;
  totalViews: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
}

// Enums
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
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum AnnotationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  TIP = 'TIP',
  IMPORTANT = 'IMPORTANT',
  QUESTION = 'QUESTION'
}

// Knowledge Management Types
// Matching the Prisma schema and frontend requirements

export interface KnowledgeItemWithRelations extends KnowledgeItem {
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  project: {
    id: string;
    name: string;
  };
  attachmentCount?: number;
  commentCount?: number;
  reviewCount?: number;
  averageRating?: number;
}

export interface KnowledgeSearchOptions {
  search?: string;
  type?: KnowledgeType;
  difficulty?: DifficultyLevel;
  category?: string;
  tags?: string[];
  authorId?: string;
  projectId?: string;
  status?: ContentStatus;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'viewCount' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface KnowledgeSearchResult {
  items: KnowledgeItemWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    totalByType: Record<KnowledgeType, number>;
    totalByDifficulty: Record<DifficultyLevel, number>;
    totalByStatus: Record<ContentStatus, number>;
  };
}

// Validation schemas (for express-validator)
export const createKnowledgeValidation = {
  title: {
    notEmpty: true,
    isLength: { options: { min: 1, max: 200 } },
    errorMessage: 'Title must be between 1 and 200 characters'
  },
  content: {
    notEmpty: true,
    isLength: { options: { min: 10 } },
    errorMessage: 'Content must be at least 10 characters long'
  },
  type: {
    isIn: {
      options: [Object.values(KnowledgeType)],
      errorMessage: 'Invalid knowledge type'
    }
  },
  projectId: {
    notEmpty: true,
    errorMessage: 'Project ID is required'
  }
};

export const updateKnowledgeValidation = {
  title: {
    optional: true,
    isLength: { options: { min: 1, max: 200 } },
    errorMessage: 'Title must be between 1 and 200 characters'
  },
  content: {
    optional: true,
    isLength: { options: { min: 10 } },
    errorMessage: 'Content must be at least 10 characters long'
  },
  type: {
    optional: true,
    isIn: {
      options: [Object.values(KnowledgeType)],
      errorMessage: 'Invalid knowledge type'
    }
  }
}; 