import { Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse, PaginationInfo } from '../types/api.types';

/**
 * Send a standardized success response
 */
export const sendSuccessResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  pagination?: PaginationInfo
): void => {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...(message && { message }),
    ...(pagination && { pagination }),
  };

  res.status(statusCode).json(response);
};

/**
 * Send a standardized error response
 */
export const sendErrorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_ERROR',
  field?: string,
  details?: any
): void => {
  const response: ApiErrorResponse = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
    path: res.req.originalUrl,
    ...(field && { field }),
    ...(details && { details }),
  };

  res.status(statusCode).json(response);
};

/**
 * Send a standardized created response (201)
 */
export const sendCreatedResponse = <T>(
  res: Response,
  data: T,
  message?: string
): void => {
  sendSuccessResponse(res, data, message || 'Resource created successfully', 201);
};

/**
 * Send a standardized no content response (204)
 */
export const sendNoContentResponse = (res: Response): void => {
  res.status(204).send();
};

/**
 * Send a standardized bad request error (400)
 */
export const sendBadRequestError = (
  res: Response,
  message: string = 'Bad request',
  field?: string,
  details?: any
): void => {
  sendErrorResponse(res, message, 400, 'BAD_REQUEST', field, details);
};

/**
 * Send a standardized unauthorized error (401)
 */
export const sendUnauthorizedError = (
  res: Response,
  message: string = 'Unauthorized access'
): void => {
  sendErrorResponse(res, message, 401, 'UNAUTHORIZED');
};

/**
 * Send a standardized forbidden error (403)
 */
export const sendForbiddenError = (
  res: Response,
  message: string = 'Forbidden'
): void => {
  sendErrorResponse(res, message, 403, 'FORBIDDEN');
};

/**
 * Send a standardized not found error (404)
 */
export const sendNotFoundError = (
  res: Response,
  resource: string = 'Resource'
): void => {
  sendErrorResponse(res, `${resource} not found`, 404, 'NOT_FOUND');
};

/**
 * Send a standardized conflict error (409)
 */
export const sendConflictError = (
  res: Response,
  message: string,
  field?: string
): void => {
  sendErrorResponse(res, message, 409, 'CONFLICT', field);
};

/**
 * Send a standardized validation error (422)
 */
export const sendValidationError = (
  res: Response,
  message: string,
  field?: string,
  details?: any
): void => {
  sendErrorResponse(res, message, 422, 'VALIDATION_ERROR', field, details);
};

/**
 * Send a standardized too many requests error (429)
 */
export const sendTooManyRequestsError = (
  res: Response,
  message: string = 'Too many requests'
): void => {
  sendErrorResponse(res, message, 429, 'TOO_MANY_REQUESTS');
};

/**
 * Send a standardized internal server error (500)
 */
export const sendInternalServerError = (
  res: Response,
  message: string = 'Internal server error'
): void => {
  sendErrorResponse(res, message, 500, 'INTERNAL_ERROR');
};

/**
 * Create pagination info object
 */
export const createPaginationInfo = (
  page: number,
  limit: number,
  total: number
): PaginationInfo => {
  const pages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
};

/**
 * Send paginated response
 */
export const sendPaginatedResponse = <T>(
  res: Response,
  items: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): void => {
  const pagination = createPaginationInfo(page, limit, total);
  
  const response = {
    items,
    pagination,
  };

  sendSuccessResponse(res, response, message);
};

/**
 * Extract pagination parameters from query
 */
export const extractPaginationParams = (query: any): {
  page: number;
  limit: number;
} => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10)); // Max 100 items per page
  
  return { page, limit };
};

/**
 * Extract sorting parameters from query
 */
export const extractSortParams = (query: any): {
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
} => {
  const sortBy = query.sortBy || undefined;
  const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';
  
  return { sortBy, sortOrder };
};

/**
 * Extract search parameters from query
 */
export const extractSearchParams = (query: any): {
  search?: string;
  filters: Record<string, any>;
} => {
  const search = query.search || undefined;
  
  // Extract filter parameters (anything starting with 'filter_')
  const filters: Record<string, any> = {};
  Object.keys(query).forEach(key => {
    if (key.startsWith('filter_')) {
      const filterName = key.replace('filter_', '');
      filters[filterName] = query[key];
    }
  });
  
  return { search, filters };
};

// Aliases for backward compatibility
export const sendNotFoundResponse = sendNotFoundError;
export const sendBadRequestResponse = sendBadRequestError; 