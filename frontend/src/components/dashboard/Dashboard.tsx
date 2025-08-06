import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Users,
  FolderOpen,
  BookOpen,
  Video,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  Calendar,
  Bell,
  Settings,
  Plus,
  Eye,
  Crown
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
  Alert,
  AlertDescription,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { projectsApi, ProjectsListResponse } from '@/services/api/projects';
import { knowledgeApi } from '@/services/api/knowledge';
import { adminApi, SystemStats, PendingUser, ActivityItem, adminUtils } from '@/services/api/admin';
import { useToast } from '@/hooks/useToast';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completed: number;
    userProjects: number;
  };
  knowledge: {
    total: number;
    recent: number;
    userContributions: number;
  };
  activity: ActivityItem[];
  systemStats?: SystemStats;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { isSystemAdmin, user, isAuthenticated } = useGlobalPermissions();
  const { toast } = useToast();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      
      // Fetch user projects and knowledge
      const [projectsResponse, userProjectsResponse, knowledgeResponse] = await Promise.all([
        projectsApi.getAllProjects(),
        projectsApi.getMyProjects(),
        knowledgeApi.searchKnowledge({ search: '', page: 1, limit: 100 })
      ]);

      // Calculate project stats
      const projectStats = {
        total: projectsResponse.projects.length,
        active: projectsResponse.projects.filter(p => p.status === 'ACTIVE').length,
        completed: projectsResponse.projects.filter(p => p.status === 'COMPLETED').length,
        userProjects: userProjectsResponse.projects.length
      };

      // Calculate knowledge stats
      const knowledgeStats = {
        total: knowledgeResponse.items.length,
        recent: knowledgeResponse.items.filter(item => {
          const createdDate = new Date(item.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdDate > weekAgo;
        }).length,
        userContributions: knowledgeResponse.items.filter(item => item.authorId === user?.id).length
      };

      const dashboardStats: DashboardStats = {
        projects: projectStats,
        knowledge: knowledgeStats,
        activity: []
      };

      // Fetch admin stats if user is admin
      if (isSystemAdmin()) {
        try {
          const [systemStats, recentActivity] = await Promise.all([
            adminApi.getSystemStats(),
            adminApi.getRecentActivity(10)
          ]);
          dashboardStats.systemStats = systemStats;
          dashboardStats.activity = recentActivity;
        } catch (error) {
          console.error('Error fetching admin stats:', error);
        }
      }

      setStats(dashboardStats);
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

  // Fetch pending users for admin
  const fetchPendingUsers = async () => {
    if (!isSystemAdmin()) return;

    try {
      setStatsLoading(true);
      const pending = await adminApi.getPendingUsers();
      setPendingUsers(pending);
    } catch (error: any) {
      console.error('Error fetching pending users:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle user approval
  const handleUserApproval = async (userId: string, approve: boolean, role: string) => {
    try {
      await adminApi.approveUser({
        userId,
        approve,
        role
      });

      toast({
        title: 'Success',
        description: `User ${approve ? 'approved' : 'rejected'} successfully`,
      });

      // Refresh pending users
      fetchPendingUsers();
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to process user approval',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchPendingUsers();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground">Here's what's happening in your workspace today.</p>
        </div>
        
        {isSystemAdmin() && (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Crown className="h-3 w-3 mr-1" />
            Administrator
          </Badge>
        )}
      </div>

      {/* Admin Alerts */}
      {isSystemAdmin() && pendingUsers.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Bell className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <span className="font-medium text-yellow-800">
              {pendingUsers.length} new user registration{pendingUsers.length > 1 ? 's' : ''} pending approval.
            </span>
            <Button 
              variant="link" 
              className="p-0 h-auto font-medium text-yellow-700"
              onClick={() => setActiveTab('admin')}
            >
              Review now →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.projects.userProjects || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.projects.total || 0} total projects
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Items</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.knowledge.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.knowledge.recent || 0} added this week
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Contributions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.knowledge.userContributions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Knowledge items created
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <RoleGuard fallback={
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.projects.active || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active projects
              </p>
            </CardContent>
          </Card>
        }>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.systemStats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.systemStats?.pendingApprovals || 0} pending approval
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </RoleGuard>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          {isSystemAdmin() && <TabsTrigger value="admin">Administration</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Project Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: stats?.projects.active || 0 },
                          { name: 'Completed', value: stats?.projects.completed || 0 },
                          { name: 'On Hold', value: (stats?.projects.total || 0) - (stats?.projects.active || 0) - (stats?.projects.completed || 0) }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {[].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : stats?.activity && stats.activity.length > 0 ? (
                    stats.activity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className="text-lg">{adminUtils.getActivityIcon(activity.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Your projects overview will be displayed here. Navigate to the Projects section for detailed management.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Knowledge base overview will be displayed here. Navigate to the Knowledge section for detailed management.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {isSystemAdmin() && (
          <TabsContent value="admin" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending User Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Pending User Approvals
                    {pendingUsers.length > 0 && (
                      <Badge variant="destructive">{pendingUsers.length}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Review and approve new user registrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : pendingUsers.length > 0 ? (
                    <div className="space-y-4">
                      {pendingUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {user.firstName[0]}{user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Applied: {new Date(user.requestedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleUserApproval(user.id, true, 'CONTRIBUTOR')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleUserApproval(user.id, false, '')}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No pending approvals</p>
                  )}
                </CardContent>
              </Card>

              {/* System Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>System Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : stats?.systemStats ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Users:</span>
                        <span className="font-medium">{stats.systemStats.totalUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Users:</span>
                        <span className="font-medium">{stats.systemStats.activeUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Projects:</span>
                        <span className="font-medium">{stats.systemStats.totalProjects}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Knowledge Items:</span>
                        <span className="font-medium">{stats.systemStats.totalKnowledgeItems}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Statistics not available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}; 