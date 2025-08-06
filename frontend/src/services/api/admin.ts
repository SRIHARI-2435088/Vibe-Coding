import { apiClient } from './client';
import { handleApiError } from '@/lib/error-handler';

// Admin types
export interface PendingUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  bio?: string;
  expertiseAreas: string[];
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface UserApprovalRequest {
  userId: string;
  approve: boolean;
  role: string;
  reason?: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  totalProjects: number;
  totalKnowledgeItems: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'USER_SIGNUP' | 'PROJECT_CREATED' | 'KNOWLEDGE_ADDED' | 'USER_APPROVED';
  description: string;
  timestamp: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  knowledgeTitle?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

/**
 * Admin API Service
 * Handles administrative functions like user approvals and role management
 */
export const adminApi = {
  /**
   * Get pending user registrations
   */
  async getPendingUsers(): Promise<PendingUser[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: PendingUser[] }>('/admin/pending-users');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get pending users:', error);
      throw handleApiError(error, 'Failed to load pending users');
    }
  },

  /**
   * Approve or reject user registration
   */
  async approveUser(request: UserApprovalRequest): Promise<void> {
    try {
      await apiClient.post('/admin/approve-user', request);
    } catch (error) {
      console.error('Failed to process user approval:', error);
      throw handleApiError(error, 'Failed to process user approval');
    }
  },

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<any> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/admin/dashboard-stats');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      throw handleApiError(error, 'Failed to load dashboard statistics');
    }
  },

  /**
   * Get system statistics (for backward compatibility)
   */
  async getSystemStats(): Promise<SystemStats> {
    try {
      const response = await apiClient.get<{ success: boolean; data: SystemStats }>('/admin/system-stats');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get system stats:', error);
      throw handleApiError(error, 'Failed to load system statistics');
    }
  },

  /**
   * Get all users for management
   */
  async getAllUsers(): Promise<any[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/admin/users');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get all users:', error);
      throw handleApiError(error, 'Failed to load users');
    }
  },

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      await apiClient.put(`/admin/users/${userId}/role`, { role });
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw handleApiError(error, 'Failed to update user role');
    }
  },

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string): Promise<void> {
    try {
      await apiClient.put(`/admin/users/${userId}/deactivate`);
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      throw handleApiError(error, 'Failed to deactivate user');
    }
  },

  /**
   * Get available roles
   */
  async getAvailableRoles(): Promise<UserRole[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: UserRole[] }>('/admin/roles');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get available roles:', error);
      throw handleApiError(error, 'Failed to load available roles');
    }
  },

  /**
   * Get recent system activity
   */
  async getRecentActivity(limit: number = 20): Promise<ActivityItem[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ActivityItem[] }>(`/admin/activity?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get recent activity:', error);
      throw handleApiError(error, 'Failed to load recent activity');
    }
  },

  /**
   * Reactivate user
   */
  async reactivateUser(userId: string): Promise<void> {
    try {
      await apiClient.put(`/admin/users/${userId}/reactivate`);
    } catch (error) {
      console.error('Failed to reactivate user:', error);
      throw handleApiError(error, 'Failed to reactivate user');
    }
  },

  /**
   * Permanently delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw handleApiError(error, 'Failed to delete user');
    }
  },

  /**
   * Get all projects for admin oversight
   */
  async getAllProjects(): Promise<any[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/admin/projects');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get all projects:', error);
      throw handleApiError(error, 'Failed to load projects');
    }
  },

  /**
   * Update project status
   */
  async updateProjectStatus(projectId: string, status: string): Promise<void> {
    try {
      await apiClient.put(`/admin/projects/${projectId}/status`, { status });
    } catch (error) {
      console.error('Failed to update project status:', error);
      throw handleApiError(error, 'Failed to update project status');
    }
  },

  /**
   * Get all knowledge items for admin oversight
   */
  async getAllKnowledgeItems(): Promise<any[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/admin/knowledge');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get all knowledge items:', error);
      throw handleApiError(error, 'Failed to load knowledge items');
    }
  },

  /**
   * Update knowledge item status
   */
  async updateKnowledgeStatus(knowledgeId: string, status: string): Promise<void> {
    try {
      await apiClient.put(`/admin/knowledge/${knowledgeId}/status`, { status });
    } catch (error) {
      console.error('Failed to update knowledge status:', error);
      throw handleApiError(error, 'Failed to update knowledge status');
    }
  },

  /**
   * Delete knowledge item
   */
  async deleteKnowledgeItem(knowledgeId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/knowledge/${knowledgeId}`);
    } catch (error) {
      console.error('Failed to delete knowledge item:', error);
      throw handleApiError(error, 'Failed to delete knowledge item');
    }
  },

  /**
   * Create a new user
   */
  async createUser(userData: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive?: boolean;
  }): Promise<any> {
    try {
      const response = await apiClient.post('/admin/users', userData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw handleApiError(error, 'Failed to create user');
    }
  },

  /**
   * Update user details
   */
  async updateUser(userId: string, userData: {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<any> {
    try {
      const response = await apiClient.put(`/admin/users/${userId}`, userData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw handleApiError(error, 'Failed to update user');
    }
  }
};

// Utility functions for admin operations
export const adminUtils = {
  /**
   * Format activity type for display
   */
  formatActivityType: (type: string): string => {
    switch (type) {
      case 'USER_SIGNUP':
        return 'User Registration';
      case 'PROJECT_CREATED':
        return 'Project Created';
      case 'KNOWLEDGE_ADDED':
        return 'Knowledge Added';
      case 'USER_APPROVED':
        return 'User Approved';
      default:
        return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
  },

  /**
   * Get activity icon
   */
  getActivityIcon: (type: string): string => {
    switch (type) {
      case 'USER_SIGNUP':
        return '👤';
      case 'PROJECT_CREATED':
        return '📁';
      case 'KNOWLEDGE_ADDED':
        return '📚';
      case 'USER_APPROVED':
        return '✅';
      default:
        return '📋';
    }
  },

  /**
   * Format user status
   */
  formatUserStatus: (status: string): string => {
    switch (status) {
      case 'PENDING':
        return 'Pending Approval';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  },

  /**
   * Get status color
   */
  getStatusColor: (status: string): string => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}; 