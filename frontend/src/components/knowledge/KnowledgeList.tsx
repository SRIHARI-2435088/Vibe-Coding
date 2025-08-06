import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, Clock, User, Tag } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Avatar,
  AvatarFallback,
  Skeleton,
  Alert,
  AlertDescription,
} from '@/components/ui';
import { knowledgeApi, KnowledgeItem, KnowledgeType, DifficultyLevel } from '@/services/api/knowledge';
import { useToast } from '@/hooks/useToast';

interface KnowledgeListProps {
  projectId?: string;
  onCreateClick?: () => void;
  onItemClick?: (item: KnowledgeItem) => void;
  onEditClick?: (item: KnowledgeItem) => void;
}

export const KnowledgeList: React.FC<KnowledgeListProps> = ({
  projectId,
  onCreateClick,
  onItemClick,
  onEditClick
}) => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<KnowledgeType | 'ALL'>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 12;

  // Fetch knowledge items
  const fetchKnowledgeItems = async () => {
    try {
      setLoading(true);
      const searchOptions: any = {};
      
      if (searchTerm) searchOptions.search = searchTerm;
      if (typeFilter !== 'ALL') searchOptions.type = typeFilter;
      if (difficultyFilter !== 'ALL') searchOptions.difficulty = difficultyFilter;
      if (projectId) searchOptions.projectId = projectId;
      
      searchOptions.page = currentPage;
      searchOptions.limit = ITEMS_PER_PAGE;
      searchOptions.status = 'PUBLISHED';

      const response = await knowledgeApi.searchKnowledge(searchOptions);
      setKnowledgeItems(response.items);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);
    } catch (error) {
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

  // Effect to fetch data when filters change
  useEffect(() => {
    fetchKnowledgeItems();
  }, [searchTerm, typeFilter, difficultyFilter, currentPage, projectId]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on new search
      fetchKnowledgeItems();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('ALL');
    setDifficultyFilter('ALL');
    setCurrentPage(1);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type color
  const getTypeColor = (type: KnowledgeType) => {
    switch (type) {
      case 'TECHNICAL': return 'bg-blue-100 text-blue-800';
      case 'BUSINESS': return 'bg-purple-100 text-purple-800';
      case 'PROCESS': return 'bg-green-100 text-green-800';
      case 'CULTURAL': return 'bg-pink-100 text-pink-800';
      case 'TROUBLESHOOTING': return 'bg-red-100 text-red-800';
      case 'BEST_PRACTICE': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="h-64">
          <CardHeader>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20 ml-2" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  if (loading && knowledgeItems.length === 0) {
    return (
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search knowledge items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="TECHNICAL">Technical</SelectItem>
              <SelectItem value="BUSINESS">Business</SelectItem>
              <SelectItem value="PROCESS">Process</SelectItem>
              <SelectItem value="CULTURAL">Cultural</SelectItem>
              <SelectItem value="TROUBLESHOOTING">Troubleshooting</SelectItem>
              <SelectItem value="BEST_PRACTICE">Best Practice</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {renderSkeleton()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Base</h2>
          <p className="text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} found
          </p>
        </div>
        {onCreateClick && (
          <Button onClick={onCreateClick} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Knowledge
          </Button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="TECHNICAL">Technical</SelectItem>
            <SelectItem value="BUSINESS">Business</SelectItem>
            <SelectItem value="PROCESS">Process</SelectItem>
            <SelectItem value="CULTURAL">Cultural</SelectItem>
            <SelectItem value="TROUBLESHOOTING">Troubleshooting</SelectItem>
            <SelectItem value="BEST_PRACTICE">Best Practice</SelectItem>
          </SelectContent>
        </Select>

        <Select value={difficultyFilter} onValueChange={(value: any) => setDifficultyFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Levels</SelectItem>
            <SelectItem value="BEGINNER">Beginner</SelectItem>
            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
            <SelectItem value="ADVANCED">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleResetFilters} className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Knowledge Items Grid */}
      {knowledgeItems.length === 0 ? (
        <Alert>
          <AlertDescription>
            No knowledge items found matching your criteria. Try adjusting your search or filters.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {knowledgeItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-3" onClick={() => onItemClick?.(item)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary">
                      {item.title}
                    </CardTitle>
                    {item.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {item.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className={getTypeColor(item.type)}>
                    {item.type.replace('_', ' ')}
                  </Badge>
                  <Badge variant="secondary" className={getDifficultyColor(item.difficulty)}>
                    {item.difficulty}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0" onClick={() => onItemClick?.(item)}>
                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Author and Meta */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {item.author?.firstName?.[0]}{item.author?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{item.author?.firstName} {item.author?.lastName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{item.viewCount}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 flex justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                
                {onEditClick && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(item);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}; 