import React from 'react';
import { Users, Calendar, Settings, Trash2, Edit, Eye, Crown, UserCheck, Eye as EyeIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { 
  Project, 
  ProjectRole,
  projectUtils 
} from '@/services/api/projects';
import { useRolePermissions, getRoleColor, getRoleIcon, getRoleDisplayName } from '@/hooks/useRolePermissions';
import { RoleGuard, PermissionGuard, useConditionalRender } from '@/components/auth/RoleGuard';

interface EnhancedProject extends Project {
  userMembership?: any;
  userRole?: ProjectRole;
  isUserMember?: boolean;
}

interface ProjectCardProps {
  project: EnhancedProject;
  onProjectClick?: (project: Project) => void;
  onEditClick?: (project: Project) => void;
  onDeleteClick?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onProjectClick,
  onEditClick,
  onDeleteClick
}) => {
  const { canPerform } = useRolePermissions(project.id);
  const { renderIfPermission, renderIf } = useConditionalRender(project.id);

  const handleCardClick = () => {
    if (onProjectClick) {
      onProjectClick(project);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditClick) {
      onEditClick(project);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteClick) {
      onDeleteClick(project);
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCardClick();
  };

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      {/* Role indicator for user's membership */}
      {project.isUserMember && project.userRole && (
        <div className="absolute top-2 right-2 z-10">
          <Badge 
            variant="outline" 
            className={`${getRoleColor(project.userRole)} text-xs flex items-center gap-1`}
          >
            <span>{getRoleIcon(project.userRole)}</span>
            {getRoleDisplayName(project.userRole)}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3 cursor-pointer" onClick={handleCardClick}>
        <div className="flex justify-between items-start pr-20">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary">
              {project.name}
            </CardTitle>
            {project.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {project.description}
              </CardDescription>
            )}
          </div>
          
          {/* Action menu - only show if user has permissions */}
          <RoleGuard 
            projectId={project.id} 
            requiredPermission="canViewProject"
            fallback={null}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleViewClick}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>

                {renderIfPermission('canEditProject', 
                  <DropdownMenuItem onClick={handleEditClick}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                )}

                {renderIfPermission('canManageMembers',
                  <DropdownMenuItem onClick={() => console.log('Manage members')}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Members
                  </DropdownMenuItem>
                )}

                {renderIfPermission('canDeleteProject', 
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleDeleteClick}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </RoleGuard>
        </div>
        
        {/* Status and Client */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary" className={projectUtils.getStatusColor(project.status)}>
            {projectUtils.formatStatus(project.status)}
          </Badge>
          {project.clientName && (
            <Badge variant="outline">
              {project.clientName}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Technology tags */}
        {project.technology && project.technology.length > 0 && (
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">
              <strong>Tech:</strong> {projectUtils.getTechnologyDisplay(project.technology)}
            </p>
          </div>
        )}

        {/* User's role in project */}
        {project.isUserMember && (
          <div className="mb-3 p-2 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span>{getRoleIcon(project.userRole!)}</span>
              <span>Your role: <strong>{getRoleDisplayName(project.userRole!)}</strong></span>
              {project.userRole === ProjectRole.LEAD && (
                <Crown className="h-3 w-3 text-yellow-500" />
              )}
            </p>
          </div>
        )}

        {/* Project metrics */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{project.memberCount || 0} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Membership status for non-members */}
        {!project.isUserMember && (
          <div className="mt-3 p-2 bg-gray-50 rounded-md border-l-4 border-gray-300">
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <EyeIcon className="h-3 w-3" />
              <span>Public project - You can view but not contribute</span>
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {project.startDate && (
            <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
          )}
        </div>
        
        <div className="flex gap-2">
          {/* Quick action buttons based on permissions */}
          {renderIfPermission('canViewProject',
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              View Details
            </Button>
          )}

          {renderIfPermission('canEditProject',
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Edit
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}; 