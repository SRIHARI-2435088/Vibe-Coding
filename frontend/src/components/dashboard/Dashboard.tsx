import React, { useState, useEffect } from 'react';
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
  Alert,
  AlertDescription,
  Skeleton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import {
  Users,
  FolderOpen,
  BookOpen,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  Plus,
  Crown,
  FileText,
  Calendar,
  Eye,
  Search,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';
import { adminApi } from '@/services/api/admin';
import { projectsApi } from '@/services/api/projects';
import { knowledgeApi } from '@/services/api/knowledge';
import { useToast } from '@/hooks/useToast';
import { KnowledgeForm } from '@/components/knowledge/KnowledgeForm';

interface DashboardData {
  user: {
    projects: number;
    knowledgeContributions: number;
  };
  overview: {
    totalKnowledge: number;
    recentKnowledge: number;
  };
  activity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    knowledgeTitle?: string;
  }>;
  admin?: {
    totalUsers: number;
    activeUsers: number;
    pendingApprovals: number;
    totalProjects: number;
    activeProjects: number;
    systemActivity: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
      user?: {
        firstName: string;
        lastName: string;
        email: string;
      };
      knowledgeTitle?: string;
    }>;
  };
}

export const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKnowledgeForm, setShowKnowledgeForm] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  
  const { user } = useAuth();
  const { 
    canCreateKnowledge, 
    canManageContent, 
    canViewAllProjects,
    isSystemAdmin,
    canManageUsers
  } = useGlobalPermissions();
  const { toast } = useToast();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboardStats();
      setDashboardData(data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available projects for knowledge creation
  const fetchAvailableProjects = async () => {
    try {
      const response = await projectsApi.getMyProjects();
      setAvailableProjects(response.projects);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
    }
  };

  // Handle quick knowledge creation
  const handleQuickKnowledge = () => {
    if (availableProjects.length === 0) {
      toast({
        title: 'No Projects',
        description: 'You need to be a member of at least one project to create knowledge items.',
        variant: 'destructive',
      });
      return;
    }
    setShowKnowledgeForm(true);
  };

  // Handle join project
  const handleJoinProject = async () => {
    try {
      // For now, show available projects
      const allProjects = await projectsApi.getAllProjects();
      const myProjects = await projectsApi.getMyProjects();
      const myProjectIds = myProjects.projects.map(p => p.id);
      const availableToJoin = allProjects.projects.filter(p => !myProjectIds.includes(p.id));
      
      if (availableToJoin.length === 0) {
        toast({
          title: 'No Projects Available',
          description: 'You are already a member of all available projects.',
        });
        return;
      }

      // For now, just show a message about available projects
      toast({
        title: 'Available Projects',
        description: `There are ${availableToJoin.length} projects you can join. Go to the Projects tab to join them.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load available projects',
        variant: 'destructive',
      });
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'USER_LOGIN': return <Activity className="h-4 w-4 text-green-500" />;
      case 'KNOWLEDGE_CREATED': return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'KNOWLEDGE_UPDATED': return <FileText className="h-4 w-4 text-orange-500" />;
      case 'PROJECT_JOINED': return <FolderOpen className="h-4 w-4 text-purple-500" />;
      case 'USER_SIGNUP': return <Users className="h-4 w-4 text-cyan-500" />;
      case 'USER_APPROVED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    fetchDashboardData();
    if (canCreateKnowledge()) {
      fetchAvailableProjects();
    }
  }, [user, canCreateKnowledge]);

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please log in to view the dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.firstName}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your knowledge transfer activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            {user.role.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            {/* My Projects */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.user.projects || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active project memberships
                </p>
              </CardContent>
            </Card>

            {/* My Contributions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Contributions</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.user.knowledgeContributions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Knowledge items created
                </p>
              </CardContent>
            </Card>

            {/* Total Knowledge */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.overview.totalKnowledge || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total items available
                </p>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.overview.recentKnowledge || 0}</div>
                <p className="text-xs text-muted-foreground">
                  New items this week
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Admin Stats (if admin/PM) */}
      {dashboardData?.admin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.admin.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.admin.activeUsers} active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.admin.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.admin.activeProjects} active projects
              </p>
            </CardContent>
          </Card>

          {dashboardData.admin.pendingApprovals > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardData.admin.pendingApprovals}
                </div>
                <p className="text-xs text-muted-foreground">
                  Users awaiting approval
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks you can perform quickly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {canCreateKnowledge() && (
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleQuickKnowledge}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Create Knowledge Item
              </Button>
            )}
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleJoinProject}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Join Project
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                // Navigate to knowledge search
                toast({
                  title: 'Coming Soon',
                  description: 'Advanced search functionality will be available soon.',
                });
              }}
            >
              <Search className="h-4 w-4 mr-2" />
              Search Knowledge
            </Button>

            {canViewAllProjects() && (
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  toast({
                    title: 'Navigate',
                    description: 'Go to the Projects tab to view all projects.',
                  });
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View All Projects
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your recent actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardData?.activity && dashboardData.activity.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.activity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      {activity.knowledgeTitle && (
                        <p className="text-xs text-muted-foreground">
                          Knowledge: {activity.knowledgeTitle}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-xs">Start creating knowledge items to see activity here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Activity for Admins */}
      {dashboardData?.admin?.systemActivity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Activity
            </CardTitle>
            <CardDescription>
              Recent system-wide activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {dashboardData.admin.systemActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    {activity.user && (
                      <p className="text-xs text-muted-foreground">
                        by {activity.user.firstName} {activity.user.lastName}
                      </p>
                    )}
                    {activity.knowledgeTitle && (
                      <p className="text-xs text-muted-foreground">
                        Knowledge: {activity.knowledgeTitle}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Knowledge Creation Dialog */}
      <Dialog open={showKnowledgeForm} onOpenChange={setShowKnowledgeForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Knowledge Item</DialogTitle>
            <DialogDescription>
              Share your knowledge with the team
            </DialogDescription>
          </DialogHeader>
          
          {availableProjects.length > 0 && (
            <KnowledgeForm
              projectId={availableProjects[0].id}
              onSave={(item) => {
                setShowKnowledgeForm(false);
                fetchDashboardData(); // Refresh dashboard data
                toast({
                  title: 'Success',
                  description: 'Knowledge item created successfully!',
                });
              }}
              onCancel={() => setShowKnowledgeForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 