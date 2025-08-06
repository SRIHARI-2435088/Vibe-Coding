import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import {
  FolderOpen,
  Plus,
  Calendar,
  Building,
  Code,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { projectsApi, Project } from '@/services/api/projects';
import { useToast } from '@/hooks/useToast';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';

interface ProjectFormData {
  name: string;
  description: string;
  status: 'ACTIVE' | 'PLANNING' | 'ON_HOLD' | 'COMPLETED';
  clientName: string;
  technology: string;
  startDate: string;
  endDate: string;
}

interface ProjectCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: Project) => void;
  editProject?: Project | null;
}

export const ProjectCreationForm: React.FC<ProjectCreationFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editProject
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: editProject?.name || '',
    description: editProject?.description || '',
    status: (editProject?.status as any) || 'PLANNING',
    clientName: editProject?.clientName || '',
    technology: editProject?.technology || '',
    startDate: editProject?.startDate ? new Date(editProject.startDate).toISOString().split('T')[0] : '',
    endDate: editProject?.endDate ? new Date(editProject.endDate).toISOString().split('T')[0] : '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { canCreateProject } = useGlobalPermissions();
  const { toast } = useToast();

  const techOptions = [
    'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 
    'C#', '.NET', 'PHP', 'Ruby', 'Go', 'Rust', 'TypeScript', 
    'JavaScript', 'Flutter', 'React Native', 'Swift', 'Kotlin'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.technology) {
      newErrors.technology = 'Technology stack is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.endDate && formData.startDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const projectData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };

      let savedProject: Project;

      if (editProject) {
        savedProject = await projectsApi.updateProject(editProject.id, projectData);
        toast({
          title: 'Success',
          description: 'Project updated successfully!',
        });
      } else {
        savedProject = await projectsApi.createProject(projectData);
        toast({
          title: 'Success',
          description: 'Project created successfully!',
        });
      }

      onSuccess(savedProject);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        status: 'PLANNING',
        clientName: '',
        technology: '',
        startDate: '',
        endDate: '',
      });
      setErrors({});
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to ${editProject ? 'update' : 'create'} project`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  if (!canCreateProject && !editProject) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            {editProject ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {editProject 
              ? 'Update project information and settings'
              : 'Set up a new project for knowledge sharing and collaboration'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter project name..."
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the project goals, scope, and objectives..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName">Client/Organization</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="Enter client or organization name..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technology">Technology Stack *</Label>
              <Select value={formData.technology} onValueChange={(value) => handleInputChange('technology', value)}>
                <SelectTrigger className={errors.technology ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select primary technology" />
                </SelectTrigger>
                <SelectContent>
                  {techOptions.map((tech) => (
                    <SelectItem key={tech} value={tech}>
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        {tech}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.technology && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.technology}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Status Info */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {editProject 
                ? 'Changes will be saved and visible to all team members immediately.'
                : 'After creating the project, you can invite team members and start adding knowledge items.'
              }
            </AlertDescription>
          </Alert>

          <DialogFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading 
                ? (editProject ? 'Updating...' : 'Creating...') 
                : (editProject ? 'Update Project' : 'Create Project')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 