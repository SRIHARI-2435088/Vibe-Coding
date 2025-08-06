import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  Tag, 
  User, 
  Calendar, 
  Eye, 
  ThumbsUp, 
  MessageSquare,
  Upload,
  Download,
  Edit,
  Trash2,
  Star,
  Clock,
  TrendingUp,
  Archive,
  FileText,
  Lightbulb,
  Code,
  Shield,
  Heart,
  Bookmark,
  Share2,
  Filter as FilterIcon,
  LayoutGrid,
  List,
  ChevronRight,
  Award,
  Zap
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Progress,
  Separator,
} from '@/components/ui';
import { useGlobalPermissions, useRolePermissions } from '@/hooks/useRolePermissions';
import { RoleGuard, PermissionGuard } from '@/components/auth/RoleGuard';
import { knowledgeApi, KnowledgeItem } from '@/services/api/knowledge';
import { projectsApi } from '@/services/api/projects';
import { useToast } from '@/hooks/useToast';
import { KnowledgeSearchFilters, KnowledgeFilters } from './KnowledgeSearchFilters';
import { KnowledgeForm } from './KnowledgeForm';

interface KnowledgeStats {
  total: number;
  published: number;
  drafts: number;
  myContributions: number;
  weeklyViews: number;
  popularTags: Array<{ tag: string; count: number }>;
}

export const KnowledgeBase: React.FC = () => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<KnowledgeItem[]>([]);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editItem, setEditItem] = useState<KnowledgeItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<KnowledgeItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState<KnowledgeFilters>({
    search: '',
    type: '',
    category: '',
    difficulty: '',
    status: '',
    tags: [],
    projectId: '',
    authorId: '',
    dateRange: 'all',
    sortBy: 'recent',
    sortOrder: 'desc',
    isPublic: undefined
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { isAuthenticated, user, canCreateKnowledge, canManageAllKnowledge } = useGlobalPermissions();
  const { toast } = useToast();

  // Fetch initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchKnowledgeItems(),
        fetchFeaturedItems(),
        fetchStats(),
        fetchProjects()
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch knowledge items based on current filters
  const fetchKnowledgeItems = async (page: number = 1) => {
    if (!isAuthenticated) return;
    
    try {
      setSearchLoading(true);
      
      // Build search parameters
      const searchParams = {
        page,
        limit: 12,
        search: filters.search,
        type: filters.type,
        category: filters.category,
        difficulty: filters.difficulty,
        status: filters.status,
        tags: filters.tags,
        projectId: filters.projectId,
        authorId: filters.authorId,
        dateRange: filters.dateRange,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        isPublic: filters.isPublic
      };

      const response = await knowledgeApi.searchKnowledgeItems(searchParams);
      setKnowledgeItems(response.items || []);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Error fetching knowledge items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load knowledge items',
        variant: 'destructive',
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Fetch featured/trending items
  const fetchFeaturedItems = async () => {
    try {
      const response = await knowledgeApi.getFeaturedKnowledgeItems();
      setFeaturedItems(response.items || []);
    } catch (error) {
      console.error('Error fetching featured items:', error);
    }
  };

  // Fetch knowledge statistics
  const fetchStats = async () => {
    try {
      const response = await knowledgeApi.getKnowledgeStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch projects for filtering
  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getMyProjects();
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Handle search
  const handleSearch = () => {
    fetchKnowledgeItems(1);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: KnowledgeFilters) => {
    setFilters(newFilters);
  };

  // Handle knowledge item creation
  const handleItemCreated = (newItem: KnowledgeItem) => {
    setKnowledgeItems(prev => [newItem, ...prev]);
    fetchStats(); // Refresh stats
  };

  // Handle knowledge item update
  const handleItemUpdated = (updatedItem: KnowledgeItem) => {
    setKnowledgeItems(prev => 
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
    setEditItem(null);
  };

  // Handle knowledge item deletion
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      await knowledgeApi.deleteKnowledgeItem(itemToDelete.id);
      setKnowledgeItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      toast({
        title: 'Success',
        description: 'Knowledge item deleted successfully',
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchStats(); // Refresh stats
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete knowledge item',
        variant: 'destructive',
      });
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TECHNICAL': return <Code className="h-4 w-4" />;
      case 'BUSINESS': return <FileText className="h-4 w-4" />;
      case 'PROCESS': return <BookOpen className="h-4 w-4" />;
      case 'CULTURAL': return <User className="h-4 w-4" />;
      case 'TROUBLESHOOTING': return <Shield className="h-4 w-4" />;
      case 'BEST_PRACTICE': return <Lightbulb className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-orange-100 text-orange-800';
      case 'EXPERT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get time ago helper
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <BookOpen className="h-4 w-4" />
        <AlertDescription>
          Please log in to access the Knowledge Base.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Hub</h1>
          <p className="text-muted-foreground">
            Discover, share, and learn from your team's collective knowledge
          </p>
        </div>
        {canCreateKnowledge && (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Knowledge
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.published}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Edit className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.myContributions}</p>
                  <p className="text-xs text-muted-foreground">My Items</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.weeklyViews}</p>
                  <p className="text-xs text-muted-foreground">Weekly Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-3 bg-muted/50">
            <TabsTrigger value="browse" className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:text-foreground shadow-sm">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Browse All</span>
              <span className="sm:hidden">Browse</span>
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:text-foreground shadow-sm">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Featured</span>
              <span className="sm:hidden">Featured</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:text-foreground shadow-sm">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Recent</span>
              <span className="sm:hidden">Recent</span>
            </TabsTrigger>
          </TabsList>
          
          {/* View Mode Toggle - Only show on Browse tab */}
          {activeTab === 'browse' && (
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Browse Tab */}
        <TabsContent value="browse">
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <KnowledgeSearchFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onSearch={handleSearch}
                  loading={searchLoading}
                  resultCount={knowledgeItems.length}
                />
              </CardContent>
            </Card>

            {/* Results Header */}
            {!searchLoading && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">
                    {knowledgeItems.length > 0 
                      ? `${knowledgeItems.length} Knowledge Item${knowledgeItems.length !== 1 ? 's' : ''}`
                      : 'No items found'
                    }
                  </h3>
                  {(filters.search || filters.type || filters.category) && (
                    <Badge variant="secondary" className="ml-2">
                      <FilterIcon className="h-3 w-3 mr-1" />
                      Filtered
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Knowledge Items Grid/List */}
            {searchLoading ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : knowledgeItems.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {knowledgeItems.map((item) => (
                  viewMode === 'grid' ? (
                    <Card key={item.id} className="hover:shadow-lg transition-all duration-200 group border-l-4 border-l-primary/20 hover:border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                {getTypeIcon(item.type)}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                              <Badge className={`text-xs ${getDifficultyColor(item.difficulty)}`}>
                                {item.difficulty}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors mb-2">
                              {item.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {item.description || 'No description available.'}
                            </CardDescription>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Bookmark className="h-4 w-4 mr-2" />
                                Bookmark
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              {(item.authorId === user?.id || canManageAllKnowledge) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => {
                                    setEditItem(item);
                                    setShowCreateForm(true);
                                  }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setItemToDelete(item);
                                      setDeleteDialogOpen(true);
                                    }}
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
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {/* Tags */}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs hover:bg-secondary/80 cursor-pointer">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{item.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          <Separator />

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {item.author?.firstName?.[0]}{item.author?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">
                                {item.author?.firstName} {item.author?.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{Math.floor(Math.random() * 100) + 10}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    // List View
                    <Card key={item.id} className="hover:shadow-md transition-all duration-200 group">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
                            {getTypeIcon(item.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                    {item.title}
                                  </h3>
                                  <Badge variant="outline" className="text-xs">
                                    {item.type}
                                  </Badge>
                                  <Badge className={`text-xs ${getDifficultyColor(item.difficulty)}`}>
                                    {item.difficulty}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {item.description || 'No description available.'}
                                </p>
                                
                                {/* Tags in list view */}
                                {item.tags && item.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {item.tags.slice(0, 5).map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {item.tags.length > 5 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{item.tags.length - 5} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback className="text-xs">
                                        {item.author?.firstName?.[0]}{item.author?.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{item.author?.firstName} {item.author?.lastName}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{Math.floor(Math.random() * 100) + 10} views</span>
                                  </div>
                                </div>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Bookmark className="h-4 w-4 mr-2" />
                                    Bookmark
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                  {(item.authorId === user?.id || canManageAllKnowledge) && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => {
                                        setEditItem(item);
                                        setShowCreateForm(true);
                                      }}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          setItemToDelete(item);
                                          setDeleteDialogOpen(true);
                                        }}
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">No knowledge items found</h3>
                      <p className="text-muted-foreground">
                        {filters.search || filters.type || filters.category
                          ? 'Try adjusting your search criteria'
                          : 'Be the first to share knowledge with your team'
                        }
                      </p>
                    </div>
                    {canCreateKnowledge && !filters.search && (
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Knowledge Item
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pagination would go here */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => fetchKnowledgeItems(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchKnowledgeItems(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Featured Tab */}
        <TabsContent value="featured">
          <div className="space-y-6">
            {/* Featured Header */}
            <div className="text-center py-8 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg border border-dashed">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Featured Knowledge</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Discover the most valuable and highly-rated knowledge items from your team
              </p>
            </div>

            {/* Featured Items Grid */}
            {featuredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredItems.map((item, index) => (
                  <Card key={item.id} className="hover:shadow-xl transition-all duration-300 group relative overflow-hidden border-2 border-primary/10 hover:border-primary/30">
                    {/* Featured Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        <Award className="h-3 w-3" />
                        <span>#{index + 1}</span>
                      </div>
                    </div>
                    
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <CardHeader className="relative z-10 pb-3">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                            <Badge className={`text-xs ${getDifficultyColor(item.difficulty)}`}>
                              {item.difficulty}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                            {item.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 mt-2">
                            {item.description || 'No description available.'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="relative z-10 pt-0">
                      <div className="space-y-3">
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{Math.floor(Math.random() * 500) + 100} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{Math.floor(Math.random() * 50) + 10} likes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{Math.floor(Math.random() * 10) + 1}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 2).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{item.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}

                        <Separator />

                        {/* Author and Date */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {item.author?.firstName?.[0]}{item.author?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {item.author?.firstName} {item.author?.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Star className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">No Featured Items Yet</h3>
                      <p className="text-muted-foreground mt-2">
                        Featured knowledge items will appear here based on popularity and engagement.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Recent Tab */}
        <TabsContent value="recent">
          <div className="space-y-6">
            {/* Recent Header */}
            <div className="text-center py-8 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-lg border border-dashed">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Recent Activity</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Stay up to date with the latest knowledge shared by your team
              </p>
            </div>

            {/* Timeline */}
            {knowledgeItems.length > 0 ? (
              <div className="space-y-6">
                {/* Time Filters */}
                <div className="flex items-center justify-center space-x-2">
                  {['Today', 'This Week', 'This Month'].map((period) => (
                    <Badge key={period} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      {period}
                    </Badge>
                  ))}
                </div>

                {/* Recent Items Timeline */}
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>

                  <div className="space-y-6">
                    {knowledgeItems.slice(0, 10).map((item, index) => {
                      const timeAgo = getTimeAgo(new Date(item.createdAt));
                      return (
                        <div key={item.id} className="relative flex items-start space-x-6">
                          {/* Timeline Dot */}
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center text-primary border-4 border-background shadow-lg">
                              {getTypeIcon(item.type)}
                            </div>
                            {/* Time Badge */}
                            <div className="absolute -bottom-2 -right-2 bg-background border rounded-full px-2 py-1">
                              <Zap className="h-3 w-3 text-green-500" />
                            </div>
                          </div>

                          {/* Content */}
                          <Card className="flex-1 hover:shadow-lg transition-all duration-200 group border-l-4 border-l-green-500/20 hover:border-l-green-500">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs">
                                      {item.type}
                                    </Badge>
                                    <Badge className={`text-xs ${getDifficultyColor(item.difficulty)}`}>
                                      {item.difficulty}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                      {timeAgo}
                                    </span>
                                  </div>
                                  
                                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-2">
                                    {item.title}
                                  </h3>
                                  
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                    {item.description || 'No description available.'}
                                  </p>

                                  {/* Tags */}
                                  {item.tags && item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                      {item.tags.slice(0, 3).map((tag, tagIndex) => (
                                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {item.tags.length > 3 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{item.tags.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}

                                  {/* Author and Engagement */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                          {item.author?.firstName?.[0]}{item.author?.lastName?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm text-muted-foreground">
                                        {item.author?.firstName} {item.author?.lastName}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        • {new Date(item.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        <span>{Math.floor(Math.random() * 100) + 10}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Heart className="h-3 w-3" />
                                        <span>{Math.floor(Math.random() * 20) + 1}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        <span>{Math.floor(Math.random() * 5) + 1}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                                        </svg>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Bookmark className="h-4 w-4 mr-2" />
                                        Bookmark
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Load More */}
                <div className="text-center pt-4">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Load More Recent Items
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">No Recent Activity</h3>
                      <p className="text-muted-foreground mt-2">
                        Recent knowledge items and updates will appear here as they're added.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Knowledge Form Dialog */}
      <KnowledgeForm
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setEditItem(null);
        }}
        onSuccess={editItem ? handleItemUpdated : handleItemCreated}
        knowledgeItem={editItem}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Knowledge Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 