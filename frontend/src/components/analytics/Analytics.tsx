import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/components/ui';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Eye,
  Download,
  Calendar,
  Target,
  Clock,
  Award,
  Activity,
  FileText,
  Video,
  Share2,
  MessageSquare,
  ThumbsUp,
  Star,
  Zap,
  Filter
} from 'lucide-react';
import { adminApi } from '@/services/api/admin';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';
import { useToast } from '@/hooks/useToast';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    activeProjects: number;
    totalKnowledge: number;
    knowledgeViews: number;
    weeklyGrowth: number;
    engagement: number;
  };
  knowledge: {
    byCategory: Array<{ category: string; count: number; growth: number }>;
    byType: Array<{ type: string; count: number; percentage: number }>;
    topContributors: Array<{ user: string; contributions: number; views: number }>;
    recentActivity: Array<{ action: string; user: string; item: string; timestamp: string }>;
    popularItems: Array<{ title: string; views: number; likes: number; type: string }>;
  };
  projects: {
    statusDistribution: Array<{ status: string; count: number; percentage: number }>;
    completionRates: Array<{ project: string; completion: number; members: number }>;
    collaboration: Array<{ metric: string; value: number; change: number }>;
  };
  users: {
    activityLevels: Array<{ level: string; count: number; percentage: number }>;
    roleDistribution: Array<{ role: string; count: number; percentage: number }>;
    engagementTrends: Array<{ date: string; logins: number; actions: number }>;
  };
}

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  const { canViewAllProjects, isAuthenticated } = useGlobalPermissions();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalyticsData();
    }
  }, [isAuthenticated, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // In a real app, this would be a comprehensive analytics API
      const response = await adminApi.getDashboardStats();
      
      // Transform the data into analytics format
      const analyticsData: AnalyticsData = {
        overview: {
          totalUsers: response.systemStats?.totalUsers || 0,
          activeUsers: Math.floor((response.systemStats?.totalUsers || 0) * 0.7),
          totalProjects: response.projects?.total || 0,
          activeProjects: response.projects?.active || 0,
          totalKnowledge: response.knowledge?.total || 0,
          knowledgeViews: response.knowledge?.totalViews || 0,
          weeklyGrowth: 12.5,
          engagement: 78.3
        },
        knowledge: {
          byCategory: [
            { category: 'Technical', count: 45, growth: 15.2 },
            { category: 'Process', count: 32, growth: 8.7 },
            { category: 'Documentation', count: 28, growth: 22.1 },
            { category: 'Best Practices', count: 19, growth: 5.3 },
            { category: 'Troubleshooting', count: 16, growth: 18.9 }
          ],
          byType: [
            { type: 'Articles', count: 67, percentage: 47.5 },
            { type: 'Tutorials', count: 38, percentage: 26.9 },
            { type: 'FAQs', count: 22, percentage: 15.6 },
            { type: 'Guides', count: 14, percentage: 10.0 }
          ],
          topContributors: [
            { user: 'John Smith', contributions: 23, views: 1540 },
            { user: 'Sarah Johnson', contributions: 18, views: 1220 },
            { user: 'Mike Chen', contributions: 15, views: 980 },
            { user: 'Lisa Wong', contributions: 12, views: 760 }
          ],
          recentActivity: [
            { action: 'Created article', user: 'John Smith', item: 'React Best Practices', timestamp: '2 hours ago' },
            { action: 'Updated guide', user: 'Sarah Johnson', item: 'API Documentation', timestamp: '4 hours ago' },
            { action: 'Viewed tutorial', user: 'Mike Chen', item: 'TypeScript Basics', timestamp: '6 hours ago' },
            { action: 'Liked article', user: 'Lisa Wong', item: 'Database Optimization', timestamp: '8 hours ago' }
          ],
          popularItems: [
            { title: 'React Component Patterns', views: 342, likes: 28, type: 'Tutorial' },
            { title: 'API Best Practices', views: 298, likes: 35, type: 'Article' },
            { title: 'Database Design Guide', views: 267, likes: 22, type: 'Guide' },
            { title: 'Security Checklist', views: 234, likes: 31, type: 'Reference' }
          ]
        },
        projects: {
          statusDistribution: [
            { status: 'Active', count: 12, percentage: 48.0 },
            { status: 'Planning', count: 6, percentage: 24.0 },
            { status: 'Completed', count: 5, percentage: 20.0 },
            { status: 'On Hold', count: 2, percentage: 8.0 }
          ],
          completionRates: [
            { project: 'E-commerce Platform', completion: 85, members: 8 },
            { project: 'Mobile App', completion: 67, members: 5 },
            { project: 'Analytics Dashboard', completion: 92, members: 6 },
            { project: 'API Gateway', completion: 43, members: 4 }
          ],
          collaboration: [
            { metric: 'Knowledge Sharing', value: 156, change: 23.4 },
            { metric: 'Team Discussions', value: 89, change: 12.7 },
            { metric: 'File Uploads', value: 67, change: 8.9 },
            { metric: 'Cross-team Collaboration', value: 34, change: 15.2 }
          ]
        },
        users: {
          activityLevels: [
            { level: 'Highly Active', count: 18, percentage: 45.0 },
            { level: 'Moderately Active', count: 14, percentage: 35.0 },
            { level: 'Low Activity', count: 6, percentage: 15.0 },
            { level: 'Inactive', count: 2, percentage: 5.0 }
          ],
          roleDistribution: [
            { role: 'Contributors', count: 22, percentage: 55.0 },
            { role: 'Project Managers', count: 12, percentage: 30.0 },
            { role: 'Admins', count: 4, percentage: 10.0 },
            { role: 'Viewers', count: 2, percentage: 5.0 }
          ],
          engagementTrends: [
            { date: 'Mon', logins: 28, actions: 145 },
            { date: 'Tue', logins: 32, actions: 167 },
            { date: 'Wed', logins: 29, actions: 134 },
            { date: 'Thu', logins: 35, actions: 189 },
            { date: 'Fri', logins: 31, actions: 156 },
            { date: 'Sat', logins: 18, actions: 87 },
            { date: 'Sun', logins: 15, actions: 73 }
          ]
        }
      };

      setData(analyticsData);
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderMetricCard = (title: string, value: string | number, change?: number, icon?: React.ReactNode) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                <TrendingUp className="h-3 w-3" />
                {change >= 0 ? '+' : ''}{change}%
              </p>
            )}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Please log in to view analytics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track performance, engagement, and growth across your knowledge platform
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Knowledge</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Projects</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  {renderMetricCard('Total Users', data?.overview.totalUsers || 0, 12.5, <Users className="h-4 w-4" />)}
                  {renderMetricCard('Active Projects', data?.overview.activeProjects || 0, 8.3, <Target className="h-4 w-4" />)}
                  {renderMetricCard('Knowledge Items', data?.overview.totalKnowledge || 0, 15.7, <BookOpen className="h-4 w-4" />)}
                  {renderMetricCard('Total Views', data?.overview.knowledgeViews || 0, 22.1, <Eye className="h-4 w-4" />)}
                </>
              )}
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Platform Health
                  </CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>User Engagement</span>
                      <span className="font-medium">{data?.overview.engagement || 0}%</span>
                    </div>
                    <Progress value={data?.overview.engagement || 0} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active Users Rate</span>
                      <span className="font-medium">
                        {data ? Math.round((data.overview.activeUsers / data.overview.totalUsers) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={data ? (data.overview.activeUsers / data.overview.totalUsers) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Project Success Rate</span>
                      <span className="font-medium">
                        {data ? Math.round((data.overview.activeProjects / data.overview.totalProjects) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={data ? (data.overview.activeProjects / data.overview.totalProjects) * 100 : 0}
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Recent Highlights
                  </CardTitle>
                  <CardDescription>Notable achievements and activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                      <Award className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">New Knowledge Milestone</p>
                        <p className="text-xs text-muted-foreground">Reached 100+ published articles</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <Star className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Top Contributor</p>
                        <p className="text-xs text-muted-foreground">John Smith leads with 23 contributions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Growth Trend</p>
                        <p className="text-xs text-muted-foreground">22% increase in knowledge views</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Knowledge Tab */}
        <TabsContent value="knowledge">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Knowledge by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge by Category</CardTitle>
                  <CardDescription>Distribution of content across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.knowledge.byCategory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" style={{ 
                            backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                          }} />
                          <span className="text-sm font-medium">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{item.count}</span>
                          <Badge variant="outline" className="text-xs">
                            +{item.growth}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Contributors */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Contributors</CardTitle>
                  <CardDescription>Most active knowledge creators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.knowledge.topContributors.map((contributor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{contributor.user}</p>
                            <p className="text-xs text-muted-foreground">
                              {contributor.contributions} contributions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{contributor.views}</p>
                          <p className="text-xs text-muted-foreground">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Popular Content</CardTitle>
                  <CardDescription>Highest viewed knowledge items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.knowledge.popularItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{item.type}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {item.views}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {item.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest knowledge base activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.knowledge.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                        <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span> {activity.action}
                            <span className="font-medium"> "{activity.item}"</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                  <CardDescription>Current state of all projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.projects.statusDistribution.map((status, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{status.status}</span>
                          <span>{status.count} ({status.percentage}%)</span>
                        </div>
                        <Progress value={status.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Collaboration Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Collaboration Metrics</CardTitle>
                  <CardDescription>Team interaction and sharing activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.projects.collaboration.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{metric.metric}</p>
                          <p className="text-2xl font-bold">{metric.value}</p>
                        </div>
                        <Badge variant={metric.change >= 0 ? 'default' : 'destructive'}>
                          {metric.change >= 0 ? '+' : ''}{metric.change}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Completion Rates */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                  <CardDescription>Completion status of active projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.projects.completionRates.map((project, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{project.project}</p>
                            <p className="text-sm text-muted-foreground">{project.members} team members</p>
                          </div>
                          <span className="text-lg font-bold">{project.completion}%</span>
                        </div>
                        <Progress value={project.completion} className="h-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Activity Levels */}
              <Card>
                <CardHeader>
                  <CardTitle>User Activity Levels</CardTitle>
                  <CardDescription>Engagement distribution across users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.users.activityLevels.map((level, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{level.level}</span>
                          <span>{level.count} users ({level.percentage}%)</span>
                        </div>
                        <Progress value={level.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Role Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Role Distribution</CardTitle>
                  <CardDescription>User roles across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.users.roleDistribution.map((role, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" style={{ 
                            backgroundColor: `hsl(${index * 90}, 60%, 50%)` 
                          }} />
                          <span className="font-medium">{role.role}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{role.count}</p>
                          <p className="text-xs text-muted-foreground">{role.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Trends */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Weekly Engagement Trends</CardTitle>
                  <CardDescription>Daily login and activity patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.users.engagementTrends.map((day, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 items-center p-3 rounded-lg border">
                        <span className="font-medium">{day.date}</span>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{day.logins} logins</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span>{day.actions} actions</span>
                        </div>
                        <Progress value={(day.actions / 200) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 