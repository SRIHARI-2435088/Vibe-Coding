// Standard API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  timestamp: string;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  pagination?: PaginationInfo;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  field?: string;
  details?: any;
  timestamp: string;
  path: string;
}

export interface ApiError {
  message: string;
  code: string;
  field?: string;
  details?: any;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// Query and Filter Types
export interface SearchParams {
  search?: string;
  filters?: Record<string, any>;
  projectId?: string;
  authorId?: string;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// File Upload Types
export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface FileUploadError {
  field: string;
  message: string;
  code: string;
}

// Request/Response Helpers
export type RequestWithUser<T = any> = T & {
  user: {
    id: string;
    email: string;
    role: string;
  };
};

export type RequestWithAuth<T = any> = T & {
  user?: {
    id: string;
    email: string;
    role: string;
  };
};

// Common HTTP Status Codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500
} 