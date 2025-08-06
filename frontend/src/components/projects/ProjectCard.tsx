import React from 'react';
import { 
  Users, 
  Calendar, 
  Settings, 
  Trash2, 
  Edit, 
  Eye, 
  Crown, 
  UserCheck, 
  UserPlus,
  Code,
  Building,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
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
  Avatar,
  AvatarFallback,
} from '@/components/ui';
import { 
  Project, 
  ProjectRole,
  projectUtils 
} from '@/services/api/projects';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';
import { RoleGuard, PermissionGuard, useConditionalRender } from '@/components/auth/RoleGuard';

interface ProjectCardProps {
  project: Project;
  onClick?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onJoin?: (project: Project) => void;
  showActions?: boolean;
  isUserMember?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
  onEdit,
  onDelete,
  onJoin,
  showActions = false,
  isUserMember = false
}) => {
  const { canCreateProject, canManageAllProjects, user } = useGlobalPermissions();

  const handleCardClick = () => {
    if (onClick) {
      onClick(project);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PLANNING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const canEditProject = () => {
    return canManageAllProjects() || canCreateProject;
  };

  const canDeleteProject = () => {
    return canManageAllProjects();
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(project.status)}`}
              >
                {project.status}
              </Badge>
              {isUserMember && (
                <Badge variant="secondary" className="text-xs">
                  <UserCheck className="h-3 w-3 mr-1" />
                  Member
                </Badge>
              )}
            </div>
          </div>
          
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onClick?.(project);
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                
                {!isUserMember && onJoin && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onJoin(project);
                  }}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Project
                  </DropdownMenuItem>
                )}
                
                {canEditProject() && onEdit && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEdit(project);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                )}
                
                {canDeleteProject() && onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(project);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <CardDescription className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {project.description || 'No description provided.'}
        </CardDescription>

        <div className="space-y-3">
          {/* Technology */}
          {project.technology && (
            <div className="flex items-center gap-2 text-sm">
              <Code className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{project.technology}</span>
            </div>
          )}

          {/* Client */}
          {project.clientName && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{project.clientName}</span>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatDate(project.startDate)}
              {project.endDate && ` - ${formatDate(project.endDate)}`}
            </span>
          </div>

          {/* Member count placeholder */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Team project</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(project);
              }}
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              View
            </Button>
            
            {!isUserMember && onJoin && (
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin(project);
                }}
                className="flex items-center gap-1"
              >
                <UserPlus className="h-3 w-3" />
                Join
              </Button>
            )}
          </div>

          {/* Project stats or additional info */}
          <div className="text-xs text-muted-foreground">
            Created {formatDate(project.createdAt)}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}; 