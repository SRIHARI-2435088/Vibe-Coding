import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi, ProjectRole, ProjectMember } from '@/services/api/projects';

// Permission types
export interface Permissions {
  canViewProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canManageMembers: boolean;
  canAddMembers: boolean;
  canRemoveMembers: boolean;
  canChangeRoles: boolean;
  canCreateKnowledge: boolean;
  canEditKnowledge: boolean;
  canDeleteKnowledge: boolean;
  canUploadFiles: boolean;
  canDeleteFiles: boolean;
  canViewMembers: boolean;
  canManageProjectSettings: boolean;
}

// User role context
export interface UserProjectRole {
  projectId: string;
  role: ProjectRole;
  permissions: Permissions;
  isProjectMember: boolean;
}

// Role hierarchy levels
const ROLE_HIERARCHY = {
  [ProjectRole.LEAD]: 3,
  [ProjectRole.MEMBER]: 2,
  [ProjectRole.OBSERVER]: 1
};

export const useRolePermissions = (projectId?: string) => {
  const { user, isAuthenticated } = useAuth();
  const [userRole, setUserRole] = useState<UserProjectRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate permissions based on role
  const calculatePermissions = useCallback((role: ProjectRole): Permissions => {
    const basePermissions: Permissions = {
      canViewProject: false,
      canEditProject: false,
      canDeleteProject: false,
      canManageMembers: false,
      canAddMembers: false,
      canRemoveMembers: false,
      canChangeRoles: false,
      canCreateKnowledge: false,
      canEditKnowledge: false,
      canDeleteKnowledge: false,
      canUploadFiles: false,
      canDeleteFiles: false,
      canViewMembers: false,
      canManageProjectSettings: false,
    };

    switch (role) {
      case ProjectRole.LEAD:
        return {
          ...basePermissions,
          canViewProject: true,
          canEditProject: true,
          canDeleteProject: true,
          canManageMembers: true,
          canAddMembers: true,
          canRemoveMembers: true,
          canChangeRoles: true,
          canCreateKnowledge: true,
          canEditKnowledge: true,
          canDeleteKnowledge: true,
          canUploadFiles: true,
          canDeleteFiles: true,
          canViewMembers: true,
          canManageProjectSettings: true,
        };

      case ProjectRole.MEMBER:
        return {
          ...basePermissions,
          canViewProject: true,
          canEditProject: false,
          canDeleteProject: false,
          canManageMembers: false,
          canAddMembers: false,
          canRemoveMembers: false,
          canChangeRoles: false,
          canCreateKnowledge: true,
          canEditKnowledge: true, // Only their own
          canDeleteKnowledge: true, // Only their own
          canUploadFiles: true,
          canDeleteFiles: true, // Only their own
          canViewMembers: true,
          canManageProjectSettings: false,
        };

      case ProjectRole.OBSERVER:
        return {
          ...basePermissions,
          canViewProject: true,
          canEditProject: false,
          canDeleteProject: false,
          canManageMembers: false,
          canAddMembers: false,
          canRemoveMembers: false,
          canChangeRoles: false,
          canCreateKnowledge: false,
          canEditKnowledge: false,
          canDeleteKnowledge: false,
          canUploadFiles: false,
          canDeleteFiles: false,
          canViewMembers: true,
          canManageProjectSettings: false,
        };

      default:
        return basePermissions;
    }
  }, []);

  // Fetch user's role for the project
  const fetchUserRole = useCallback(async () => {
    if (!projectId || !user?.id || !isAuthenticated) {
      setUserRole(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user's projects to find their role in this project
      const userProjects = await projectsApi.getMyProjects();
      const projectMembership = userProjects.projects.find(
        p => p.projectId === projectId
      );

      if (!projectMembership) {
        // User is not a member of this project
        setUserRole({
          projectId,
          role: ProjectRole.OBSERVER, // Default to observer for non-members
          permissions: calculatePermissions(ProjectRole.OBSERVER),
          isProjectMember: false
        });
        return;
      }

      // Calculate permissions based on user's role
      const permissions = calculatePermissions(projectMembership.role);

      setUserRole({
        projectId,
        role: projectMembership.role,
        permissions,
        isProjectMember: true
      });

    } catch (err: any) {
      console.error('Error fetching user role:', err);
      setError(err.message || 'Failed to fetch user role');
    } finally {
      setLoading(false);
    }
  }, [projectId, user?.id, isAuthenticated, calculatePermissions]);

  // Check if user can perform a specific action
  const canPerform = useCallback((action: keyof Permissions): boolean => {
    if (!userRole) return false;
    return userRole.permissions[action];
  }, [userRole]);

  // Check if user has higher or equal role than target
  const hasHigherOrEqualRole = useCallback((targetRole: ProjectRole): boolean => {
    if (!userRole) return false;
    return ROLE_HIERARCHY[userRole.role] >= ROLE_HIERARCHY[targetRole];
  }, [userRole]);

  // Check if user can manage another user (role hierarchy)
  const canManageUser = useCallback((targetUserRole: ProjectRole): boolean => {
    if (!userRole || !userRole.permissions.canManageMembers) return false;
    return ROLE_HIERARCHY[userRole.role] > ROLE_HIERARCHY[targetUserRole];
  }, [userRole]);

  // Refresh user role (useful after role changes)
  const refreshRole = useCallback(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  // Effect to fetch role when dependencies change
  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  return {
    userRole,
    loading,
    error,
    canPerform,
    hasHigherOrEqualRole,
    canManageUser,
    refreshRole,
    isProjectMember: userRole?.isProjectMember || false,
    currentRole: userRole?.role,
    permissions: userRole?.permissions
  };
};

// Hook for checking global user permissions (not project-specific)
export const useGlobalPermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const canCreateProject = useCallback((): boolean => {
    return isAuthenticated && !!user;
  }, [isAuthenticated, user]);

  const canViewProjects = useCallback((): boolean => {
    return isAuthenticated && !!user;
  }, [isAuthenticated, user]);

  const canManageOwnProfile = useCallback((): boolean => {
    return isAuthenticated && !!user;
  }, [isAuthenticated, user]);

  const isSystemAdmin = useCallback((): boolean => {
    return user?.role === 'ADMIN';
  }, [user?.role]);

  const canCreateProjects = canCreateProject;
  const canManageAllProjects = isSystemAdmin;
  const canViewAllProjects = useCallback((): boolean => {
    return user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';
  }, [user?.role]);

  const canManageUsers = useCallback((): boolean => {
    return user?.role === 'ADMIN';
  }, [user?.role]);

  const canManageContent = useCallback((): boolean => {
    return user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';
  }, [user?.role]);

  const canAccessAdminPanel = useCallback((): boolean => {
    return user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';
  }, [user?.role]);

  const canDeleteUsers = useCallback((): boolean => {
    return user?.role === 'ADMIN';
  }, [user?.role]);

  const canModifyUserRoles = useCallback((): boolean => {
    return user?.role === 'ADMIN';
  }, [user?.role]);

  const canCreateKnowledge = useCallback((): boolean => {
    return isAuthenticated && !!user;
  }, [isAuthenticated, user]);

  const canManageAllKnowledge = isSystemAdmin;

  const canUploadFiles = useCallback((): boolean => {
    return isAuthenticated && !!user;
  }, [isAuthenticated, user]);

  const canManageAllFiles = isSystemAdmin;

  return {
    canCreateProject,
    canCreateProjects,
    canViewProjects,
    canManageAllProjects,
    canViewAllProjects,
    canCreateKnowledge,
    canManageAllKnowledge,
    canUploadFiles,
    canManageAllFiles,
    canManageOwnProfile,
    canManageUsers,
    canManageContent,
    canAccessAdminPanel,
    canDeleteUsers,
    canModifyUserRoles,
    isSystemAdmin,
    isAuthenticated,
    user
  };
};

// Utility functions for role display
export const getRoleDisplayName = (role: ProjectRole): string => {
  switch (role) {
    case ProjectRole.LEAD:
      return 'Project Lead';
    case ProjectRole.MEMBER:
      return 'Member';
    case ProjectRole.OBSERVER:
      return 'Observer';
    default:
      return role;
  }
};

export const getRoleColor = (role: ProjectRole): string => {
  switch (role) {
    case ProjectRole.LEAD:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case ProjectRole.MEMBER:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case ProjectRole.OBSERVER:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getRoleIcon = (role: ProjectRole): string => {
  switch (role) {
    case ProjectRole.LEAD:
      return '👑';
    case ProjectRole.MEMBER:
      return '👥';
    case ProjectRole.OBSERVER:
      return '👁️';
    default:
      return '❓';
  }
}; 