import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalPermissions, useRolePermissions, Permissions } from '@/hooks/useRolePermissions';
import { UserRole } from '@/services/api/auth';
import { ProjectRole } from '@/services/api/projects';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Shield, Users, Eye } from 'lucide-react';

// Props interfaces
interface BaseRBACProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showMessage?: boolean;
  customMessage?: string;
  loadingFallback?: React.ReactNode;
}

interface SystemRoleProps extends BaseRBACProps {
  role: UserRole | UserRole[];
}

interface ProjectRoleProps extends BaseRBACProps {
  projectId: string;
  role: ProjectRole | ProjectRole[];
}

interface PermissionProps extends BaseRBACProps {
  projectId?: string;
  permission: keyof Permissions | Array<keyof Permissions>;
  requireAll?: boolean; // For multiple permissions: true = AND, false = OR
}

// System role components
export const RequireSystemRole: React.FC<SystemRoleProps> = ({
  children,
  role,
  fallback = null,
  showMessage = false,
  customMessage,
  loadingFallback = <Skeleton className="h-8 w-full" />
}) => {
  const { user, isLoading } = useAuth();
  const { isAuthenticated } = useGlobalPermissions();

  if (isLoading) return <>{loadingFallback}</>;
  
  if (!isAuthenticated) {
    return showMessage ? (
      <Alert variant="destructive">
        <AlertDescription>
          You must be logged in to access this feature.
        </AlertDescription>
      </Alert>
    ) : <>{fallback}</>;
  }

  const requiredRoles = Array.isArray(role) ? role : [role];
  const hasRole = user?.role && requiredRoles.includes(user.role);

  if (!hasRole) {
    return showMessage ? (
      <Alert variant="destructive">
        <AlertDescription>
          {customMessage || `This feature requires ${requiredRoles.join(' or ')} role.`}
        </AlertDescription>
      </Alert>
    ) : <>{fallback}</>;
  }

  return <>{children}</>;
};

// Admin only component
export const AdminOnly: React.FC<BaseRBACProps> = (props) => (
  <RequireSystemRole {...props} role={UserRole.ADMIN} />
);

// Project Manager or Admin component
export const ManagerOrAdmin: React.FC<BaseRBACProps> = (props) => (
  <RequireSystemRole {...props} role={[UserRole.ADMIN, UserRole.PROJECT_MANAGER]} />
);

// Project role components
export const RequireProjectRole: React.FC<ProjectRoleProps> = ({
  children,
  projectId,
  role,
  fallback = null,
  showMessage = false,
  customMessage,
  loadingFallback = <Skeleton className="h-8 w-full" />
}) => {
  const { loading, currentRole, isProjectMember } = useRolePermissions(projectId);
  const { isAuthenticated } = useGlobalPermissions();

  if (loading) return <>{loadingFallback}</>;
  
  if (!isAuthenticated) {
    return showMessage ? (
      <Alert variant="destructive">
        <AlertDescription>
          You must be logged in to access this feature.
        </AlertDescription>
      </Alert>
    ) : <>{fallback}</>;
  }

  if (!isProjectMember) {
    return showMessage ? (
      <Alert variant="destructive">
        <AlertDescription>
          You must be a member of this project to access this feature.
        </AlertDescription>
      </Alert>
    ) : <>{fallback}</>;
  }

  const requiredRoles = Array.isArray(role) ? role : [role];
  const hasRole = currentRole && requiredRoles.includes(currentRole);

  if (!hasRole) {
    return showMessage ? (
      <Alert variant="destructive">
        <AlertDescription>
          {customMessage || `This feature requires ${requiredRoles.join(' or ')} role in this project.`}
        </AlertDescription>
      </Alert>
    ) : <>{fallback}</>;
  }

  return <>{children}</>;
};

// Project Lead only component
export const ProjectLeadOnly: React.FC<Omit<ProjectRoleProps, 'role'>> = (props) => (
  <RequireProjectRole {...props} role={ProjectRole.LEAD} />
);

// Project Member or Lead component
export const ProjectMemberOrLead: React.FC<Omit<ProjectRoleProps, 'role'>> = (props) => (
  <RequireProjectRole {...props} role={[ProjectRole.MEMBER, ProjectRole.LEAD]} />
);

// Permission-based component
export const RequirePermission: React.FC<PermissionProps> = ({
  children,
  projectId,
  permission,
  requireAll = true,
  fallback = null,
  showMessage = false,
  customMessage,
  loadingFallback = <Skeleton className="h-8 w-full" />
}) => {
  const { loading, canPerform } = useRolePermissions(projectId);
  const { isAuthenticated } = useGlobalPermissions();

  if (loading) return <>{loadingFallback}</>;
  
  if (!isAuthenticated) {
    return showMessage ? (
      <Alert variant="destructive">
        <AlertDescription>
          You must be logged in to access this feature.
        </AlertDescription>
      </Alert>
    ) : <>{fallback}</>;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasPermission = requireAll 
    ? permissions.every(p => canPerform(p))
    : permissions.some(p => canPerform(p));

  if (!hasPermission) {
    return showMessage ? (
      <Alert variant="destructive">
        <AlertDescription>
          {customMessage || "You don't have permission to access this feature."}
        </AlertDescription>
      </Alert>
    ) : <>{fallback}</>;
  }

  return <>{children}</>;
};

// Role display components
export const UserRoleBadge: React.FC<{ role?: UserRole; showIcon?: boolean }> = ({ 
  role, 
  showIcon = true 
}) => {
  if (!role) return null;

  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return {
          label: 'Administrator',
          icon: Crown,
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case UserRole.PROJECT_MANAGER:
        return {
          label: 'Project Manager',
          icon: Shield,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case UserRole.CONTRIBUTOR:
        return {
          label: 'Contributor',
          icon: Users,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case UserRole.VIEWER:
        return {
          label: 'Viewer',
          icon: Eye,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      default:
        return {
          label: role,
          icon: Shield,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
};

export const ProjectRoleBadge: React.FC<{ role?: ProjectRole; showIcon?: boolean }> = ({ 
  role, 
  showIcon = true 
}) => {
  if (!role) return null;

  const getRoleConfig = (role: ProjectRole) => {
    switch (role) {
      case ProjectRole.LEAD:
        return {
          label: 'Project Lead',
          icon: '👑',
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case ProjectRole.MEMBER:
        return {
          label: 'Member',
          icon: '👥',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case ProjectRole.OBSERVER:
        return {
          label: 'Observer',
          icon: '👁️',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      default:
        return {
          label: role,
          icon: '❓',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getRoleConfig(role);

  return (
    <Badge variant="outline" className={config.className}>
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </Badge>
  );
};

// Conditional render hook wrapper components
interface ConditionalRenderProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ShowIf: React.FC<ConditionalRenderProps> = ({ condition, children, fallback = null }) => {
  return condition ? <>{children}</> : <>{fallback}</>;
};

// Utility components for common permission checks
export const CanCreateKnowledge: React.FC<BaseRBACProps & { projectId?: string }> = ({ projectId, ...props }) => (
  <RequirePermission {...props} projectId={projectId} permission="canCreateKnowledge" />
);

export const CanEditKnowledge: React.FC<BaseRBACProps & { projectId?: string }> = ({ projectId, ...props }) => (
  <RequirePermission {...props} projectId={projectId} permission="canEditKnowledge" />
);

export const CanDeleteKnowledge: React.FC<BaseRBACProps & { projectId?: string }> = ({ projectId, ...props }) => (
  <RequirePermission {...props} projectId={projectId} permission="canDeleteKnowledge" />
);

export const CanManageMembers: React.FC<BaseRBACProps & { projectId: string }> = ({ projectId, ...props }) => (
  <RequirePermission {...props} projectId={projectId} permission="canManageMembers" />
);

export const CanUploadFiles: React.FC<BaseRBACProps & { projectId?: string }> = ({ projectId, ...props }) => (
  <RequirePermission {...props} projectId={projectId} permission="canUploadFiles" />
);

export const CanManageProject: React.FC<BaseRBACProps & { projectId: string }> = ({ projectId, ...props }) => (
  <RequirePermission {...props} projectId={projectId} permission="canEditProject" />
); 