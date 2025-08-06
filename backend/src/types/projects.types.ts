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

export interface ProjectSearchOptions {
  search?: string;
  status?: ProjectStatus;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'memberCount';
  sortOrder?: 'asc' | 'desc';
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
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
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