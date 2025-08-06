import React, { useState, useEffect } from 'react';
import {
  Play,
  Upload,
  Search,
  Filter,
  Video,
  Clock,
  Eye,
  Download,
  Share2,
  Star,
  Calendar,
  User,
  Tag,
  Grid,
  List,
  Trash2,
  Edit,
  FileVideo,
  PlayCircle,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Avatar,
  AvatarFallback,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Skeleton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';
import { RoleGuard, PermissionGuard } from '@/components/auth/RoleGuard';
import { filesApi } from '@/services/api/files';
import { projectsApi } from '@/services/api/projects';
import { useToast } from '@/hooks/useToast';

interface VideoFile {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  mimeType: string;
  duration?: number;
  resolution?: string;
  thumbnail?: string;
  projectId?: string;
  knowledgeItemId?: string;
  uploadedBy: string;
  uploadedAt: string;
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  viewCount?: number;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

interface VideoFilters {
  search: string;
  category: string;
  projectId: string;
  tags: string[];
  sortBy: 'recent' | 'popular' | 'title' | 'duration';
  sortOrder: 'asc' | 'desc';
}

interface VideoStats {
  total: number;
  totalSize: number;
  totalDuration: number;
  byCategory: Record<string, number>;
  byProject: Record<string, number>;
  recentUploads: number;
  userUploads: number;
}

export const VideoLibrary: React.FC = () => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filters, setFilters] = useState<VideoFilters>({
    search: '',
    category: '',
    projectId: '',
    tags: [],
    sortBy: 'recent',
    sortOrder: 'desc'
  });

  const { isAuthenticated, user } = useGlobalPermissions();
  const { toast } = useToast();

  // Video categories
  const categories = [
    'Tutorial', 'Demo', 'Meeting', 'Training', 'Presentation',
    'Documentation', 'Review', 'Architecture', 'Deployment'
  ];

  // Fetch video files
  const fetchVideos = async () => {
    try {
      setSearchLoading(true);
      
      // This would need to be implemented in the files API to filter by video files
      const response = await filesApi.getFilesByType('video', {
        search: filters.search,
        category: filters.category,
        projectId: filters.projectId,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
      setVideos(response.files || []);
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load video library',
        variant: 'destructive',
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Fetch video statistics
  const fetchVideoStats = async () => {
    try {
      const [userProjectsResponse] = await Promise.all([
        projectsApi.getMyProjects()
      ]);

      // Mock video data for now - would be replaced with real API calls
      const mockVideos: VideoFile[] = [
        {
          id: '1',
          originalName: 'Project Onboarding.mp4',
          filename: 'project-onboarding-2024.mp4',
          size: 156789012,
          mimeType: 'video/mp4',
          duration: 1235,
          resolution: '1920x1080',
          thumbnail: '/thumbnails/onboarding.jpg',
          projectId: 'proj-1',
          uploadedBy: user?.id || 'user-1',
          uploadedAt: '2024-01-15T10:00:00Z',
          title: 'Project Onboarding Guide',
          description: 'Complete guide for new team members joining the project',
          tags: ['onboarding', 'tutorial', 'training'],
          category: 'Tutorial',
          viewCount: 45,
          author: {
            id: user?.id || 'user-1',
            firstName: user?.firstName || 'John',
            lastName: user?.lastName || 'Doe',
            email: user?.email || 'john.doe@example.com'
          },
          project: {
            id: 'proj-1',
            name: 'Main Project'
          }
        },
        {
          id: '2',
          originalName: 'Architecture Review.mp4',
          filename: 'architecture-review-q1.mp4',
          size: 234567890,
          mimeType: 'video/mp4',
          duration: 2456,
          resolution: '1920x1080',
          projectId: 'proj-1',
          uploadedBy: 'user-2',
          uploadedAt: '2024-01-10T14:30:00Z',
          title: 'Q1 Architecture Review',
          description: 'Quarterly architecture review and planning session',
          tags: ['architecture', 'planning', 'review'],
          category: 'Review',
          viewCount: 23,
          author: {
            id: 'user-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com'
          },
          project: {
            id: 'proj-1',
            name: 'Main Project'
          }
        },
        {
          id: '3',
          originalName: 'API Demo.mp4',
          filename: 'api-demo-v2.mp4',
          size: 98765432,
          mimeType: 'video/mp4',
          duration: 876,
          resolution: '1280x720',
          projectId: 'proj-2',
          uploadedBy: user?.id || 'user-1',
          uploadedAt: '2024-01-12T09:15:00Z',
          title: 'API v2.0 Demo',
          description: 'Demonstration of new API features and improvements',
          tags: ['api', 'demo', 'features'],
          category: 'Demo',
          viewCount: 67,
          author: {
            id: user?.id || 'user-1',
            firstName: user?.firstName || 'John',
            lastName: user?.lastName || 'Doe',
            email: user?.email || 'john.doe@example.com'
          },
          project: {
            id: 'proj-2',
            name: 'API Project'
          }
        }
      ];

      // Filter by current filters
      let filteredVideos = mockVideos;
      if (filters.search) {
        filteredVideos = filteredVideos.filter(video =>
          video.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
          video.description?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      if (filters.category) {
        filteredVideos = filteredVideos.filter(video => video.category === filters.category);
      }
      if (filters.projectId) {
        filteredVideos = filteredVideos.filter(video => video.projectId === filters.projectId);
      }

      setVideos(filteredVideos);

      // Calculate stats
      const byCategory: Record<string, number> = {};
      const byProject: Record<string, number> = {};
      let totalSize = 0;
      let totalDuration = 0;

      mockVideos.forEach(video => {
        if (video.category) {
          byCategory[video.category] = (byCategory[video.category] || 0) + 1;
        }
        if (video.project?.name) {
          byProject[video.project.name] = (byProject[video.project.name] || 0) + 1;
        }
        totalSize += video.size;
        totalDuration += video.duration || 0;
      });

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentUploads = mockVideos.filter(video =>
        new Date(video.uploadedAt) > weekAgo
      ).length;

      const userUploads = mockVideos.filter(video =>
        video.uploadedBy === user?.id
      ).length;

      const videoStats: VideoStats = {
        total: mockVideos.length,
        totalSize,
        totalDuration,
        byCategory,
        byProject,
        recentUploads,
        userUploads
      };

      setStats(videoStats);

      // Set available projects
      const projectList = userProjectsResponse.projects.map(p => p.project);
      setProjects(projectList);
    } catch (error: any) {
      console.error('Error fetching video stats:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchVideoStats();
      setLoading(false);
    };

    if (isAuthenticated) {
      initializeData();
    }
  }, [isAuthenticated, user]);

  // Update when filters change
  useEffect(() => {
    if (!loading) {
      fetchVideoStats();
    }
  }, [filters]);

  // Utility functions
  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Handle video actions
  const handlePlay = (video: VideoFile) => {
    setSelectedVideo(video);
    setIsPlaying(true);
  };

  const handleDownload = async (video: VideoFile) => {
    try {
      await filesApi.downloadFile(video.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download video',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (video: VideoFile) => {
    try {
      await filesApi.deleteFile(video.id);
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
      fetchVideoStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete video',
        variant: 'destructive',
      });
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      projectId: '',
      tags: [],
      sortBy: 'recent',
      sortOrder: 'desc'
    });
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertDescription>
          Please log in to access the video library.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Video Library</h1>
          <p className="text-muted-foreground">
            Browse and manage video content across projects
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <RoleGuard
            requiredPermission="canUploadFiles"
            fallback={null}
          >
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Video
            </Button>
          </RoleGuard>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(stats?.totalSize || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatTotalDuration(stats?.totalDuration || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Video content
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.recentUploads || 0}</div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Uploads</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.userUploads || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Videos uploaded
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                value={filters.projectId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, projectId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.sortBy}
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sortOrder}
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortOrder: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {searchLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
            </Card>
          ))
        ) : videos.length > 0 ? (
          videos.map((video) => (
            <Card key={video.id} className="hover:shadow-md transition-shadow group">
              {viewMode === 'grid' ? (
                <>
                  <CardHeader className="pb-3">
                    <div className="relative">
                      <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <FileVideo className="h-12 w-12 text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center rounded-md">
                          <Button
                            size="lg"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handlePlay(video)}
                          >
                            <PlayCircle className="h-6 w-6 mr-2" />
                            Play
                          </Button>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration || 0)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {video.title}
                      </CardTitle>
                      {video.description && (
                        <CardDescription className="line-clamp-2">
                          {video.description}
                        </CardDescription>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {video.category && (
                        <Badge variant="secondary">{video.category}</Badge>
                      )}
                      {video.project && (
                        <Badge variant="outline">{video.project.name}</Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {video.author?.firstName?.[0]}{video.author?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>{video.author?.firstName} {video.author?.lastName}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{video.viewCount || 0}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(video)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <RoleGuard
                              projectId={video.projectId}
                              requiredPermission="canDeleteFiles"
                              fallback={null}
                            >
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(video)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </RoleGuard>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                // List view
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-32 h-20 bg-gray-200 rounded flex items-center justify-center">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <FileVideo className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{video.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {video.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{video.author?.firstName} {video.author?.lastName}</span>
                        <span>{formatDuration(video.duration || 0)}</span>
                        <span>{formatFileSize(video.size)}</span>
                        <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handlePlay(video)}>
                        <Play className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(video)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <RoleGuard
                            projectId={video.projectId}
                            requiredPermission="canDeleteFiles"
                            fallback={null}
                          >
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(video)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </RoleGuard>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Alert>
              <AlertDescription>
                No videos found matching your criteria. Try adjusting your search or filters.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
            <DialogDescription>
              {selectedVideo?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <video
                  controls
                  className="w-full h-full rounded-lg"
                  src={`/api/files/${selectedVideo.id}/preview`}
                  poster={selectedVideo.thumbnail}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>Duration: {formatDuration(selectedVideo.duration || 0)}</span>
                  <span>Size: {formatFileSize(selectedVideo.size)}</span>
                  <span>Views: {selectedVideo.viewCount || 0}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleDownload(selectedVideo)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 