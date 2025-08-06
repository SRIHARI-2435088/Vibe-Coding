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
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  FolderOpen,
  BookOpen,
  Eye,
  Clock,
  Activity,
  Download,
  Upload,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Filter,
  RefreshCw,
  FileText,
  Video,
  Image,
  Archive
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  Skeleton,
} from '@/components/ui';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { projectsApi } from '@/services/api/projects';
import { knowledgeApi } from '@/services/api/knowledge';
import { adminApi } from '@/services/api/admin';
import { useToast } from '@/hooks/useToast';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff8042'];

interface AnalyticsData {
  overview: {
    totalProjects: number;
    activeProjects: number;
    totalKnowledge: number;
    totalUsers: number;
    totalFiles: number;
    totalFileSize: number;
  };
  projectMetrics: {
    byStatus: Array<{ name: string; value: number; percentage: number }>;
    byMonth: Array<{ month: string; created: number; completed: number }>;
    topProjects: Array<{ name: string; members: number; knowledge: number; files: number }>;
  };
  knowledgeMetrics: {
    byCategory: Array<{ name: string; value: number; percentage: number }>;
    byType: Array<{ name: string; value: number }>;
    viewTrends: Array<{ date: string; views: number; created: number }>;
    topContributors: Array<{ name: string; contributions: number; views: number }>;
  };
  userMetrics: {
    activeUsers: Array<{ date: string; count: number }>;
    userActivity: Array<{ name: string; projects: number; knowledge: number; files: number }>;
    registrationTrends: Array<{ month: string; registrations: number; approvals: number }>;
  };
  fileMetrics: {
    byType: Array<{ name: string; count: number; size: number }>;
    uploadTrends: Array<{ date: string; uploads: number; size: number }>;
    storageUsage: Array<{ category: string; used: number; total: number }>;
  };
}

interface DateRange {
  start: Date;
  end: Date;
  preset: '7d' | '30d' | '90d' | '1y' | 'custom';
}

export const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
    preset: '30d'
  });
  const [activeTab, setActiveTab] = useState('overview');

  const { isSystemAdmin, isAuthenticated, user } = useGlobalPermissions();
  const { toast } = useToast();

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch data from multiple sources
      const [projectsResponse, userProjectsResponse, knowledgeResponse] = await Promise.all([
        projectsApi.getAllProjects(),
        projectsApi.getMyProjects(),
        knowledgeApi.searchKnowledge({ query: '', page: 1, limit: 1000 })
      ]);

      // Get admin data if user is admin
      let systemStats = null;
      if (isSystemAdmin()) {
        try {
          systemStats = await adminApi.getSystemStats();
        } catch (error) {
          console.error('Error fetching admin stats:', error);
        }
      }

      // Process projects data
      const allProjects = projectsResponse.projects;
      const projectsByStatus = allProjects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalProjects = allProjects.length;
      const projectStatusData = Object.entries(projectsByStatus).map(([status, count]) => ({
        name: status,
        value: count,
        percentage: Math.round((count / totalProjects) * 100)
      }));

      // Mock monthly project data
      const projectMonthlyData = [
        { month: 'Jan', created: 5, completed: 3 },
        { month: 'Feb', created: 8, completed: 4 },
        { month: 'Mar', created: 6, completed: 7 },
        { month: 'Apr', created: 10, completed: 5 },
        { month: 'May', created: 7, completed: 8 },
        { month: 'Jun', created: 12, completed: 6 }
      ];

      // Process knowledge data
      const allKnowledge = knowledgeResponse.items;
      const knowledgeByCategory = allKnowledge.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalKnowledge = allKnowledge.length;
      const knowledgeCategoryData = Object.entries(knowledgeByCategory).map(([category, count]) => ({
        name: category,
        value: count,
        percentage: Math.round((count / totalKnowledge) * 100)
      }));

      const knowledgeByType = allKnowledge.reduce((acc, item) => {
        const type = item.type || 'Article';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const knowledgeTypeData = Object.entries(knowledgeByType).map(([type, count]) => ({
        name: type,
        value: count
      }));

      // Mock knowledge view trends
      const viewTrendsData = [
        { date: '2024-01-01', views: 150, created: 5 },
        { date: '2024-01-02', views: 180, created: 3 },
        { date: '2024-01-03', views: 200, created: 7 },
        { date: '2024-01-04', views: 170, created: 4 },
        { date: '2024-01-05', views: 220, created: 6 },
        { date: '2024-01-06', views: 190, created: 2 },
        { date: '2024-01-07', views: 240, created: 8 }
      ];

      // Mock top contributors
      const topContributors = [
        { name: user?.firstName + ' ' + user?.lastName || 'John Doe', contributions: 15, views: 450 },
        { name: 'Jane Smith', contributions: 12, views: 380 },
        { name: 'Bob Johnson', contributions: 8, views: 290 },
        { name: 'Alice Brown', contributions: 6, views: 210 }
      ];

      // Mock user metrics
      const activeUsersData = [
        { date: '2024-01-01', count: 25 },
        { date: '2024-01-02', count: 28 },
        { date: '2024-01-03', count: 32 },
        { date: '2024-01-04', count: 30 },
        { date: '2024-01-05', count: 35 },
        { date: '2024-01-06', count: 33 },
        { date: '2024-01-07', count: 38 }
      ];

      const userActivityData = [
        { name: 'Active Contributors', projects: 8, knowledge: 45, files: 120 },
        { name: 'Regular Users', projects: 15, knowledge: 78, files: 89 },
        { name: 'Observers', projects: 25, knowledge: 12, files: 34 }
      ];

      const registrationTrendsData = [
        { month: 'Jan', registrations: 8, approvals: 6 },
        { month: 'Feb', registrations: 12, approvals: 10 },
        { month: 'Mar', registrations: 6, approvals: 5 },
        { month: 'Apr', registrations: 15, approvals: 12 },
        { month: 'May', registrations: 9, approvals: 8 },
        { month: 'Jun', registrations: 11, approvals: 9 }
      ];

      // Mock file metrics
      const fileTypeData = [
        { name: 'Documents', count: 156, size: 245 * 1024 * 1024 },
        { name: 'Images', count: 89, size: 123 * 1024 * 1024 },
        { name: 'Videos', count: 23, size: 1.2 * 1024 * 1024 * 1024 },
        { name: 'Archives', count: 34, size: 89 * 1024 * 1024 }
      ];

      const uploadTrendsData = [
        { date: '2024-01-01', uploads: 12, size: 45 },
        { date: '2024-01-02', uploads: 8, size: 32 },
        { date: '2024-01-03', uploads: 15, size: 67 },
        { date: '2024-01-04', uploads: 11, size: 28 },
        { date: '2024-01-05', uploads: 18, size: 89 },
        { date: '2024-01-06', uploads: 9, size: 41 },
        { date: '2024-01-07', uploads: 14, size: 56 }
      ];

      const storageUsageData = [
        { category: 'Projects', used: 2.3, total: 5.0 },
        { category: 'Knowledge', used: 1.8, total: 3.0 },
        { category: 'Media', used: 4.1, total: 10.0 },
        { category: 'Backup', used: 0.9, total: 2.0 }
      ];

      // Calculate totals
      const totalFiles = fileTypeData.reduce((sum, type) => sum + type.count, 0);
      const totalFileSize = fileTypeData.reduce((sum, type) => sum + type.size, 0);

      const analytics: AnalyticsData = {
        overview: {
          totalProjects,
          activeProjects: projectsByStatus.ACTIVE || 0,
          totalKnowledge,
          totalUsers: systemStats?.totalUsers || 45,
          totalFiles,
          totalFileSize
        },
        projectMetrics: {
          byStatus: projectStatusData,
          byMonth: projectMonthlyData,
          topProjects: allProjects.slice(0, 5).map(project => ({
            name: project.name,
            members: project.memberCount || 0,
            knowledge: Math.floor(Math.random() * 20) + 1,
            files: Math.floor(Math.random() * 50) + 1
          }))
        },
        knowledgeMetrics: {
          byCategory: knowledgeCategoryData,
          byType: knowledgeTypeData,
          viewTrends: viewTrendsData,
          topContributors
        },
        userMetrics: {
          activeUsers: activeUsersData,
          userActivity: userActivityData,
          registrationTrends: registrationTrendsData
        },
        fileMetrics: {
          byType: fileTypeData,
          uploadTrends: uploadTrendsData,
          storageUsage: storageUsageData
        }
      };

      setAnalyticsData(analytics);
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initialize data
  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalyticsData();
    }
  }, [isAuthenticated, dateRange]);

  // Utility functions
  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatPercentage = (value: number, total: number): string => {
    return total > 0 ? `${Math.round((value / total) * 100)}%` : '0%';
  };

  const handleDateRangeChange = (preset: string) => {
    const now = new Date();
    let start = new Date();

    switch (preset) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    setDateRange({
      start,
      end: now,
      preset: preset as any
    });
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertDescription>
          Please log in to access analytics.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights and metrics across your workspace
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={dateRange.preset} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchAnalyticsData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{analyticsData?.overview.totalProjects || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.overview.activeProjects || 0} active
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
                <div className="text-2xl font-bold">{analyticsData?.overview.totalKnowledge || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Articles and guides
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <RoleGuard fallback={
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Files Uploaded</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{analyticsData?.overview.totalFiles || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(analyticsData?.overview.totalFileSize || 0)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        }>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{analyticsData?.overview.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </RoleGuard>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatFileSize(analyticsData?.overview.totalFileSize || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all files
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>
                  Current status of all projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.projectMetrics.byStatus || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                      >
                        {analyticsData?.projectMetrics.byStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Knowledge Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Knowledge by Category</CardTitle>
                <CardDescription>
                  Distribution of knowledge items
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analyticsData?.knowledgeMetrics.byCategory || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Views & Creation Trends</CardTitle>
              <CardDescription>
                Daily knowledge activity over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.knowledgeMetrics.viewTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Views"
                    />
                    <Area
                      type="monotone"
                      dataKey="created"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Created"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Project Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Project Creation & Completion</CardTitle>
                <CardDescription>
                  Monthly project activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData?.projectMetrics.byMonth || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="created" fill="#8884d8" name="Created" />
                      <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Top Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Top Projects</CardTitle>
                <CardDescription>
                  Projects by activity metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))
                  ) : (
                    analyticsData?.projectMetrics.topProjects.map((project, index) => (
                      <div key={project.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {project.members} members
                          </p>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {project.knowledge}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {project.files}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Knowledge Types */}
            <Card>
              <CardHeader>
                <CardTitle>Knowledge by Type</CardTitle>
                <CardDescription>
                  Distribution of content types
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.knowledgeMetrics.byType || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {analyticsData?.knowledgeMetrics.byType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Contributors</CardTitle>
                <CardDescription>
                  Most active knowledge contributors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))
                  ) : (
                    analyticsData?.knowledgeMetrics.topContributors.map((contributor, index) => (
                      <div key={contributor.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium">{contributor.name}</span>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{contributor.contributions} articles</span>
                          <span>{contributor.views} views</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <RoleGuard fallback={
            <Alert>
              <AlertDescription>
                User analytics are only available to administrators.
              </AlertDescription>
            </Alert>
          }>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Users Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                  <CardDescription>
                    Daily active user count
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={analyticsData?.userMetrics.activeUsers || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Registration Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>User Registrations</CardTitle>
                  <CardDescription>
                    Monthly registration and approval trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analyticsData?.userMetrics.registrationTrends || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="registrations" fill="#ff7300" name="Registrations" />
                        <Bar dataKey="approvals" fill="#82ca9d" name="Approvals" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* User Activity */}
            <Card>
              <CardHeader>
                <CardTitle>User Activity Distribution</CardTitle>
                <CardDescription>
                  Activity across different user groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData?.userMetrics.userActivity || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="projects" fill="#8884d8" name="Projects" />
                      <Bar dataKey="knowledge" fill="#82ca9d" name="Knowledge" />
                      <Bar dataKey="files" fill="#ffc658" name="Files" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </RoleGuard>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 