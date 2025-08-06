import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, Calendar, Settings, Trash2, Edit, Eye } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { 
  projectsApi, 
  Project, 
  ProjectStatus, 
  ProjectsListResponse,
  projectUtils 
} from '@/services/api/projects';
import { useToast } from '@/hooks/useToast';
import { useGlobalPermissions, useRolePermissions, getRoleColor, getRoleIcon } from '@/hooks/useRolePermissions';
import { RoleGuard, PermissionGuard, useConditionalRender } from '@/components/auth/RoleGuard';
import { ProjectCard } from './ProjectCard';

interface ProjectsListProps {
  onCreateClick?: () => void;
  onProjectClick?: (project: Project) => void;
  onEditClick?: (project: Project) => void;
  showCreateButton?: boolean;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
  onCreateClick,
  onProjectClick,
  onEditClick,
  showCreateButton = true
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const { canCreateProject, isAuthenticated } = useGlobalPermissions();
  const { renderIfAuthenticated } = useConditionalRender();

  // Fetch projects with user's membership info
  const fetchProjects = async () => {
    if (!isAuthenticated) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch both all projects and user's project memberships
      const [allProjectsResponse, userProjectsResponse] = await Promise.all([
        projectsApi.getAllProjects(),
        projectsApi.getMyProjects()
      ]);

      // Create a map of user's project memberships
      const userMemberships = new Map(
        userProjectsResponse.projects.map(membership => [
          membership.projectId, 
          membership
        ])
      );

      // Enhance projects with user's role information
      const enhancedProjects = allProjectsResponse.projects.map(project => ({
        ...project,
        userMembership: userMemberships.get(project.id),
        userRole: userMemberships.get(project.id)?.role,
        isUserMember: userMemberships.has(project.id)
      }));

      setProjects(enhancedProjects);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle delete project
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      setDeleting(true);
      await projectsApi.deleteProject(projectToDelete.id);
      
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });

      // Remove from local state
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete project',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Confirm delete
  const confirmDelete = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
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

  if (loading && projects.length === 0) {
    return (
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-muted-foreground">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
          </p>
        </div>
        {renderIfAuthenticated(
          showCreateButton && onCreateClick && canCreateProject() && (
            <Button onClick={onCreateClick} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          )
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleResetFilters} className="flex items-center gap-2">
          Reset
        </Button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Alert>
          <AlertDescription>
            No projects found matching your criteria. Try adjusting your search or filters.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onProjectClick={onProjectClick}
              onEditClick={onEditClick}
              onDeleteClick={confirmDelete}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the project "{projectToDelete?.name}"? 
              This action cannot be undone and will also delete all associated knowledge items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 