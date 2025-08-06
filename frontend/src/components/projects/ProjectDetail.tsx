import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Edit, 
  Settings, 
  Plus, 
  Crown, 
  UserX, 
  MoreVertical,
  Shield,
  Eye
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  Skeleton,
} from '@/components/ui';
import { 
  Project, 
  ProjectMember, 
  ProjectRole,
  projectsApi,
  projectUtils 
} from '@/services/api/projects';
import { useRolePermissions, getRoleColor, getRoleIcon, getRoleDisplayName } from '@/hooks/useRolePermissions';
import { RoleGuard, PermissionGuard, useConditionalRender } from '@/components/auth/RoleGuard';
import { useToast } from '@/hooks/useToast';

interface ProjectDetailProps {
  projectId: string;
  onBack?: () => void;
  onEdit?: (project: Project) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  projectId,
  onBack,
  onEdit
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { toast } = useToast();
  const { 
    canPerform, 
    currentRole, 
    isProjectMember, 
    canManageUser,
    refreshRole
  } = useRolePermissions(projectId);
  const { renderIfPermission, renderIfRole, renderIfMember } = useConditionalRender(projectId);

  // Fetch project details
  const fetchProject = async () => {
    try {
      setLoading(true);
      const projectData = await projectsApi.getProjectById(projectId);
      setProject(projectData);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch project members
  const fetchMembers = async () => {
    try {
      setMembersLoading(true);
      const membersData = await projectsApi.getProjectMembers(projectId);
      setMembers(membersData.members);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project members',
        variant: 'destructive',
      });
    } finally {
      setMembersLoading(false);
    }
  };

  // Remove member
  const handleRemoveMember = async (userId: string, memberName: string) => {
    try {
      await projectsApi.removeProjectMember(projectId, userId);
      toast({
        title: 'Success',
        description: `${memberName} has been removed from the project`,
      });
      
      // Refresh members list
      fetchMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  // Change member role
  const handleChangeRole = async (userId: string, newRole: ProjectRole, memberName: string) => {
    try {
      await projectsApi.updateMemberRole(projectId, userId, { role: newRole });
      toast({
        title: 'Success',
        description: `${memberName}'s role has been updated to ${getRoleDisplayName(newRole)}`,
      });
      
      // Refresh members list and user's own role if changed
      fetchMembers();
      if (userId === project?.id) {
        refreshRole();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchMembers();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Project not found or you don't have permission to view it.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* User's role badge */}
          {isProjectMember && currentRole && (
            <Badge className={`${getRoleColor(currentRole)} flex items-center gap-1`}>
              <span>{getRoleIcon(currentRole)}</span>
              {getRoleDisplayName(currentRole)}
            </Badge>
          )}

          {renderIfPermission('canEditProject',
            <Button variant="outline" onClick={() => onEdit?.(project)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          )}

          {renderIfPermission('canManageProjectSettings',
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          )}
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={projectUtils.getStatusColor(project.status)}>
              {projectUtils.formatStatus(project.status)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-lg font-semibold">{members.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          {renderIfPermission('canCreateKnowledge',
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          )}
          {renderIfPermission('canViewProject',
            <TabsTrigger value="files">Files</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.clientName && (
                <div>
                  <label className="text-sm font-medium">Client</label>
                  <p className="text-sm text-muted-foreground">{project.clientName}</p>
                </div>
              )}
              
              {project.technology && project.technology.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Technologies</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {project.technology.map((tech, index) => (
                      <Badge key={index} variant="outline">{tech}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {project.startDate && (
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.startDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {project.endDate && (
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Project Members</h3>
            {renderIfPermission('canAddMembers',
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {renderIfPermission('canManageMembers', <TableHead>Actions</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {(member.user?.firstName?.[0] || '') + (member.user?.lastName?.[0] || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.user?.firstName} {member.user?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.user?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleColor(member.role)} flex items-center gap-1 w-fit`}>
                          <span>{getRoleIcon(member.role)}</span>
                          {getRoleDisplayName(member.role)}
                          {member.role === ProjectRole.LEAD && (
                            <Crown className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </TableCell>
                      {renderIfPermission('canManageMembers',
                        <TableCell>
                          {canManageUser(member.role) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                {member.role !== ProjectRole.LEAD && (
                                  <DropdownMenuItem 
                                    onClick={() => handleChangeRole(
                                      member.userId, 
                                      ProjectRole.LEAD, 
                                      `${member.user?.firstName} ${member.user?.lastName}`
                                    )}
                                  >
                                    <Crown className="h-4 w-4 mr-2" />
                                    Make Lead
                                  </DropdownMenuItem>
                                )}
                                
                                {member.role !== ProjectRole.MEMBER && (
                                  <DropdownMenuItem 
                                    onClick={() => handleChangeRole(
                                      member.userId, 
                                      ProjectRole.MEMBER, 
                                      `${member.user?.firstName} ${member.user?.lastName}`
                                    )}
                                  >
                                    <Users className="h-4 w-4 mr-2" />
                                    Make Member
                                  </DropdownMenuItem>
                                )}
                                
                                {member.role !== ProjectRole.OBSERVER && (
                                  <DropdownMenuItem 
                                    onClick={() => handleChangeRole(
                                      member.userId, 
                                      ProjectRole.OBSERVER, 
                                      `${member.user?.firstName} ${member.user?.lastName}`
                                    )}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Make Observer
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleRemoveMember(
                                    member.userId, 
                                    `${member.user?.firstName} ${member.user?.lastName}`
                                  )}
                                  className="text-red-600"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Knowledge management functionality will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">File management functionality will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Non-member notice */}
      {!isProjectMember && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You are viewing this project as a visitor. Some features may be limited. 
            Contact a project lead to request access.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}; 