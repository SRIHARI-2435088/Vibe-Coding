import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add authentication token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle common errors
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as any;
      
      // Handle common error scenarios
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Check if this is a token refresh attempt or validation
        const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');
        const isValidateEndpoint = originalRequest?.url?.includes('/auth/validate');
        const isLoginEndpoint = originalRequest?.url?.includes('/auth/login');
        
        if (!isRefreshEndpoint && !isValidateEndpoint && !isLoginEndpoint) {
          // Try to refresh token first
          try {
            const currentToken = tokenManager.getToken();
            if (currentToken && !tokenManager.isTokenExpired(currentToken)) {
              const refreshResponse = await client.post('/auth/refresh');
              
              if (refreshResponse.data?.data?.token) {
                const newToken = refreshResponse.data.data.token;
                tokenManager.setToken(newToken);
                
                if (refreshResponse.data?.data?.user) {
                  localStorage.setItem('user_profile', JSON.stringify(refreshResponse.data.data.user));
                }
                
                // Retry original request with new token
                if (originalRequest) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                  return client(originalRequest);
                }
              }
            }
          } catch (refreshError) {
            console.warn('Token refresh failed:', refreshError);
            // Only clear auth data if refresh fails
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_profile');
            
            // Only redirect if we're not already on the login page
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
              window.location.href = '/';
            }
          }
        } else {
          // This is a refresh, validate, or login endpoint failing
          console.warn('Auth endpoint failed:', error);
          if (isRefreshEndpoint || (isValidateEndpoint && error.response?.status === 401)) {
            // Clear tokens only for auth endpoint failures
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_profile');
          }
        }
      } else if (error.response?.status === 403) {
        console.warn('Access forbidden:', error);
        // Don't automatically logout on forbidden errors
      } else if (!error.response) {
        // Network error, don't logout the user
        console.warn('Network error:', error);
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

// Create the API client instance
export const apiClient = createApiClient();

// API Response types
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

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Generic API methods
export const api = {
  // GET request
  get: async <T>(url: string, params?: Record<string, any>): Promise<T> => {
    const response = await apiClient.get(url, { params });
    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.post(url, data);
    return response.data;
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.put(url, data);
    return response.data;
  },

  // PATCH request
  patch: async <T>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.patch(url, data);
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete(url);
    return response.data;
  },

  // File upload
  upload: async <T>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> => {
    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },
};

// Health check utility
export const healthCheck = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Token management utilities
export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },

  removeToken: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_profile');
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },
};

export default api; 