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
  Archive
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
} from '@/components/ui';
import { useGlobalPermissions, useRolePermissions } from '@/hooks/useRolePermissions';
import { RoleGuard, PermissionGuard } from '@/components/auth/RoleGuard';
import { knowledgeApi, KnowledgeItem } from '@/services/api/knowledge';
import { projectsApi } from '@/services/api/projects';
import { useToast } from '@/hooks/useToast';

interface KnowledgeFilters {
  search: string;
  category: string;
  type: string;
  projectId: string;
  tags: string[];
  sortBy: 'recent' | 'popular' | 'title' | 'author';
  sortOrder: 'asc' | 'desc';
}

interface KnowledgeStats {
  total: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  recentlyAdded: number;
  userContributions: number;
  popular: KnowledgeItem[];
}

export const KnowledgeBase: React.FC = () => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filters, setFilters] = useState<KnowledgeFilters>({
    search: '',
    category: '',
    type: '',
    projectId: '',
    tags: [],
    sortBy: 'recent',
    sortOrder: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProject, setSelectedProject] = useState<string>('');

  const { isAuthenticated, user } = useGlobalPermissions();
  const { toast } = useToast();

  // Categories and types
  const categories = [
    'Technical', 'Process', 'Documentation', 'Best Practices', 
    'Troubleshooting', 'Architecture', 'Security', 'Performance'
  ];

  const types = [
    'Article', 'Tutorial', 'FAQ', 'Guide', 'Reference', 
    'Case Study', 'Lesson Learned', 'Code Snippet'
  ];

  // Fetch knowledge items
  const fetchKnowledgeItems = async (page: number = 1) => {
    try {
      setSearchLoading(true);
      
      const searchParams = {
        query: filters.search,
        page,
        limit: 12,
        category: filters.category || undefined,
        type: filters.type || undefined,
        projectId: filters.projectId || selectedProject || undefined,
        tags: filters.tags.length > 0 ? filters.tags : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      const response = await knowledgeApi.searchKnowledge(searchParams);
      
      setKnowledgeItems(response.items);
      setTotalPages(response.pagination.pages);
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

  // Fetch knowledge statistics
  const fetchKnowledgeStats = async () => {
    try {
      const [allKnowledgeResponse, userProjectsResponse] = await Promise.all([
        knowledgeApi.searchKnowledge({ query: '', page: 1, limit: 1000 }),
        projectsApi.getMyProjects()
      ]);

      const allItems = allKnowledgeResponse.items;
      
      // Calculate stats
      const byCategory: Record<string, number> = {};
      const byType: Record<string, number> = {};
      
      allItems.forEach(item => {
        if (item.category) {
          byCategory[item.category] = (byCategory[item.category] || 0) + 1;
        }
        if (item.type) {
          byType[item.type] = (byType[item.type] || 0) + 1;
        }
      });

      // Get recently added (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentlyAdded = allItems.filter(item => 
        new Date(item.createdAt) > weekAgo
      ).length;

      // Get user contributions
      const userContributions = allItems.filter(item => 
        item.authorId === user?.id
      ).length;

      // Get popular items (by view count)
      const popular = allItems
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 5);

      const knowledgeStats: KnowledgeStats = {
        total: allItems.length,
        byCategory,
        byType,
        recentlyAdded,
        userContributions,
        popular
      };

      setStats(knowledgeStats);

      // Set available projects
      const projectList = userProjectsResponse.projects.map(p => p.project);
      setProjects(projectList);
    } catch (error: any) {
      console.error('Error fetching knowledge stats:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchKnowledgeStats(),
        fetchKnowledgeItems(1)
      ]);
      setLoading(false);
    };

    if (isAuthenticated) {
      initializeData();
    }
  }, [isAuthenticated]);

  // Fetch when filters change
  useEffect(() => {
    if (!loading) {
      fetchKnowledgeItems(1);
    }
  }, [filters, selectedProject]);

  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof KnowledgeFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      type: '',
      projectId: '',
      tags: [],
      sortBy: 'recent',
      sortOrder: 'desc'
    });
    setSelectedProject('');
  };

  // Handle knowledge item actions
  const handleView = async (item: KnowledgeItem) => {
    try {
      await knowledgeApi.incrementViewCount(item.id);
      // Navigate to knowledge detail page
      console.log('View knowledge item:', item.id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleEdit = (item: KnowledgeItem) => {
    console.log('Edit knowledge item:', item.id);
  };

  const handleDelete = async (item: KnowledgeItem) => {
    try {
      await knowledgeApi.deleteKnowledge(item.id);
      toast({
        title: 'Success',
        description: 'Knowledge item deleted successfully',
      });
      fetchKnowledgeItems(currentPage);
      fetchKnowledgeStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete knowledge item',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertDescription>
          Please log in to access the knowledge base.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Discover and contribute to the team's collective knowledge
          </p>
        </div>
        
        <RoleGuard
          requiredPermission="canCreateKnowledge"
          projectId={selectedProject}
          fallback={null}
        >
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Knowledge
          </Button>
        </RoleGuard>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Knowledge articles
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Added</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.recentlyAdded || 0}</div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Contributions</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.userContributions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Articles created
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.byCategory ? Object.keys(stats.byCategory).length : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Knowledge areas
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
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search knowledge base..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
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
                onValueChange={(value) => handleFilterChange('category', value)}
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
                value={filters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.sortBy}
                onValueChange={(value: any) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sortOrder}
                onValueChange={(value: any) => handleFilterChange('sortOrder', value)}
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

      {/* Knowledge Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : knowledgeItems.length > 0 ? (
          knowledgeItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle 
                      className="text-lg line-clamp-2 cursor-pointer group-hover:text-primary"
                      onClick={() => handleView(item)}
                    >
                      {item.title}
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleView(item)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      
                      <RoleGuard
                        projectId={item.projectId}
                        requiredPermission="canEditKnowledge"
                        fallback={null}
                      >
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </RoleGuard>

                      <RoleGuard
                        projectId={item.projectId}
                        requiredPermission="canDeleteKnowledge"
                        fallback={null}
                      >
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(item)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </RoleGuard>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Tags and Meta */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.category && (
                    <Badge variant="secondary">{item.category}</Badge>
                  )}
                  {item.type && (
                    <Badge variant="outline">{item.type}</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Author and Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {item.author?.firstName?.[0]}{item.author?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{item.author?.firstName} {item.author?.lastName}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{item.viewCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Alert>
              <AlertDescription>
                No knowledge items found matching your criteria. Try adjusting your search or filters.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
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
  );
}; 