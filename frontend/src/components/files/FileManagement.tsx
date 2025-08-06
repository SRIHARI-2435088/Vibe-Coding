import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Skeleton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import {
  Upload,
  File,
  FileText,
  Image,
  Video,
  Archive,
  Download,
  Eye,
  Share2,
  Trash2,
  Edit,
  Search,
  Filter,
  Grid,
  List,
  FolderOpen,
  Plus,
  X,
  Calendar,
  User,
  HardDrive,
  MoreVertical,
  Copy,
  ExternalLink,
  Folder,
  Star
} from 'lucide-react';
import { filesApi } from '@/services/api/files';
import { projectsApi } from '@/services/api/projects';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';
import { useToast } from '@/hooks/useToast';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  uploadedAt: string;
  projectId?: string;
  isPublic: boolean;
  tags: string[];
  downloadCount: number;
  url: string;
  thumbnailUrl?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export const FileManagement: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadProject, setUploadProject] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [isPublicUpload, setIsPublicUpload] = useState(false);

  const { isAuthenticated, canUploadFiles, user } = useGlobalPermissions();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
      fetchProjects();
    }
  }, [isAuthenticated]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await filesApi.getFiles({
        search: searchTerm,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        projectId: projectFilter !== 'all' ? projectFilter : undefined
      });
      setFiles(response.files || []);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getMyProjects();
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = useCallback(async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const uploads: UploadProgress[] = Array.from(selectedFiles).map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));
    
    setUploadProgress(uploads);

    for (let i = 0; i < uploads.length; i++) {
      const upload = uploads[i];
      
      try {
        const formData = new FormData();
        formData.append('file', upload.file);
        formData.append('projectId', uploadProject);
        formData.append('isPublic', isPublicUpload.toString());
        formData.append('tags', uploadTags);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => 
            prev.map((u, index) => 
              index === i && u.progress < 90 
                ? { ...u, progress: u.progress + 10 }
                : u
            )
          );
        }, 200);

        const response = await filesApi.uploadFile(formData);
        
        clearInterval(progressInterval);
        
        setUploadProgress(prev => 
          prev.map((u, index) => 
            index === i 
              ? { ...u, progress: 100, status: 'completed' as const }
              : u
          )
        );

        // Add to files list
        setFiles(prev => [response.file, ...prev]);

      } catch (error: any) {
        setUploadProgress(prev => 
          prev.map((u, index) => 
            index === i 
              ? { ...u, status: 'error' as const, error: error.message }
              : u
          )
        );
      }
    }

    // Close dialog after a delay
    setTimeout(() => {
      setShowUploadDialog(false);
      setUploadProgress([]);
      setSelectedFiles(null);
      setUploadProject('');
      setUploadTags('');
      setIsPublicUpload(false);
      setUploading(false);
    }, 2000);

    toast({
      title: 'Success',
      description: `${uploads.length} file(s) uploaded successfully`,
    });
  }, [selectedFiles, uploadProject, uploadTags, isPublicUpload]);

  // Handle file deletion
  const handleDeleteFile = async (fileId: string) => {
    try {
      await filesApi.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  // Handle file download
  const handleDownloadFile = async (file: FileItem) => {
    try {
      // In a real app, this would trigger a download
      window.open(file.url, '_blank');
      
      // Update download count
      await filesApi.incrementDownloadCount(file.id);
      setFiles(prev => 
        prev.map(f => 
          f.id === file.id 
            ? { ...f, downloadCount: f.downloadCount + 1 }
            : f
        )
      );
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Get file icon based on type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || file.mimeType.includes(typeFilter);
    const matchesProject = projectFilter === 'all' || file.projectId === projectFilter;
    
    return matchesSearch && matchesType && matchesProject;
  });

  // Get file type options
  const fileTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'image/', label: 'Images' },
    { value: 'video/', label: 'Videos' },
    { value: 'pdf', label: 'PDFs' },
    { value: 'text/', label: 'Documents' },
    { value: 'zip', label: 'Archives' }
  ];

  if (!isAuthenticated) {
    return (
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Please log in to access file management.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">File Management</h1>
          <p className="text-muted-foreground">
            Upload, organize, and share files across your projects
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {canUploadFiles && (
            <Button 
              onClick={() => setShowUploadDialog(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <File className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{files.length}</p>
                <p className="text-xs text-muted-foreground">Total Files</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
                </p>
                <p className="text-xs text-muted-foreground">Total Size</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {files.reduce((total, file) => total + file.downloadCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {files.filter(f => f.uploadedBy.id === user?.id).length}
                </p>
                <p className="text-xs text-muted-foreground">My Files</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search files by name or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="File Type" />
            </SelectTrigger>
            <SelectContent>
              {fileTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Project" />
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

          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Files Display */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredFiles.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="hover:shadow-lg transition-shadow group">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.mimeType)}
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-1" title={file.name}>
                          {file.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        {file.uploadedBy.id === user?.id && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteFile(file.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* File Preview/Thumbnail */}
                  <div className="mb-4 h-32 bg-muted rounded-lg flex items-center justify-center">
                    {file.thumbnailUrl ? (
                      <img 
                        src={file.thumbnailUrl} 
                        alt={file.name}
                        className="max-h-full max-w-full object-contain rounded"
                      />
                    ) : (
                      <div className="text-muted-foreground">
                        {getFileIcon(file.mimeType)}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {file.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {file.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {file.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{file.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* File Info */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{file.uploadedBy.firstName} {file.uploadedBy.lastName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>{file.downloadCount} downloads</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.mimeType)}
                      <div>
                        <h3 className="font-semibold">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.uploadedBy.firstName} {file.uploadedBy.lastName} • 
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {file.downloadCount} downloads
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadFile(file)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <File className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No files found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || typeFilter !== 'all' || projectFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Upload files to get started'
                  }
                </p>
              </div>
              {canUploadFiles && !searchTerm && typeFilter === 'all' && projectFilter === 'all' && (
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First File
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Upload files to share with your team and organize by project
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* File Selection */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Choose files to upload</h3>
                  <p className="text-muted-foreground">
                    Drag and drop files here, or click to browse
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button className="mt-4" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
              </div>

              {/* Selected Files */}
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {Array.from(selectedFiles).map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select value={uploadProject} onValueChange={setUploadProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  placeholder="Enter tags separated by commas"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                />
              </div>
            </div>

            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Upload Progress</h4>
                {uploadProgress.map((upload, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{upload.file.name}</span>
                      <span>
                        {upload.status === 'completed' ? 'Completed' :
                         upload.status === 'error' ? 'Error' :
                         `${upload.progress}%`
                        }
                      </span>
                    </div>
                    <Progress 
                      value={upload.progress} 
                      className={`h-2 ${
                        upload.status === 'error' ? 'bg-red-100' :
                        upload.status === 'completed' ? 'bg-green-100' : ''
                      }`}
                    />
                    {upload.error && (
                      <p className="text-xs text-red-600">{upload.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUploadDialog(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleFileUpload}
              disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles?.length || 0} File(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 