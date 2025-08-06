import { apiClient } from './client';
import { handleApiError } from '@/lib/error-handler';

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  clientName?: string;
  technology: string[];
  createdAt: string;
  updatedAt: string;
  members?: ProjectMember[];
  memberCount?: number;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: ProjectRole;
  joinedAt: string;
  leftAt?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  clientName?: string;
  technology?: string[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  clientName?: string;
  technology?: string[];
}

export interface AddMemberRequest {
  userId: string;
  role?: ProjectRole;
}

export interface UpdateMemberRoleRequest {
  role: ProjectRole;
}

// Enums
export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED'
}

export enum ProjectRole {
  LEAD = 'LEAD',
  MEMBER = 'MEMBER',
  OBSERVER = 'OBSERVER'
}

// API Response types
export interface ProjectsListResponse {
  projects: Project[];
  total: number;
}

export interface ProjectMembersResponse {
  members: ProjectMember[];
  total: number;
}

export interface UserProjectsResponse {
  projects: Array<{
    id: string;
    userId: string;
    projectId: string;
    role: ProjectRole;
    joinedAt: string;
    leftAt?: string;
    project: Project;
  }>;
  total: number;
}

/**
 * Projects API Service
 */
export const projectsApi = {
  /**
   * Get all projects
   */
  async getAllProjects(): Promise<ProjectsListResponse> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ProjectsListResponse }>('/projects');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get all projects:', error);
      throw handleApiError(error, 'Failed to load projects');
    }
  },

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Project }>(`/projects/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get project by ID:', error);
      throw handleApiError(error, 'Failed to load project');
    }
  },

  /**
   * Create new project
   */
  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    try {
      const response = await apiClient.post<{ success: boolean; data: Project }>('/projects', projectData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw handleApiError(error, 'Failed to create project');
    }
  },

  /**
   * Update project
   */
  async updateProject(id: string, projectData: UpdateProjectRequest): Promise<Project> {
    try {
      const response = await apiClient.put<{ success: boolean; data: Project }>(`/projects/${id}`, projectData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw handleApiError(error, 'Failed to update project');
    }
  },

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    try {
      await apiClient.delete(`/projects/${id}`);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw handleApiError(error, 'Failed to delete project');
    }
  },

  /**
   * Get current user's projects
   */
  async getMyProjects(): Promise<UserProjectsResponse> {
    try {
      const response = await apiClient.get<{ success: boolean; data: UserProjectsResponse }>('/projects/my');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get my projects:', error);
      throw handleApiError(error, 'Failed to load your projects');
    }
  },

  /**
   * Get projects for specific user
   */
  async getUserProjects(userId: string): Promise<UserProjectsResponse> {
    try {
      const response = await apiClient.get<{ success: boolean; data: UserProjectsResponse }>(`/projects/user/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get user projects:', error);
      throw handleApiError(error, 'Failed to load user projects');
    }
  },

  /**
   * Get project members
   */
  async getProjectMembers(projectId: string): Promise<ProjectMembersResponse> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ProjectMembersResponse }>(`/projects/${projectId}/members`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get project members:', error);
      throw handleApiError(error, 'Failed to load project members');
    }
  },

  /**
   * Add member to project
   */
  async addProjectMember(projectId: string, memberData: AddMemberRequest): Promise<ProjectMember> {
    try {
      const response = await apiClient.post<{ success: boolean; data: ProjectMember }>(`/projects/${projectId}/members`, memberData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to add project member:', error);
      throw handleApiError(error, 'Failed to add member to project');
    }
  },

  /**
   * Remove member from project
   */
  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    try {
      await apiClient.delete(`/projects/${projectId}/members/${userId}`);
    } catch (error) {
      console.error('Failed to remove project member:', error);
      throw handleApiError(error, 'Failed to remove member from project');
    }
  },

  /**
   * Update member role
   */
  async updateMemberRole(projectId: string, userId: string, roleData: UpdateMemberRoleRequest): Promise<ProjectMember> {
    try {
      const response = await apiClient.put<{ success: boolean; data: ProjectMember }>(`/projects/${projectId}/members/${userId}/role`, roleData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update member role:', error);
      throw handleApiError(error, 'Failed to update member role');
    }
  }
};

/**
 * Project utility functions
 */
export const projectUtils = {
  /**
   * Get status color for display
   */
  getStatusColor: (status: ProjectStatus): string => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ProjectStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case ProjectStatus.ON_HOLD:
        return 'bg-yellow-100 text-yellow-800';
      case ProjectStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  /**
   * Get role color for display
   */
  getRoleColor: (role: ProjectRole): string => {
    switch (role) {
      case ProjectRole.LEAD:
        return 'bg-purple-100 text-purple-800';
      case ProjectRole.MEMBER:
        return 'bg-blue-100 text-blue-800';
      case ProjectRole.OBSERVER:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  /**
   * Format project status for display
   */
  formatStatus: (status: ProjectStatus): string => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'Active';
      case ProjectStatus.COMPLETED:
        return 'Completed';
      case ProjectStatus.ON_HOLD:
        return 'On Hold';
      case ProjectStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  },

  /**
   * Format project role for display
   */
  formatRole: (role: ProjectRole): string => {
    switch (role) {
      case ProjectRole.LEAD:
        return 'Lead';
      case ProjectRole.MEMBER:
        return 'Member';
      case ProjectRole.OBSERVER:
        return 'Observer';
      default:
        return role;
    }
  },

  /**
   * Check if user can edit project
   */
  canEditProject: (userRole: ProjectRole): boolean => {
    return userRole === ProjectRole.LEAD;
  },

  /**
   * Check if user can manage members
   */
  canManageMembers: (userRole: ProjectRole): boolean => {
    return userRole === ProjectRole.LEAD;
  },

  /**
   * Get technology tags display
   */
  getTechnologyDisplay: (technologies: string[]): string => {
    if (!technologies || technologies.length === 0) {
      return 'No technologies specified';
    }
    
    if (technologies.length <= 3) {
      return technologies.join(', ');
    }
    
    return `${technologies.slice(0, 3).join(', ')}, +${technologies.length - 3} more`;
  }
}; 