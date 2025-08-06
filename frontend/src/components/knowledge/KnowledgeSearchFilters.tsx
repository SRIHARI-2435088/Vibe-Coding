import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Separator,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  SlidersHorizontal,
  Calendar,
  User,
  Tag,
  BookOpen,
  Star,
  TrendingUp,
  Clock,
  Eye
} from 'lucide-react';
import { projectsApi } from '@/services/api/projects';
import { useToast } from '@/hooks/useToast';

export interface KnowledgeFilters {
  search: string;
  type: string;
  category: string;
  difficulty: string;
  status: string;
  tags: string[];
  projectId: string;
  authorId: string;
  dateRange: 'all' | 'week' | 'month' | 'quarter' | 'year';
  sortBy: 'recent' | 'popular' | 'title' | 'author' | 'rating';
  sortOrder: 'asc' | 'desc';
  isPublic?: boolean;
}

interface KnowledgeSearchFiltersProps {
  filters: KnowledgeFilters;
  onFiltersChange: (filters: KnowledgeFilters) => void;
  onSearch: () => void;
  loading?: boolean;
  resultCount?: number;
}

export const KnowledgeSearchFilters: React.FC<KnowledgeSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  loading = false,
  resultCount = 0
}) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tempTagInput, setTempTagInput] = useState('');
  
  const { toast } = useToast();

  // Knowledge types
  const knowledgeTypes = [
    { value: '', label: 'All Types' },
    { value: 'TECHNICAL', label: 'Technical' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'PROCESS', label: 'Process' },
    { value: 'CULTURAL', label: 'Cultural' },
    { value: 'TROUBLESHOOTING', label: 'Troubleshooting' },
    { value: 'BEST_PRACTICE', label: 'Best Practice' }
  ];

  // Categories
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Frontend', label: 'Frontend' },
    { value: 'Backend', label: 'Backend' },
    { value: 'Database', label: 'Database' },
    { value: 'DevOps', label: 'DevOps' },
    { value: 'Testing', label: 'Testing' },
    { value: 'Security', label: 'Security' },
    { value: 'Architecture', label: 'Architecture' },
    { value: 'Documentation', label: 'Documentation' },
    { value: 'API', label: 'API' },
    { value: 'Performance', label: 'Performance' }
  ];

  // Difficulty levels
  const difficultyLevels = [
    { value: '', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'EXPERT', label: 'Expert' }
  ];

  // Status options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'author', label: 'Author' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  // Date range options
  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'Past Week' },
    { value: 'month', label: 'Past Month' },
    { value: 'quarter', label: 'Past 3 Months' },
    { value: 'year', label: 'Past Year' }
  ];

  // Fetch projects for filter
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectsApi.getMyProjects();
        setProjects(response.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  // Sample tags - in real app, these would come from backend
  useEffect(() => {
    setAvailableTags([
      'react', 'javascript', 'typescript', 'node.js', 'python', 'api', 
      'database', 'security', 'performance', 'testing', 'deployment',
      'documentation', 'best-practices', 'troubleshooting', 'tutorial',
      'guide', 'reference', 'architecture', 'design-patterns'
    ]);
  }, []);

  const updateFilter = (key: keyof KnowledgeFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !filters.tags.includes(tag.trim())) {
      const newTags = [...filters.tags, tag.trim()];
      updateFilter('tags', newTags);
    }
    setTempTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = filters.tags.filter(tag => tag !== tagToRemove);
    updateFilter('tags', newTags);
  };

  const clearAllFilters = () => {
    const clearedFilters: KnowledgeFilters = {
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
    };
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return filters.search || 
           filters.type || 
           filters.category || 
           filters.difficulty || 
           filters.status ||
           filters.tags.length > 0 ||
           filters.projectId ||
           filters.authorId ||
           filters.dateRange !== 'all' ||
           filters.isPublic !== undefined;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search knowledge items..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={onSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters() && (
                <Badge variant="secondary" className="ml-1">
                  {[
                    filters.type,
                    filters.category,
                    filters.difficulty,
                    filters.status,
                    filters.projectId,
                    filters.authorId,
                    filters.dateRange !== 'all' ? filters.dateRange : '',
                    filters.isPublic !== undefined ? 'visibility' : '',
                    ...filters.tags
                  ].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Advanced Search Filters</DialogTitle>
              <DialogDescription>
                Refine your search with detailed filters and sorting options
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Content Filters */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Content Filters
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {knowledgeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Difficulty</label>
                    <Select value={filters.difficulty} onValueChange={(value) => updateFilter('difficulty', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Context Filters */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Context Filters
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Project</label>
                    <Select value={filters.projectId} onValueChange={(value) => updateFilter('projectId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All projects" />
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
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <Select value={filters.dateRange} onValueChange={(value: any) => updateFilter('dateRange', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        {dateRangeOptions.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Visibility</label>
                    <Select 
                      value={filters.isPublic === undefined ? '' : filters.isPublic ? 'public' : 'private'} 
                      onValueChange={(value) => updateFilter('isPublic', value === '' ? undefined : value === 'public')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Visibility</SelectItem>
                        <SelectItem value="public">Public Only</SelectItem>
                        <SelectItem value="private">Team Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <div className="flex gap-2">
                      <Select value={filters.sortBy} onValueChange={(value: any) => updateFilter('sortBy', value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filters.sortOrder} onValueChange={(value: any) => updateFilter('sortOrder', value)}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Desc</SelectItem>
                          <SelectItem value="asc">Asc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="md:col-span-2 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={tempTagInput}
                      onChange={(e) => setTempTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(tempTagInput);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => addTag(tempTagInput)}
                      disabled={!tempTagInput.trim()}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Popular tags */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Popular tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {availableTags.slice(0, 10).map((tag) => (
                        <Badge
                          key={tag}
                          variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            if (filters.tags.includes(tag)) {
                              removeTag(tag);
                            } else {
                              addTag(tag);
                            }
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Selected tags */}
                  {filters.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Selected tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {filters.tags.map((tag) => (
                          <Badge key={tag} variant="default" className="text-xs">
                            {tag}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer" 
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
              <div className="flex gap-2">
                <DialogTrigger asChild>
                  <Button variant="outline">Close</Button>
                </DialogTrigger>
                <DialogTrigger asChild>
                  <Button onClick={onSearch}>Apply Filters</Button>
                </DialogTrigger>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filters.sortBy} onValueChange={(value: any) => updateFilter('sortBy', value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {knowledgeTypes.slice(0, 4).map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.slice(0, 6).map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters() && (
          <Button variant="outline" size="sm" onClick={clearAllFilters} className="flex items-center gap-1">
            <X className="h-3 w-3" />
            Clear ({[filters.type, filters.category, filters.difficulty, filters.status, ...filters.tags, filters.projectId].filter(Boolean).length})
          </Button>
        )}
      </div>

      {/* Results summary */}
      {resultCount !== undefined && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {resultCount} {resultCount === 1 ? 'result' : 'results'} found
            {filters.search && ` for "${filters.search}"`}
          </span>
          
          {hasActiveFilters() && (
            <span className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              {[filters.type, filters.category, filters.difficulty, filters.status, ...filters.tags, filters.projectId].filter(Boolean).length} filters active
            </span>
          )}
        </div>
      )}
    </div>
  );
}; 