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
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Settings,
  Users,
  Calendar,
  Building,
  Code,
  MoreHorizontal,
  Search,
  Filter,
  UserPlus,
  UserMinus,
  Crown,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { projectsApi, Project, ProjectMember } from '@/services/api/projects';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';
import { useToast } from '@/hooks/useToast';

interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  clientName: string;
  technology: string[];
  startDate: string;
  endDate?: string;
}

const PROJECT_STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
  ON_HOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const PROJECT_ROLE_COLORS = {
  LEAD: 'bg-purple-100 text-purple-800 border-purple-200',
  MEMBER: 'bg-blue-100 text-blue-800 border-blue-200',
  OBSERVER: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const ProjectsManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('my-projects');

  const { canCreateProjects, canManageAllProjects, canViewAllProjects, user } = useGlobalPermissions();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'ACTIVE',
    clientName: '',
    technology: [],
    startDate: '',
    endDate: '',
  });

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      let projectsData;
      
      if (activeTab === 'all-projects' && canViewAllProjects()) {
        projectsData = await projectsApi.getAllProjects();
      } else {
        projectsData = await projectsApi.getMyProjects();
      }
      
      setProjects(projectsData.projects);
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

  // Fetch project members
  const fetchProjectMembers = async (projectId: string) => {
    try {
      const members = await projectsApi.getProjectMembers(projectId);
      setProjectMembers(members);
    } catch (error: any) {
      console.error('Error fetching project members:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeTab]);

  // Handle form input changes
  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle technology tags
  const handleTechnologyChange = (techString: string) => {
    const technologies = techString.split(',').map(tech => tech.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      technology: technologies
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'ACTIVE',
      clientName: '',
      technology: [],
      startDate: '',
      endDate: '',
    });
  };

  // Handle create project
  const handleCreateProject = async () => {
    try {
      await projectsApi.createProject({
        ...formData,
        technology: formData.technology.join(', ')
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
        description: 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  // Handle edit project
  const handleEditProject = async () => {
    if (!selectedProject) return;

    try {
      await projectsApi.updateProject(selectedProject.id, {
        ...formData,
        technology: formData.technology.join(', ')
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
        description: 'Failed to update project',
        variant: 'destructive',
      });
    }
  };

  // Handle delete project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await projectsApi.deleteProject(projectId);
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      fetchProjects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      clientName: project.clientName || '',
      technology: project.technology || [],
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    });
    setIsEditDialogOpen(true);
  };

  // Open members dialog
  const openMembersDialog = (project: Project) => {
    setSelectedProject(project);
    fetchProjectMembers(project.id);
    setIsMembersDialogOpen(true);
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get user's role in project
  const getUserRoleInProject = (project: Project): string | null => {
    if (!user) return null;
    const membership = project.members?.find(member => member.userId === user.id);
    return membership?.role || null;
  };

  // Check if user can manage project
  const canManageProject = (project: Project): boolean => {
    if (canManageAllProjects()) return true;
    const userRole = getUserRoleInProject(project);
    return userRole === 'LEAD';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderOpen className="h-8 w-8" />
            Projects Management
          </h1>
          <p className="text-muted-foreground">
            Manage projects, members, and track progress
          </p>
        </div>
        {canCreateProjects() && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
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
                  {projects.filter(p => p.status === 'ACTIVE').length}
                </p>
                <p className="text-xs text-muted-foreground">Active Projects</p>
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
                  {projects.filter(p => p.status === 'ON_HOLD').length}
                </p>
                <p className="text-xs text-muted-foreground">On Hold</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'COMPLETED').length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          {canViewAllProjects() && (
            <TabsTrigger value="all-projects">All Projects</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Table */}
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
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Your Role</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => {
                      const userRole = getUserRoleInProject(project);
                      const canManage = canManageProject(project);
                      
                      return (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{project.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {project.description}
                              </p>
                              {project.technology && project.technology.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {project.technology.slice(0, 3).map((tech, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tech}
                                    </Badge>
                                  ))}
                                  {project.technology.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{project.technology.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_COLORS]}>
                              {project.status === 'ACTIVE' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {project.status === 'ON_HOLD' && <Clock className="h-3 w-3 mr-1" />}
                              {project.status === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {project.status === 'CANCELLED' && <XCircle className="h-3 w-3 mr-1" />}
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {project.clientName ? (
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                {project.clientName}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No client</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {project.memberCount || 0}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openMembersDialog(project)}
                                className="h-6 px-2"
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {userRole ? (
                              <Badge className={PROJECT_ROLE_COLORS[userRole as keyof typeof PROJECT_ROLE_COLORS]}>
                                {userRole === 'LEAD' && <Crown className="h-3 w-3 mr-1" />}
                                {userRole}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">Not a member</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {project.startDate ? (
                              new Date(project.startDate).toLocaleDateString()
                            ) : (
                              <span className="text-muted-foreground">Not set</span>
                            )}
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
                                  onClick={() => openMembersDialog(project)}
                                >
                                  <Users className="mr-2 h-4 w-4" />
                                  View Members
                                </DropdownMenuItem>
                                {canManage && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => openEditDialog(project)}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Project
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteProject(project.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Project
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project and invite team members to collaborate.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  placeholder="Enter client name"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="technology">Technologies</Label>
              <Input
                id="technology"
                placeholder="React, Node.js, PostgreSQL (comma separated)"
                value={formData.technology.join(', ')}
                onChange={(e) => handleTechnologyChange(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={!formData.name}>
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Project Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-clientName">Client Name</Label>
                <Input
                  id="edit-clientName"
                  placeholder="Enter client name"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter project description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-technology">Technologies</Label>
              <Input
                id="edit-technology"
                placeholder="React, Node.js, PostgreSQL (comma separated)"
                value={formData.technology.join(', ')}
                onChange={(e) => handleTechnologyChange(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject} disabled={!formData.name}>
              Update Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Members Dialog */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Project Members - {selectedProject?.name}
            </DialogTitle>
            <DialogDescription>
              Manage project team members and their roles.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {projectMembers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.user?.firstName} {member.user?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.user?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={PROJECT_ROLE_COLORS[member.role as keyof typeof PROJECT_ROLE_COLORS]}>
                          {member.role === 'LEAD' && <Crown className="h-3 w-3 mr-1" />}
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.leftAt ? 'secondary' : 'default'}>
                          {member.leftAt ? 'Left' : 'Active'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No members found for this project</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMembersDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 