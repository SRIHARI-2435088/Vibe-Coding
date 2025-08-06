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
} from '@/components/ui';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Tag,
  Calendar,
  User,
  MoreHorizontal,
  FileText,
  Video,
  Code,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Share2,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { knowledgeApi, KnowledgeItem } from '@/services/api/knowledge';
import { projectsApi } from '@/services/api/projects';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';
import { useToast } from '@/hooks/useToast';

interface KnowledgeFormData {
  title: string;
  content: string;
  type: string;
  category: string;
  tags: string[];
  difficulty: string;
  status: string;
  isPublic: boolean;
  projectId?: string;
}

const KNOWLEDGE_TYPE_COLORS = {
  TUTORIAL: 'bg-blue-100 text-blue-800 border-blue-200',
  DOCUMENTATION: 'bg-green-100 text-green-800 border-green-200',
  BEST_PRACTICES: 'bg-purple-100 text-purple-800 border-purple-200',
  TROUBLESHOOTING: 'bg-red-100 text-red-800 border-red-200',
  TECHNICAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PROCESS: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

const DIFFICULTY_COLORS = {
  BEGINNER: 'bg-green-100 text-green-800 border-green-200',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ADVANCED: 'bg-red-100 text-red-800 border-red-200',
  EXPERT: 'bg-purple-100 text-purple-800 border-purple-200',
};

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
  REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PUBLISHED: 'bg-green-100 text-green-800 border-green-200',
  ARCHIVED: 'bg-red-100 text-red-800 border-red-200',
};

export const KnowledgeManagement: React.FC = () => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('my-knowledge');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { canCreateKnowledge, canManageAllKnowledge, user } = useGlobalPermissions();
  const { toast } = useToast();

  const [formData, setFormData] = useState<KnowledgeFormData>({
    title: '',
    content: '',
    type: 'DOCUMENTATION',
    category: '',
    tags: [],
    difficulty: 'BEGINNER',
    status: 'DRAFT',
    isPublic: false,
    projectId: '',
  });

  // Fetch knowledge items
  const fetchKnowledgeItems = async () => {
    try {
      setLoading(true);
      const searchParams = {
        query: searchQuery,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        page: currentPage,
        limit: 10,
        authorId: activeTab === 'my-knowledge' ? user?.id : undefined,
      };

      const response = await knowledgeApi.searchKnowledge(searchParams);
      setKnowledgeItems(response.items);
      setTotalPages(Math.ceil(response.pagination.total / response.pagination.limit));
    } catch (error: any) {
      console.error('Error fetching knowledge items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load knowledge items',
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
    fetchKnowledgeItems();
  }, [activeTab, searchQuery, typeFilter, statusFilter, difficultyFilter, currentPage]);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle form input changes
  const handleInputChange = (field: keyof KnowledgeFormData, value: any) => {
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
      content: '',
      type: 'DOCUMENTATION',
      category: '',
      tags: [],
      difficulty: 'BEGINNER',
      status: 'DRAFT',
      isPublic: false,
      projectId: '',
    });
  };

  // Handle create knowledge item
  const handleCreateKnowledge = async () => {
    try {
      await knowledgeApi.createKnowledge({
        ...formData,
        tags: formData.tags.join(','),
        projectId: formData.projectId || undefined,
      });

      toast({
        title: 'Success',
        description: 'Knowledge item created successfully',
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchKnowledgeItems();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to create knowledge item',
        variant: 'destructive',
      });
    }
  };

  // Handle edit knowledge item
  const handleEditKnowledge = async () => {
    if (!selectedItem) return;

    try {
      await knowledgeApi.updateKnowledge(selectedItem.id, {
        ...formData,
        tags: formData.tags.join(','),
        projectId: formData.projectId || undefined,
      });

      toast({
        title: 'Success',
        description: 'Knowledge item updated successfully',
      });

      setIsEditDialogOpen(false);
      setSelectedItem(null);
      resetForm();
      fetchKnowledgeItems();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update knowledge item',
        variant: 'destructive',
      });
    }
  };

  // Handle delete knowledge item
  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge item? This action cannot be undone.')) {
      return;
    }

    try {
      await knowledgeApi.deleteKnowledge(id);
      toast({
        title: 'Success',
        description: 'Knowledge item deleted successfully',
      });
      fetchKnowledgeItems();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete knowledge item',
        variant: 'destructive',
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (item: KnowledgeItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type,
      category: item.category || '',
      tags: item.tags || [],
      difficulty: item.difficulty,
      status: item.status,
      isPublic: item.isPublic,
      projectId: item.projectId || '',
    });
    setIsEditDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (item: KnowledgeItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
    // Track view
    knowledgeApi.trackKnowledgeView(item.id).catch(console.error);
  };

  // Check if user can manage item
  const canManageItem = (item: KnowledgeItem): boolean => {
    if (canManageAllKnowledge()) return true;
    return item.authorId === user?.id;
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TUTORIAL': return <Video className="h-4 w-4" />;
      case 'DOCUMENTATION': return <FileText className="h-4 w-4" />;
      case 'BEST_PRACTICES': return <Lightbulb className="h-4 w-4" />;
      case 'TROUBLESHOOTING': return <AlertTriangle className="h-4 w-4" />;
      case 'TECHNICAL': return <Code className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Knowledge Management
          </h1>
          <p className="text-muted-foreground">
            Create, organize, and share knowledge across your organization
          </p>
        </div>
        {canCreateKnowledge() && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Knowledge
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{knowledgeItems.length}</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
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
                  {knowledgeItems.filter(item => item.status === 'PUBLISHED').length}
                </p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {knowledgeItems.filter(item => item.status === 'DRAFT').length}
                </p>
                <p className="text-xs text-muted-foreground">Drafts</p>
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
                  {knowledgeItems.reduce((sum, item) => sum + (item.viewCount || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold">
                  {knowledgeItems.filter(item => item.authorId === user?.id).length}
                </p>
                <p className="text-xs text-muted-foreground">My Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-knowledge">My Knowledge</TabsTrigger>
          <TabsTrigger value="all-knowledge">All Knowledge</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search knowledge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="TUTORIAL">Tutorial</SelectItem>
                <SelectItem value="DOCUMENTATION">Documentation</SelectItem>
                <SelectItem value="BEST_PRACTICES">Best Practices</SelectItem>
                <SelectItem value="TROUBLESHOOTING">Troubleshooting</SelectItem>
                <SelectItem value="TECHNICAL">Technical</SelectItem>
                <SelectItem value="PROCESS">Process</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
                <SelectItem value="EXPERT">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Knowledge Items Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {knowledgeItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-2">{item.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {item.category}
                            </p>
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                                {item.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{item.tags.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={KNOWLEDGE_TYPE_COLORS[item.type as keyof typeof KNOWLEDGE_TYPE_COLORS]}>
                            {getTypeIcon(item.type)}
                            <span className="ml-1">{item.type}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={DIFFICULTY_COLORS[item.difficulty as keyof typeof DIFFICULTY_COLORS]}>
                            {item.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {item.author?.firstName?.[0]}{item.author?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {item.author?.firstName} {item.author?.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {item.viewCount || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => openViewDialog(item)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              {canManageItem(item) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => openEditDialog(item)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteKnowledge(item.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Knowledge Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Knowledge Item</DialogTitle>
            <DialogDescription>
              Share your knowledge with the team by creating a new knowledge item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter knowledge title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="Enter category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your knowledge content here..."
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={8}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUTORIAL">Tutorial</SelectItem>
                    <SelectItem value="DOCUMENTATION">Documentation</SelectItem>
                    <SelectItem value="BEST_PRACTICES">Best Practices</SelectItem>
                    <SelectItem value="TROUBLESHOOTING">Troubleshooting</SelectItem>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="PROCESS">Process</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="REVIEW">Review</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project">Project (Optional)</Label>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="react, javascript, tutorial (comma separated)"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isPublic">Make this knowledge item public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKnowledge} disabled={!formData.title || !formData.content}>
              Create Knowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Knowledge Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Item</DialogTitle>
            <DialogDescription>
              Update your knowledge item information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  placeholder="Enter knowledge title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  placeholder="Enter category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea
                id="edit-content"
                placeholder="Write your knowledge content here..."
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={8}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUTORIAL">Tutorial</SelectItem>
                    <SelectItem value="DOCUMENTATION">Documentation</SelectItem>
                    <SelectItem value="BEST_PRACTICES">Best Practices</SelectItem>
                    <SelectItem value="TROUBLESHOOTING">Troubleshooting</SelectItem>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="PROCESS">Process</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="REVIEW">Review</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                placeholder="react, javascript, tutorial (comma separated)"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isPublic"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="edit-isPublic">Make this knowledge item public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditKnowledge} disabled={!formData.title || !formData.content}>
              Update Knowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Knowledge Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && getTypeIcon(selectedItem.type)}
              {selectedItem?.title}
            </DialogTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedItem && (
                <>
                  <Badge className={KNOWLEDGE_TYPE_COLORS[selectedItem.type as keyof typeof KNOWLEDGE_TYPE_COLORS]}>
                    {selectedItem.type}
                  </Badge>
                  <Badge className={DIFFICULTY_COLORS[selectedItem.difficulty as keyof typeof DIFFICULTY_COLORS]}>
                    {selectedItem.difficulty}
                  </Badge>
                  <Badge className={STATUS_COLORS[selectedItem.status as keyof typeof STATUS_COLORS]}>
                    {selectedItem.status}
                  </Badge>
                  {selectedItem.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </>
              )}
            </div>
          </DialogHeader>
          <div className="py-4">
            {selectedItem && (
              <div className="space-y-4">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{selectedItem.content}</div>
                </div>
                <div className="border-t pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span>By {selectedItem.author?.firstName} {selectedItem.author?.lastName}</span>
                      <span>•</span>
                      <span>{new Date(selectedItem.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {selectedItem.viewCount || 0} views
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedItem && canManageItem(selectedItem) && (
              <Button onClick={() => openEditDialog(selectedItem)}>
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