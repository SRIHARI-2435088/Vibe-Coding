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
  Input,
  Label,
  Select,
  Textarea,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import {
  BookOpen,
  Video,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  Archive,
  FileText,
  User,
  Calendar,
  Tag,
  TrendingUp,
  BarChart3,
  Download,
  Settings,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { adminApi } from '@/services/api/admin';
import { knowledgeApi } from '@/services/api/knowledge';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';
import { useToast } from '@/hooks/useToast';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: string;
  category: string;
  status: string;
  difficulty: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
  _count: {
    comments: number;
    reviews: number;
  };
}

interface KnowledgeFormData {
  title: string;
  content: string;
  type: string;
  category: string;
  status: string;
  difficulty: string;
  isPublic: boolean;
  tags: string[];
  projectId?: string;
}

const STATUS_COLORS = {
  DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PUBLISHED: 'bg-green-100 text-green-800 border-green-200',
  ARCHIVED: 'bg-red-100 text-red-800 border-red-200',
};

const TYPE_COLORS = {
  DOCUMENTATION: 'bg-blue-100 text-blue-800 border-blue-200',
  TUTORIAL: 'bg-purple-100 text-purple-800 border-purple-200',
  BEST_PRACTICES: 'bg-green-100 text-green-800 border-green-200',
  TROUBLESHOOTING: 'bg-orange-100 text-orange-800 border-orange-200',
  API_REFERENCE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

const DIFFICULTY_COLORS = {
  BEGINNER: 'bg-green-100 text-green-800 border-green-200',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ADVANCED: 'bg-red-100 text-red-800 border-red-200',
};

export const ContentManagement: React.FC = () => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState<KnowledgeFormData>({
    title: '',
    content: '',
    type: 'TECHNICAL',
    category: 'TECHNICAL',
    status: 'DRAFT',
    difficulty: 'BEGINNER',
    isPublic: false,
    tags: [],
    projectId: undefined,
  });
  const [tagInput, setTagInput] = useState('');

  const { isSystemAdmin } = useGlobalPermissions();
  const { toast } = useToast();

  // Fetch knowledge items
  const fetchKnowledgeItems = async () => {
    if (!isSystemAdmin()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const items = await adminApi.getAllKnowledgeItems();
      
      // Ensure tags is always an array
      const normalizedItems = items.map(item => ({
        ...item,
        tags: Array.isArray(item.tags) 
          ? item.tags 
          : typeof item.tags === 'string' 
            ? (() => {
                try {
                  // Try to parse as JSON first
                  return JSON.parse(item.tags);
                } catch {
                  // Fallback to comma-separated string
                  return item.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                }
              })()
            : []
      }));
      
      setKnowledgeItems(normalizedItems);
    } catch (error: any) {
      console.error('Error fetching knowledge items:', error);
      
      // Check if it's an auth error
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast({
          title: 'Authentication Error',
          description: 'You do not have permission to access this resource',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load knowledge items',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSystemAdmin()) {
      fetchKnowledgeItems();
    }
  }, [isSystemAdmin]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedItem || !newStatus) return;

    try {
      await adminApi.updateKnowledgeStatus(selectedItem.id, newStatus);
      toast({
        title: 'Success',
        description: 'Knowledge item status updated successfully',
      });
      setIsStatusDialogOpen(false);
      setSelectedItem(null);
      setNewStatus('');
      fetchKnowledgeItems();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update knowledge item status',
        variant: 'destructive',
      });
    }
  };

  // Handle delete
  const handleDelete = async (item: KnowledgeItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      await adminApi.deleteKnowledgeItem(item.id);
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

  // Handle create knowledge
  const handleCreateKnowledge = async () => {
    try {
      await knowledgeApi.createKnowledge({
        title: formData.title,
        content: formData.content,
        type: formData.type as any,
        category: formData.category as any,
        status: formData.status as any,
        difficulty: formData.difficulty as any,
        isPublic: formData.isPublic,
        tags: formData.tags,
        projectId: formData.projectId,
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
        description: error.message || 'Failed to create knowledge item',
        variant: 'destructive',
      });
    }
  };

  // Handle edit knowledge
  const handleEditKnowledge = async () => {
    if (!selectedItem) return;

    try {
      await knowledgeApi.updateKnowledge(selectedItem.id, {
        title: formData.title,
        content: formData.content,
        type: formData.type as any,
        category: formData.category as any,
        status: formData.status as any,
        difficulty: formData.difficulty as any,
        isPublic: formData.isPublic,
        tags: formData.tags,
        projectId: formData.projectId,
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
        description: error.message || 'Failed to update knowledge item',
        variant: 'destructive',
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (item: KnowledgeItem) => {
    setSelectedItem(item);
    
    // Ensure tags is always an array
    let tagsArray = [];
    if (Array.isArray(item.tags)) {
      tagsArray = item.tags;
    } else if (typeof item.tags === 'string') {
      try {
        // Try to parse as JSON first
        tagsArray = JSON.parse(item.tags);
      } catch {
        // Fallback to comma-separated string
        tagsArray = item.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }
    
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type,
      category: item.category,
      status: item.status,
      difficulty: item.difficulty,
      isPublic: item.isPublic,
      tags: tagsArray,
      projectId: item.project?.id,
    });
    setIsEditDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'TECHNICAL',
      category: 'TECHNICAL',
      status: 'DRAFT',
      difficulty: 'BEGINNER',
      isPublic: false,
      tags: [],
      projectId: undefined,
    });
    setTagInput('');
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  // Filter knowledge items
  const filteredItems = knowledgeItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesDifficulty = difficultyFilter === 'all' || item.difficulty === difficultyFilter;

    return matchesSearch && matchesStatus && matchesType && matchesDifficulty;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  // Calculate stats
  const stats = {
    total: knowledgeItems.length,
    published: knowledgeItems.filter(item => item.status === 'PUBLISHED').length,
    draft: knowledgeItems.filter(item => item.status === 'DRAFT').length,
    archived: knowledgeItems.filter(item => item.status === 'ARCHIVED').length,
    public: knowledgeItems.filter(item => item.isPublic).length,
  };

  if (!isSystemAdmin()) {
    return (
      <div className="text-center py-12">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access content management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Content Management</h2>
          <p className="text-muted-foreground">
            Manage and oversee all knowledge content across the platform
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Knowledge
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.published}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Clock className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.draft}</p>
              <p className="text-xs text-muted-foreground">Drafts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Archive className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.archived}</p>
              <p className="text-xs text-muted-foreground">Archived</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Eye className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.public}</p>
              <p className="text-xs text-muted-foreground">Public</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search knowledge items..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="DOCUMENTATION">Documentation</SelectItem>
                <SelectItem value="TUTORIAL">Tutorial</SelectItem>
                <SelectItem value="BEST_PRACTICES">Best Practices</SelectItem>
                <SelectItem value="TROUBLESHOOTING">Troubleshooting</SelectItem>
                <SelectItem value="API_REFERENCE">API Reference</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Items ({filteredItems.length})</CardTitle>
          <CardDescription>
            Manage all knowledge content across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{item.title}</p>
                          <div className="flex items-center gap-2">
                            {item.isPublic && (
                              <Badge variant="outline" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                Public
                              </Badge>
                            )}
                            {item.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{item.tags.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {item.author.firstName[0]}{item.author.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {item.author.firstName} {item.author.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.author.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={TYPE_COLORS[item.type as keyof typeof TYPE_COLORS]}>
                          {item.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={DIFFICULTY_COLORS[item.difficulty as keyof typeof DIFFICULTY_COLORS]}>
                          {item.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.project ? (
                          <span className="text-sm">{item.project.name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">General</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {item._count.comments}
                          </span>
                          <span className="flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {item._count.reviews}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
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
                              onClick={() => {
                                setSelectedItem(item);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Content
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedItem(item);
                                setNewStatus(item.status);
                                setIsStatusDialogOpen(true);
                              }}
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Change Status
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(item)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of{' '}
                    {filteredItems.length} items
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Knowledge Item Details</DialogTitle>
            <DialogDescription>
              {selectedItem?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Author</Label>
                  <p className="text-sm">
                    {selectedItem.author.firstName} {selectedItem.author.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm">{selectedItem.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm">{selectedItem.status}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Difficulty</Label>
                  <p className="text-sm">{selectedItem.difficulty}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm">{selectedItem.category || 'No category'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Project</Label>
                  <p className="text-sm">
                    {selectedItem.project?.name || 'General knowledge'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedItem.tags.length > 0 ? (
                    selectedItem.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Content Preview</Label>
                <div className="mt-1 p-3 bg-muted rounded-md max-h-40 overflow-y-auto">
                  <p className="text-sm">{selectedItem.content.slice(0, 300)}...</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Change the status of "{selectedItem?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Knowledge Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Knowledge Item</DialogTitle>
            <DialogDescription>
              Add new knowledge content to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter knowledge title"
              />
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter knowledge content"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="PROCESS">Process</SelectItem>
                    <SelectItem value="CULTURAL">Cultural</SelectItem>
                    <SelectItem value="TROUBLESHOOTING">Troubleshooting</SelectItem>
                    <SelectItem value="BEST_PRACTICE">Best Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="PROCESS">Process</SelectItem>
                    <SelectItem value="TOOLS">Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              />
              <Label htmlFor="isPublic">Make this knowledge item public</Label>
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKnowledge}>
              Create Knowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Knowledge Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Item</DialogTitle>
            <DialogDescription>
              Update knowledge content and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTitle">Title *</Label>
              <Input
                id="editTitle"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter knowledge title"
              />
            </div>
            <div>
              <Label htmlFor="editContent">Content *</Label>
              <Textarea
                id="editContent"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter knowledge content"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editType">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="PROCESS">Process</SelectItem>
                    <SelectItem value="CULTURAL">Cultural</SelectItem>
                    <SelectItem value="TROUBLESHOOTING">Troubleshooting</SelectItem>
                    <SelectItem value="BEST_PRACTICE">Best Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editCategory">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="PROCESS">Process</SelectItem>
                    <SelectItem value="TOOLS">Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editDifficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              />
              <Label htmlFor="editIsPublic">Make this knowledge item public</Label>
            </div>
            <div>
              <Label htmlFor="editTags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditKnowledge}>
              Update Knowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 