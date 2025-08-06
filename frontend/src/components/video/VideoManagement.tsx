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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  Skeleton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Progress,
} from '@/components/ui';
import {
  Video,
  Upload,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  Download,
  Share2,
  Clock,
  Calendar,
  User,
  Tag,
  Search,
  Filter,
  MoreHorizontal,
  FileVideo,
  Plus,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { filesApi } from '@/services/api/files';
import { projectsApi } from '@/services/api/projects';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';
import { useToast } from '@/hooks/useToast';

interface VideoFile {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  projectId?: string;
  duration?: number;
  thumbnail?: string;
  views?: number;
  isPublic?: boolean;
  status: 'PROCESSING' | 'READY' | 'ERROR';
}

interface VideoFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  projectId?: string;
  isPublic: boolean;
}

const VIDEO_CATEGORIES = [
  'Tutorial',
  'Training',
  'Demo',
  'Meeting Recording',
  'Presentation',
  'Review',
  'Documentation',
  'Other'
];

export const VideoManagement: React.FC = () => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('my-videos');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { canUploadFiles, canManageAllFiles, user } = useGlobalPermissions();
  const { toast } = useToast();

  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    projectId: '',
    isPublic: false,
  });

  // Fetch videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      // Using files API with video filter
      const response = await filesApi.getFiles({
        type: 'video',
        uploadedBy: activeTab === 'my-videos' ? user?.id : undefined,
      });
      setVideos(response.files || []);
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load videos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects for dropdown
  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getMyProjects();
      setProjects(response.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [activeTab]);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle form input changes
  const handleInputChange = (field: keyof VideoFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle tags
  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: [],
      projectId: '',
      isPublic: false,
    });
    setSelectedFile(null);
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select a video file',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      // Auto-populate title from filename
      setFormData(prev => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));
    }
  };

  // Handle video upload
  const handleUploadVideo = async () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a video file to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('tags', formData.tags.join(','));
      uploadFormData.append('isPublic', formData.isPublic.toString());
      if (formData.projectId) {
        uploadFormData.append('projectId', formData.projectId);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      await filesApi.uploadFile(uploadFormData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: 'Success',
        description: 'Video uploaded successfully',
      });

      setIsUploadDialogOpen(false);
      resetForm();
      fetchVideos();
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload video',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle edit video
  const handleEditVideo = async () => {
    if (!selectedVideo) return;

    try {
      await filesApi.updateFileMetadata(selectedVideo.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.join(','),
        isPublic: formData.isPublic,
        projectId: formData.projectId || undefined,
      });

      toast({
        title: 'Success',
        description: 'Video updated successfully',
      });

      setIsEditDialogOpen(false);
      setSelectedVideo(null);
      resetForm();
      fetchVideos();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update video',
        variant: 'destructive',
      });
    }
  };

  // Handle delete video
  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      await filesApi.deleteFile(videoId);
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
      fetchVideos();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete video',
        variant: 'destructive',
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (video: VideoFile) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title || video.originalName,
      description: video.description || '',
      category: video.category || '',
      tags: video.tags || [],
      projectId: video.projectId || '',
      isPublic: video.isPublic || false,
    });
    setIsEditDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (video: VideoFile) => {
    setSelectedVideo(video);
    setIsViewDialogOpen(true);
  };

  // Check if user can manage video
  const canManageVideo = (video: VideoFile): boolean => {
    if (canManageAllFiles()) return true;
    return video.uploadedBy === user?.id;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter videos
  const filteredVideos = videos.filter((video) => {
    const matchesSearch = 
      (video.title || video.originalName).toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || video.category === categoryFilter;
    const matchesProject = projectFilter === 'all' || video.projectId === projectFilter;

    return matchesSearch && matchesCategory && matchesProject;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Video className="h-8 w-8" />
            Video Library
          </h1>
          <p className="text-muted-foreground">
            Upload, organize, and share video content across your organization
          </p>
        </div>
        {canUploadFiles() && (
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{videos.length}</p>
                <p className="text-xs text-muted-foreground">Total Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {videos.filter(v => v.status === 'READY').length}
                </p>
                <p className="text-xs text-muted-foreground">Ready to Play</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {videos.reduce((sum, video) => sum + (video.views || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileVideo className="h-4 w-4 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold">
                  {formatFileSize(videos.reduce((sum, video) => sum + video.size, 0))}
                </p>
                <p className="text-xs text-muted-foreground">Total Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-videos">My Videos</TabsTrigger>
          <TabsTrigger value="all-videos">All Videos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {VIDEO_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Videos Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="relative">
                    <div className="aspect-video bg-slate-100 flex items-center justify-center">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title || video.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Video className="h-12 w-12 text-slate-400" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        onClick={() => openViewDialog(video)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </Button>
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={video.status === 'READY' ? 'default' : video.status === 'PROCESSING' ? 'secondary' : 'destructive'}>
                        {video.status === 'READY' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {video.status === 'PROCESSING' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        {video.status === 'ERROR' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {video.status}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium line-clamp-2">
                        {video.title || video.originalName}
                      </h3>
                      {video.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {video.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(video.size)}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {video.views || 0}
                        </span>
                      </div>
                      {video.category && (
                        <Badge variant="outline" className="text-xs">
                          {video.category}
                        </Badge>
                      )}
                      {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {video.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {video.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{video.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-muted-foreground">
                        {new Date(video.uploadedAt).toLocaleDateString()}
                      </div>
                      {canManageVideo(video) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewDialog(video)}>
                              <Play className="mr-2 h-4 w-4" />
                              Play
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(video)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteVideo(video.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No videos found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || categoryFilter !== 'all' || projectFilter !== 'all'
                    ? 'No videos match your current filters.'
                    : 'Start by uploading your first video.'}
                </p>
                {canUploadFiles() && (
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Video Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Video</DialogTitle>
            <DialogDescription>
              Upload a video file and add metadata for better organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="video-file">Video File *</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
            
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upload-title">Title *</Label>
                <Input
                  id="upload-title"
                  placeholder="Enter video title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={uploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                  disabled={uploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {VIDEO_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="upload-description">Description</Label>
              <Textarea
                id="upload-description"
                placeholder="Enter video description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                disabled={uploading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upload-project">Project (Optional)</Label>
                <Select 
                  value={formData.projectId} 
                  onValueChange={(value) => handleInputChange('projectId', value)}
                  disabled={uploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-tags">Tags</Label>
                <Input
                  id="upload-tags"
                  placeholder="tutorial, demo, training (comma separated)"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  disabled={uploading}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="upload-isPublic"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="rounded"
                disabled={uploading}
              />
              <Label htmlFor="upload-isPublic">Make this video public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUploadVideo} 
              disabled={!selectedFile || !formData.title || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Video Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>
              Update video information and metadata.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  placeholder="Enter video title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {VIDEO_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter video description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-project">Project (Optional)</Label>
                <Select 
                  value={formData.projectId} 
                  onValueChange={(value) => handleInputChange('projectId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags</Label>
                <Input
                  id="edit-tags"
                  placeholder="tutorial, demo, training (comma separated)"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isPublic"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="edit-isPublic">Make this video public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditVideo} disabled={!formData.title}>
              Update Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Video Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title || selectedVideo?.originalName}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedVideo && (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                  {selectedVideo.status === 'READY' ? (
                    <video
                      controls
                      className="w-full h-full rounded-lg"
                      poster={selectedVideo.thumbnail}
                    >
                      <source src={`/api/files/${selectedVideo.id}/download`} type={selectedVideo.mimeType} />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="text-center text-white">
                      {selectedVideo.status === 'PROCESSING' ? (
                        <>
                          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
                          <p>Video is being processed...</p>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                          <p>Video processing failed</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {selectedVideo.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedVideo.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">File Size:</span> {formatFileSize(selectedVideo.size)}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {selectedVideo.duration ? formatDuration(selectedVideo.duration) : 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Views:</span> {selectedVideo.views || 0}
                  </div>
                  <div>
                    <span className="font-medium">Uploaded:</span> {new Date(selectedVideo.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                
                {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVideo.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedVideo && canManageVideo(selectedVideo) && (
              <Button onClick={() => openEditDialog(selectedVideo)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 