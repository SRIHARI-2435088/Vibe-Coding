import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription
} from '@/components/ui';
import {
  AdminOnly,
  ManagerOrAdmin,
  RequireSystemRole,
  RequireProjectRole,
  RequirePermission,
  ProjectLeadOnly,
  ProjectMemberOrLead,
  CanCreateKnowledge,
  CanEditKnowledge,
  CanDeleteKnowledge,
  CanManageMembers,
  CanUploadFiles,
  CanManageProject,
  UserRoleBadge,
  ProjectRoleBadge,
  ShowIf
} from '@/components/auth/RBACComponents';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';
import { UserRole } from '@/services/api/auth';
import { ProjectRole } from '@/services/api/projects';
import { Crown, Shield, Users, Eye, Lock, Unlock, Settings, FileText, Upload, Trash2 } from 'lucide-react';

export const RBACDemo: React.FC = () => {
  const { user } = useAuth();
  const { isAuthenticated, isSystemAdmin, canManageUsers, canManageContent } = useGlobalPermissions();
  const [demoProjectId] = useState('demo-project-123');

  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>RBAC Demo</CardTitle>
          <CardDescription>Please log in to see role-based access control in action.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role-Based Access Control Demo
          </CardTitle>
          <CardDescription>
            This demo shows how different user roles see different UI elements and have different permissions.
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm font-medium">Your current role:</span>
            <UserRoleBadge role={user.role} />
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="system-roles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system-roles">System Roles</TabsTrigger>
          <TabsTrigger value="project-roles">Project Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="conditional">Conditional UI</TabsTrigger>
        </TabsList>

        {/* System Roles Tab */}
        <TabsContent value="system-roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Role-Based Components</CardTitle>
              <CardDescription>
                Components that show/hide based on your system-wide role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Admin Only Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Crown className="h-4 w-4 text-purple-600" />
                  Admin Only Features
                </h4>
                <AdminOnly 
                  fallback={
                    <Alert>
                      <Lock className="h-4 w-4" />
                      <AlertDescription>
                        🔒 This feature is only visible to Administrators
                      </AlertDescription>
                    </Alert>
                  }
                >
                  <Alert className="border-purple-200 bg-purple-50">
                    <Unlock className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-800">
                      🎉 Admin-only content! You can see this because you're an Administrator.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      System Settings
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Manage All Users
                    </Button>
                  </div>
                </AdminOnly>
              </div>

              <Separator />

              {/* Manager or Admin Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Manager or Admin Features
                </h4>
                <ManagerOrAdmin 
                  fallback={
                    <Alert>
                      <Lock className="h-4 w-4" />
                      <AlertDescription>
                        🔒 This feature requires Project Manager or Administrator role
                      </AlertDescription>
                    </Alert>
                  }
                >
                  <Alert className="border-blue-200 bg-blue-50">
                    <Unlock className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      🎉 Manager-level content! You can manage projects and content.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Manage Content
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Project Settings
                    </Button>
                  </div>
                </ManagerOrAdmin>
              </div>

              <Separator />

              {/* Role Comparison */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Role Comparison</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.CONTRIBUTOR, UserRole.VIEWER].map((role) => (
                    <Card key={role} className={user.role === role ? 'ring-2 ring-blue-500' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <UserRoleBadge role={role} />
                          {user.role === role && <Badge variant="outline">You</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <RequireSystemRole role={role} fallback={<span className="text-muted-foreground">Hidden</span>}>
                          <Alert className="border-green-200 bg-green-50">
                            <AlertDescription className="text-green-800 text-xs">
                              Visible to {role}
                            </AlertDescription>
                          </Alert>
                        </RequireSystemRole>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Roles Tab */}
        <TabsContent value="project-roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Role-Based Components</CardTitle>
              <CardDescription>
                Components that show/hide based on your role in a specific project.
                <br />
                <span className="text-xs text-muted-foreground">
                  Demo Project ID: {demoProjectId}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Lead Only */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  👑 Project Lead Only
                </h4>
                <ProjectLeadOnly 
                  projectId={demoProjectId}
                  fallback={
                    <Alert>
                      <Lock className="h-4 w-4" />
                      <AlertDescription>
                        🔒 Only project leads can see this content
                      </AlertDescription>
                    </Alert>
                  }
                >
                  <Alert className="border-purple-200 bg-purple-50">
                    <Unlock className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-800">
                      🎉 Project lead content! You can manage this project.
                    </AlertDescription>
                  </Alert>
                </ProjectLeadOnly>
              </div>

              <Separator />

              {/* Project Member or Lead */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  👥 Project Members & Leads
                </h4>
                <ProjectMemberOrLead 
                  projectId={demoProjectId}
                  fallback={
                    <Alert>
                      <Lock className="h-4 w-4" />
                      <AlertDescription>
                        🔒 Only project members and leads can see this content
                      </AlertDescription>
                    </Alert>
                  }
                >
                  <Alert className="border-blue-200 bg-blue-50">
                    <Unlock className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      🎉 Project member content! You can contribute to this project.
                    </AlertDescription>
                  </Alert>
                </ProjectMemberOrLead>
              </div>

              <Separator />

              {/* Project Role Comparison */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Project Role Comparison</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[ProjectRole.LEAD, ProjectRole.MEMBER, ProjectRole.OBSERVER].map((role) => (
                    <Card key={role}>
                      <CardHeader className="pb-3">
                        <ProjectRoleBadge role={role} />
                      </CardHeader>
                      <CardContent className="pt-0">
                        <RequireProjectRole 
                          projectId={demoProjectId} 
                          role={role} 
                          fallback={<span className="text-muted-foreground text-xs">Hidden from this role</span>}
                        >
                          <Alert className="border-green-200 bg-green-50">
                            <AlertDescription className="text-green-800 text-xs">
                              Visible to {role}s
                            </AlertDescription>
                          </Alert>
                        </RequireProjectRole>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission-Based Components</CardTitle>
              <CardDescription>
                Components that show/hide based on specific permissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Knowledge Permissions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Knowledge Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CanCreateKnowledge fallback={<Alert><AlertDescription className="text-xs">Cannot create</AlertDescription></Alert>}>
                    <Button size="sm" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Create Knowledge
                    </Button>
                  </CanCreateKnowledge>

                  <CanEditKnowledge fallback={<Alert><AlertDescription className="text-xs">Cannot edit</AlertDescription></Alert>}>
                    <Button size="sm" variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Knowledge
                    </Button>
                  </CanEditKnowledge>

                  <CanDeleteKnowledge fallback={<Alert><AlertDescription className="text-xs">Cannot delete</AlertDescription></Alert>}>
                    <Button size="sm" variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Knowledge
                    </Button>
                  </CanDeleteKnowledge>
                </div>
              </div>

              <Separator />

              {/* Project Management Permissions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Project Management Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CanManageMembers 
                    projectId={demoProjectId}
                    fallback={<Alert><AlertDescription className="text-xs">Cannot manage members</AlertDescription></Alert>}
                  >
                    <Button size="sm" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Members
                    </Button>
                  </CanManageMembers>

                  <CanUploadFiles fallback={<Alert><AlertDescription className="text-xs">Cannot upload</AlertDescription></Alert>}>
                    <Button size="sm" variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </CanUploadFiles>

                  <CanManageProject 
                    projectId={demoProjectId}
                    fallback={<Alert><AlertDescription className="text-xs">Cannot manage project</AlertDescription></Alert>}
                  >
                    <Button size="sm" variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Project Settings
                    </Button>
                  </CanManageProject>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conditional UI Tab */}
        <TabsContent value="conditional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conditional UI Rendering</CardTitle>
              <CardDescription>
                Examples of conditional rendering based on user state and permissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Admin Features */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Administrative Features</h4>
                <div className="flex flex-wrap gap-2">
                  <ShowIf condition={isSystemAdmin()}>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <Crown className="h-3 w-3 mr-1" />
                      System Administrator
                    </Badge>
                  </ShowIf>
                  
                  <ShowIf condition={canManageUsers()}>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Users className="h-3 w-3 mr-1" />
                      Can Manage Users
                    </Badge>
                  </ShowIf>
                  
                  <ShowIf condition={canManageContent()}>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <FileText className="h-3 w-3 mr-1" />
                      Can Manage Content
                    </Badge>
                  </ShowIf>
                </div>
              </div>

              <Separator />

              {/* User Info Display */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">User Information</h4>
                <Card className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{user.firstName} {user.lastName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <UserRoleBadge role={user.role} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Active:</span>
                      <ShowIf 
                        condition={user.isActive} 
                        fallback={<Badge variant="destructive">Inactive</Badge>}
                      >
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </ShowIf>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 