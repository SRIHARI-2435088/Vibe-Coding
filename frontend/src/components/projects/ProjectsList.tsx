import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, Calendar, Settings, Trash2, Edit, Eye, Filter } from 'lucide-react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
import { ProjectCreationForm } from './ProjectCreationForm';

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
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [techFilter, setTechFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState('my-projects');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  
  const { toast } = useToast();
  const { canCreateProject, canViewAllProjects, isAuthenticated, user } = useGlobalPermissions();
  const { renderIfAuthenticated } = useConditionalRender();

  // Get unique technologies from projects
  const getUniqueTechnologies = (projectList: Project[]) => {
    const techs = projectList.map(p => p.technology).filter(Boolean);
    return [...new Set(techs)].sort();
  };

  // Fetch user's projects
  const fetchMyProjects = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await projectsApi.getMyProjects();
      const projects = response?.projects || response || [];
      // Ensure all projects have required properties
      const validProjects = Array.isArray(projects) ? projects.filter(p => p && typeof p === 'object') : [];
      setMyProjects(validProjects);
    } catch (error: any) {
      console.error('Error fetching my projects:', error);
      setMyProjects([]); // Set empty array on error
      toast({
        title: 'Error',
        description: 'Failed to load your projects',
        variant: 'destructive',
      });
    }
  };

  // Fetch all projects (for users with permission)
  const fetchAllProjects = async () => {
    if (!canViewAllProjects) return;
    
    try {
      const response = await projectsApi.getAllProjects();
      const projects = response?.projects || response || [];
      // Ensure all projects have required properties
      const validProjects = Array.isArray(projects) ? projects.filter(p => p && typeof p === 'object') : [];
      setAllProjects(validProjects);
    } catch (error: any) {
      console.error('Error fetching all projects:', error);
      setAllProjects([]); // Set empty array on error
      toast({
        title: 'Error',
        description: 'Failed to load all projects',
        variant: 'destructive',
      });
    }
  };

  // Fetch projects based on active tab
  const fetchProjects = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMyProjects(),
        canViewAllProjects ? fetchAllProjects() : Promise.resolve()
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on search and filters
  const filterProjects = (projectList: Project[]) => {
    return projectList.filter(project => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
                           (project.name?.toLowerCase().includes(searchLower)) ||
                           (project.description?.toLowerCase().includes(searchLower)) ||
                           (project.technology?.toLowerCase().includes(searchLower));
      
      const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
      const matchesTech = techFilter === 'ALL' || project.technology === techFilter;
      
      return matchesSearch && matchesStatus && matchesTech;
    });
  };

  // Get current projects based on active tab
  const getCurrentProjects = () => {
    const projectList = activeTab === 'my-projects' ? myProjects : allProjects;
    return filterProjects(projectList);
  };

  // Handle project creation success
  const handleProjectCreated = (newProject: Project) => {
    setMyProjects(prev => [newProject, ...prev]);
    if (canViewAllProjects) {
      setAllProjects(prev => [newProject, ...prev]);
    }
    fetchProjects(); // Refresh to get updated data
  };

  // Handle project edit
  const handleEditProject = (project: Project) => {
    setEditProject(project);
    setShowCreateForm(true);
  };

  // Handle project update success
  const handleProjectUpdated = (updatedProject: Project) => {
    const updateProjectInList = (projectList: Project[]) => 
      projectList.map(p => p.id === updatedProject.id ? updatedProject : p);
    
    setMyProjects(updateProjectInList);
    setAllProjects(updateProjectInList);
    setEditProject(null);
  };

  // Handle delete project
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    setDeleting(true);
    try {
      await projectsApi.deleteProject(projectToDelete.id);
      
      setMyProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      setAllProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Join project functionality
  const handleJoinProject = async (project: Project) => {
    try {
      await projectsApi.joinProject(project.id);
      toast({
        title: 'Success',
        description: `Successfully joined ${project.name}`,
      });
      fetchProjects(); // Refresh projects
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to join project',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, canViewAllProjects]);

  const currentProjects = getCurrentProjects();
  const uniqueTechnologies = getUniqueTechnologies(
    activeTab === 'my-projects' ? myProjects : allProjects
  );

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertDescription>
          Please log in to view projects.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Collaborate on projects and share knowledge with your team
          </p>
        </div>
        {canCreateProject && showCreateButton && (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`grid w-full ${canViewAllProjects ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="my-projects" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>My Projects ({myProjects.length})</span>
          </TabsTrigger>
          {canViewAllProjects && (
            <TabsTrigger value="all-projects" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>All Projects ({allProjects.length})</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PLANNING">Planning</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={techFilter} onValueChange={setTechFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Technology" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Tech</SelectItem>
                {uniqueTechnologies.map((tech) => (
                  <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Project Lists */}
        <TabsContent value="my-projects">
          <div className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            ) : currentProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => onProjectClick?.(project)}
                    onEdit={() => handleEditProject(project)}
                    onDelete={() => {
                      setProjectToDelete(project);
                      setDeleteDialogOpen(true);
                    }}
                    showActions={true}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">No projects found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== 'ALL' || techFilter !== 'ALL'
                          ? 'Try adjusting your search or filters'
                          : activeTab === 'my-projects' 
                            ? 'You haven\'t joined any projects yet'
                            : 'No projects available'
                        }
                      </p>
                    </div>
                    {canCreateProject && !searchTerm && statusFilter === 'ALL' && techFilter === 'ALL' && (
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Project
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {canViewAllProjects && (
          <TabsContent value="all-projects">
            <div className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              ) : currentProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => onProjectClick?.(project)}
                      onEdit={() => handleEditProject(project)}
                      onDelete={() => {
                        setProjectToDelete(project);
                        setDeleteDialogOpen(true);
                      }}
                      onJoin={() => handleJoinProject(project)}
                      showActions={true}
                      isUserMember={myProjects.some(mp => mp.id === project.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <Settings className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">No projects found</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Project Creation/Edit Form */}
      <ProjectCreationForm
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setEditProject(null);
        }}
        onSuccess={editProject ? handleProjectUpdated : handleProjectCreated}
        editProject={editProject}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
              All associated knowledge items will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 