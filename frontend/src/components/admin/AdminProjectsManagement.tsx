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
  FolderOpen,
  Users,
  Search,
  Filter,
  Edit,
  Eye,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Building,
  Calendar,
  Code,
  BookOpen,
  TrendingUp,
  BarChart3,
  Settings,
  UserPlus,
  Crown,
  Plus,
  Trash2,
} from 'lucide-react';
import { adminApi } from '@/services/api/admin';
import { projectsApi } from '@/services/api/projects';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';
import { useToast } from '@/hooks/useToast';

interface AdminProject {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate?: string;
  clientName?: string;
  technology: string;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    role: string;
    joinedAt: string;
    leftAt?: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  knowledgeItems: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  _count: {
    members: number;
    knowledgeItems: number;
  };
}

interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  clientName: string;
  technology: string[];
}

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
  ON_HOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ARCHIVED: 'bg-red-100 text-red-800 border-red-200',
};

const ROLE_COLORS = {
  LEAD: 'bg-purple-100 text-purple-800 border-purple-200',
  MEMBER: 'bg-blue-100 text-blue-800 border-blue-200',
  OBSERVER: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const AdminProjectsManagement: React.FC = () => {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    clientName: '',
    technology: [],
  });
  const [techInput, setTechInput] = useState('');

  const { canManageAllProjects } = useGlobalPermissions();
  const { toast } = useToast();

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      let allProjects: AdminProject[] = [];
      
      if (canManageAllProjects()) {
        // Fetch all projects for admins and project managers
        allProjects = await adminApi.getAllProjects();
      }
      
      setProjects(allProjects);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedProject || !newStatus) return;

    try {
      await adminApi.updateProjectStatus(selectedProject.id, newStatus);
      toast({
        title: 'Success',
        description: 'Project status updated successfully',
      });
      setIsStatusDialogOpen(false);
      setSelectedProject(null);
      setNewStatus('');
      fetchProjects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update project status',
        variant: 'destructive',
      });
    }
  };

  // Handle create project
  const handleCreateProject = async () => {
    try {
      await projectsApi.createProject({
        name: formData.name,
        description: formData.description,
        status: formData.status as any,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        clientName: formData.clientName || undefined,
        technology: formData.technology,
      });
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchProjects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  // Handle edit project
  const handleEditProject = async () => {
    if (!selectedProject) return;

    try {
      await projectsApi.updateProject(selectedProject.id, {
        name: formData.name,
        description: formData.description,
        status: formData.status as any,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        clientName: formData.clientName || undefined,
        technology: formData.technology,
      });
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      resetForm();
      fetchProjects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project',
        variant: 'destructive',
      });
    }
  };

  // Handle delete project
  const handleDeleteProject = async (project: AdminProject) => {
    if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await projectsApi.deleteProject(project.id);
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      fetchProjects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (project: AdminProject) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      startDate: project.startDate?.split('T')[0] || '',
      endDate: project.endDate?.split('T')[0] || '',
      clientName: project.clientName || '',
      technology: typeof project.technology === 'string' 
        ? project.technology.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : project.technology || [],
    });
    setIsEditDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'ACTIVE',
      startDate: '',
      endDate: '',
      clientName: '',
      technology: [],
    });
    setTechInput('');
  };

  // Add technology tag
  const addTechnology = () => {
    if (techInput.trim() && !formData.technology.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technology: [...formData.technology, techInput.trim()]
      });
      setTechInput('');
    }
  };

  // Remove technology tag
  const removeTechnology = (tech: string) => {
    setFormData({
      ...formData,
      technology: formData.technology.filter(t => t !== tech)
    });
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.technology.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  // Calculate stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'ACTIVE').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    onHold: projects.filter(p => p.status === 'ON_HOLD').length,
    archived: projects.filter(p => p.status === 'ARCHIVED').length,
    totalMembers: projects.reduce((sum, p) => sum + p._count.members, 0),
    totalKnowledge: projects.reduce((sum, p) => sum + p._count.knowledgeItems, 0),
  };

  if (!canManageAllProjects()) {
    return (
      <div className="text-center py-12">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access project management.
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
          <h2 className="text-2xl font-bold tracking-tight">Project Management</h2>
          <p className="text-muted-foreground">
            Monitor and manage all projects across the organization
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <FolderOpen className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Clock className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.onHold}</p>
              <p className="text-xs text-muted-foreground">On Hold</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.archived}</p>
              <p className="text-xs text-muted-foreground">Archived</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Users className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.totalMembers}</p>
              <p className="text-xs text-muted-foreground">Team Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <BookOpen className="h-8 w-8 text-indigo-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.totalKnowledge}</p>
              <p className="text-xs text-muted-foreground">Knowledge Items</p>
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
                  placeholder="Search projects..."
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
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Projects ({filteredProjects.length})</CardTitle>
          <CardDescription>
            Overview and management of all organizational projects
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
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Technology</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Knowledge</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {project.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}
                        >
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {project.clientName || 'Internal'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Code className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{project.technology}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{project._count.members}</span>
                          <span className="text-xs text-muted-foreground">members</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{project._count.knowledgeItems}</span>
                          <span className="text-xs text-muted-foreground">items</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(project.startDate).toLocaleDateString()}
                          </div>
                          {project.endDate && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(project.endDate).toLocaleDateString()}
                            </div>
                          )}
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
                                setSelectedProject(project);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(project)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Project
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProject(project);
                                setNewStatus(project.status);
                                setIsStatusDialogOpen(true);
                              }}
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Change Status
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteProject(project)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Project
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
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProjects.length)} of{' '}
                    {filteredProjects.length} projects
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>
              {selectedProject?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm">
                    <Badge className={STATUS_COLORS[selectedProject.status as keyof typeof STATUS_COLORS]}>
                      {selectedProject.status.replace('_', ' ')}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Client</Label>
                  <p className="text-sm">{selectedProject.clientName || 'Internal'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Technology</Label>
                  <p className="text-sm">{selectedProject.technology}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm">{new Date(selectedProject.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm mt-1">{selectedProject.description}</p>
              </div>

              {/* Team Members */}
              <div>
                <Label className="text-sm font-medium">Team Members ({selectedProject.members.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedProject.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {member.user.firstName[0]}{member.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={ROLE_COLORS[member.role as keyof typeof ROLE_COLORS]}
                        >
                          {member.role === 'LEAD' && <Crown className="h-3 w-3 mr-1" />}
                          {member.role}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Knowledge Items */}
              <div>
                <Label className="text-sm font-medium">Knowledge Items ({selectedProject.knowledgeItems.length})</Label>
                <div className="mt-2">
                  {selectedProject.knowledgeItems.length > 0 ? (
                    <div className="space-y-1">
                      {selectedProject.knowledgeItems.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                          <p className="text-sm">{item.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                      {selectedProject.knowledgeItems.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          +{selectedProject.knowledgeItems.length - 5} more items
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No knowledge items yet</p>
                  )}
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
            <DialogTitle>Update Project Status</DialogTitle>
            <DialogDescription>
              Change the status of "{selectedProject?.name}"
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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
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

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter project description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Enter client name"
              />
            </div>
            <div>
              <Label htmlFor="technology">Technologies</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="Add technology"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                />
                <Button type="button" onClick={addTechnology}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.technology.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
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
            <Button onClick={handleCreateProject}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editName">Project Name *</Label>
                <Input
                  id="editName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Input
                id="editDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter project description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editStartDate">Start Date</Label>
                <Input
                  id="editStartDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editEndDate">End Date</Label>
                <Input
                  id="editEndDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editClientName">Client Name</Label>
              <Input
                id="editClientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Enter client name"
              />
            </div>
            <div>
              <Label htmlFor="editTechnology">Technologies</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="Add technology"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                />
                <Button type="button" onClick={addTechnology}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.technology.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
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
            <Button onClick={handleEditProject}>
              Update Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 