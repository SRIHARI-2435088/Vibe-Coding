import React from 'react';
import { useRolePermissions, useGlobalPermissions, Permissions } from '@/hooks/useRolePermissions';
import { ProjectRole } from '@/services/api/projects';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface RoleGuardProps {
  children: React.ReactNode;
  projectId?: string;
  requiredPermission?: keyof Permissions;
  requiredRole?: ProjectRole;
  requireProjectMembership?: boolean;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  unauthorizedMessage?: string;
  showUnauthorizedMessage?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  projectId,
  requiredPermission,
  requiredRole,
  requireProjectMembership = false,
  fallback = null,
  loadingFallback = <Skeleton className="h-20 w-full" />,
  unauthorizedMessage = "You don't have permission to access this feature.",
  showUnauthorizedMessage = false
}) => {
  const { 
    loading, 
    canPerform, 
    hasHigherOrEqualRole, 
    isProjectMember, 
    currentRole 
  } = useRolePermissions(projectId);
  
  const { isAuthenticated } = useGlobalPermissions();

  // Show loading state
  if (loading) {
    return <>{loadingFallback}</>;
  }

  // Check authentication
  if (!isAuthenticated) {
    return showUnauthorizedMessage ? (
      <Alert variant="destructive">
        <AlertDescription>
          You must be logged in to access this feature.
        </AlertDescription>
      </Alert>
    ) : <>{fallback}</>;
  }

  // Check project membership if required
  if (requireProjectMembership && !isProjectMember) {
    return showUnauthorizedMessage ? (
      <Alert variant="destructive">
        <AlertDescription>
          You must be a member of this project to access this feature.
        </AlertDescription>
      </Alert>
    ) : <>{fallback}</>;
  }

  // Check specific permission
  if (requiredPermission && !canPerform(requiredPermission)) {
    return showUnauthorizedMessage ? (
      <Alert variant="destructive">
        <AlertDescription>
          {unauthorizedMessage}
        </AlertDescription>
      </Alert>
    ) : <>{fallback}</>;
  }

  // Check role requirement
  if (requiredRole && !hasHigherOrEqualRole(requiredRole)) {
    return showUnauthorizedMessage ? (
      <Alert variant="destructive">
        <AlertDescription>
          This feature requires {requiredRole} role or higher. Your current role: {currentRole}.
        </AlertDescription>
      </Alert>
    ) : <>{fallback}</>;
  }

  // All checks passed, render children
  return <>{children}</>;
};

// Specialized guards for common use cases
interface ProjectLeadGuardProps {
  children: React.ReactNode;
  projectId: string;
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

export const ProjectLeadGuard: React.FC<ProjectLeadGuardProps> = ({
  children,
  projectId,
  fallback = null,
  showMessage = false
}) => {
  return (
    <RoleGuard
      projectId={projectId}
      requiredRole={ProjectRole.LEAD}
      fallback={fallback}
      showUnauthorizedMessage={showMessage}
      unauthorizedMessage="Only project leads can access this feature."
    >
      {children}
    </RoleGuard>
  );
};

interface ProjectMemberGuardProps {
  children: React.ReactNode;
  projectId: string;
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

export const ProjectMemberGuard: React.FC<ProjectMemberGuardProps> = ({
  children,
  projectId,
  fallback = null,
  showMessage = false
}) => {
  return (
    <RoleGuard
      projectId={projectId}
      requiredRole={ProjectRole.MEMBER}
      fallback={fallback}
      showUnauthorizedMessage={showMessage}
      unauthorizedMessage="Only project members and leads can access this feature."
    >
      {children}
    </RoleGuard>
  );
};

interface PermissionGuardProps {
  children: React.ReactNode;
  projectId?: string;
  permission: keyof Permissions;
  fallback?: React.ReactNode;
  showMessage?: boolean;
  customMessage?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  projectId,
  permission,
  fallback = null,
  showMessage = false,
  customMessage
}) => {
  return (
    <RoleGuard
      projectId={projectId}
      requiredPermission={permission}
      fallback={fallback}
      showUnauthorizedMessage={showMessage}
      unauthorizedMessage={customMessage || `You don't have permission to ${permission.replace('can', '').toLowerCase()}.`}
    >
      {children}
    </RoleGuard>
  );
};

// Hook for conditional rendering based on permissions
export const useConditionalRender = (projectId?: string) => {
  const { canPerform, hasHigherOrEqualRole, isProjectMember } = useRolePermissions(projectId);
  const { isAuthenticated } = useGlobalPermissions();

  const renderIf = (condition: boolean, content: React.ReactNode, fallback: React.ReactNode = null) => {
    return condition ? content : fallback;
  };

  const renderIfPermission = (permission: keyof Permissions, content: React.ReactNode, fallback: React.ReactNode = null) => {
    return canPerform(permission) ? content : fallback;
  };

  const renderIfRole = (role: ProjectRole, content: React.ReactNode, fallback: React.ReactNode = null) => {
    return hasHigherOrEqualRole(role) ? content : fallback;
  };

  const renderIfMember = (content: React.ReactNode, fallback: React.ReactNode = null) => {
    return isProjectMember ? content : fallback;
  };

  const renderIfAuthenticated = (content: React.ReactNode, fallback: React.ReactNode = null) => {
    return isAuthenticated ? content : fallback;
  };

  return {
    renderIf,
    renderIfPermission,
    renderIfRole,
    renderIfMember,
    renderIfAuthenticated,
    canPerform,
    hasHigherOrEqualRole,
    isProjectMember,
    isAuthenticated
  };
}; 