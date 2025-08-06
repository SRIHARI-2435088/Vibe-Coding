import { AxiosError } from 'axios';
import { toast } from '@/hooks/useToast';

interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  field?: string;
  timestamp?: string;
  path?: string;
}

export class ApiErrorHandler {
  /**
   * Extract error message from API response
   */
  static getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiErrorResponse;
      
      // If we have a structured API error response
      if (apiError?.message) {
        return apiError.message;
      }
      
      // Handle specific HTTP status codes
      switch (error.response?.status) {
        case 400:
          return 'Invalid request. Please check your input and try again.';
        case 401:
          return 'You are not authorized. Please login again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'This action conflicts with existing data. Please check and try again.';
        case 422:
          return 'Validation failed. Please check your input.';
        case 429:
          return 'Too many requests. Please wait a moment and try again.';
        case 500:
        case 502:
        case 503:
        case 504:
          return 'Server error. Please try again later.';
        default:
          return error.message || 'An unexpected error occurred.';
      }
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected error occurred.';
  }

  /**
   * Get error title based on error type
   */
  static getErrorTitle(error: unknown): string {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiErrorResponse;
      
      // Use the error code if available
      if (apiError?.code) {
        switch (apiError.code) {
          case 'VALIDATION_ERROR':
            return 'Validation Error';
          case 'UNAUTHORIZED':
            return 'Authentication Required';
          case 'FORBIDDEN':
            return 'Access Denied';
          case 'NOT_FOUND':
            return 'Not Found';
          case 'CONFLICT':
            return 'Conflict';
          case 'RATE_LIMIT_EXCEEDED':
            return 'Too Many Requests';
          default:
            return 'Error';
        }
      }
      
      // Fallback to HTTP status codes
      switch (error.response?.status) {
        case 400:
          return 'Bad Request';
        case 401:
          return 'Unauthorized';
        case 403:
          return 'Forbidden';
        case 404:
          return 'Not Found';
        case 409:
          return 'Conflict';
        case 422:
          return 'Validation Error';
        case 429:
          return 'Rate Limit Exceeded';
        case 500:
          return 'Server Error';
        default:
          return 'Error';
      }
    }
    
    return 'Error';
  }

  /**
   * Show error toast with appropriate title and message
   */
  static showError(error: unknown, customTitle?: string): void {
    const title = customTitle || this.getErrorTitle(error);
    const message = this.getErrorMessage(error);
    
    toast.error(title, message);
  }

  /**
   * Show validation error with field information
   */
  static showValidationError(error: unknown): void {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiErrorResponse;
      
      if (apiError?.field) {
        const fieldName = this.formatFieldName(apiError.field);
        toast.error('Validation Error', `${fieldName}: ${apiError.message}`);
        return;
      }
    }
    
    this.showError(error, 'Validation Error');
  }

  /**
   * Format field names for display
   */
  private static formatFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return !error.response && error.request;
    }
    return false;
  }

  /**
   * Check if error is a timeout error
   */
  static isTimeoutError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return error.code === 'ECONNABORTED' || error.message.includes('timeout');
    }
    return false;
  }

  /**
   * Handle network-specific errors
   */
  static handleNetworkError(error: unknown): void {
    if (this.isNetworkError(error)) {
      toast.error('Network Error', 'Unable to connect to the server. Please check your internet connection.');
    } else if (this.isTimeoutError(error)) {
      toast.error('Timeout Error', 'The request took too long to complete. Please try again.');
    } else {
      this.showError(error);
    }
  }
}

// Convenience functions for common use cases
export const handleApiError = (error: unknown, customTitle?: string) => {
  ApiErrorHandler.showError(error, customTitle);
};

export const handleValidationError = (error: unknown) => {
  ApiErrorHandler.showValidationError(error);
};

export const handleNetworkError = (error: unknown) => {
  ApiErrorHandler.handleNetworkError(error);
}; 