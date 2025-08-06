import { api, ApiSuccessResponse, tokenManager } from './client';

// Frontend Auth Types (matching backend types)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  bio?: string;
  expertiseAreas?: string[];
}

export interface AuthResponse {
  success: boolean;
  user: UserProfile;
  token: string;
  expiresIn: string;
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: string;
  bio?: string;
  expertiseAreas: string[];
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER'
}

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
export const authApi = {
  /**
   * Register a new user
   */
  register: async (registerData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiSuccessResponse<AuthResponse>>('/auth/register', registerData);
    
    // Store token and user profile
    if (response.data.token) {
      tokenManager.setToken(response.data.token);
      localStorage.setItem('user_profile', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Login user
   */
  login: async (loginData: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiSuccessResponse<AuthResponse>>('/auth/login', loginData);
    
    // Store token and user profile
    if (response.data.token) {
      tokenManager.setToken(response.data.token);
      localStorage.setItem('user_profile', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if the API call fails, clear local storage
      console.warn('Logout API call failed, but clearing local storage anyway', error);
    } finally {
      // Always clear local storage
      tokenManager.removeToken();
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<ApiSuccessResponse<UserProfile>>('/auth/profile');
    
    // Update stored user profile
    localStorage.setItem('user_profile', JSON.stringify(response.data));
    
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (updateData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put<ApiSuccessResponse<UserProfile>>('/auth/profile', updateData);
    
    // Update stored user profile
    localStorage.setItem('user_profile', JSON.stringify(response.data));
    
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (passwordData: PasswordUpdateRequest): Promise<void> => {
    await api.put('/auth/change-password', passwordData);
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post<ApiSuccessResponse<AuthResponse>>('/auth/refresh');
    
    // Store new token and user profile
    if (response.data.token) {
      tokenManager.setToken(response.data.token);
      localStorage.setItem('user_profile', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Validate current authentication status
   */
  validateAuth: async (): Promise<UserProfile> => {
    const response = await api.get<ApiSuccessResponse<UserProfile>>('/auth/validate');
    
    // Update stored user profile
    localStorage.setItem('user_profile', JSON.stringify(response.data));
    
    return response.data;
  },
};

/**
 * Utility functions for authentication
 */
export const authUtils = {
  /**
   * Check if user is currently authenticated
   */
  isAuthenticated: (): boolean => {
    const token = tokenManager.getToken();
    return token !== null && !tokenManager.isTokenExpired(token);
  },

  /**
   * Get stored user profile
   */
  getStoredUserProfile: (): UserProfile | null => {
    try {
      const storedProfile = localStorage.getItem('user_profile');
      return storedProfile ? JSON.parse(storedProfile) : null;
    } catch (error) {
      console.error('Error parsing stored user profile:', error);
      return null;
    }
  },

  /**
   * Clear all authentication data
   */
  clearAuthData: (): void => {
    tokenManager.removeToken();
  },

  /**
   * Check if user has specific role
   */
  hasRole: (requiredRole: UserRole): boolean => {
    const userProfile = authUtils.getStoredUserProfile();
    return userProfile?.role === requiredRole;
  },

  /**
   * Check if user has admin privileges
   */
  isAdmin: (): boolean => {
    return authUtils.hasRole(UserRole.ADMIN);
  },

  /**
   * Check if user can manage projects
   */
  canManageProjects: (): boolean => {
    const userProfile = authUtils.getStoredUserProfile();
    return userProfile?.role === UserRole.ADMIN || userProfile?.role === UserRole.PROJECT_MANAGER;
  },

  /**
   * Get user's full name
   */
  getFullName: (): string => {
    const userProfile = authUtils.getStoredUserProfile();
    if (!userProfile) return '';
    return `${userProfile.firstName} ${userProfile.lastName}`;
  },

  /**
   * Get user's initials for avatar
   */
  getInitials: (): string => {
    const userProfile = authUtils.getStoredUserProfile();
    if (!userProfile) return '';
    return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
  },
};

export default authApi; 