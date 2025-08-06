import React, { useState, useEffect } from 'react';
import { Save, X, Upload, Tag as TagIcon, Eye } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Badge,
  Switch,
  Alert,
  AlertDescription,
  Separator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { knowledgeApi, KnowledgeItem, KnowledgeType, DifficultyLevel, ContentStatus } from '@/services/api/knowledge';
import { useToast } from '@/hooks/useToast';

interface KnowledgeFormProps {
  knowledgeItem?: KnowledgeItem;
  projectId?: string;
  onSave?: (item: KnowledgeItem) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

interface FormData {
  title: string;
  description: string;
  content: string;
  type: KnowledgeType;
  category: string;
  tags: string[];
  difficulty: DifficultyLevel;
  isPublic: boolean;
  projectId: string;
}

export const KnowledgeForm: React.FC<KnowledgeFormProps> = ({
  knowledgeItem,
  projectId,
  onSave,
  onCancel,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    content: '',
    type: KnowledgeType.TECHNICAL,
    category: '',
    tags: [],
    difficulty: DifficultyLevel.INTERMEDIATE,
    isPublic: false,
    projectId: projectId || ''
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Initialize form with existing data for editing
  useEffect(() => {
    if (isEdit && knowledgeItem) {
      setFormData({
        title: knowledgeItem.title,
        description: knowledgeItem.description || '',
        content: knowledgeItem.content,
        type: knowledgeItem.type,
        category: knowledgeItem.category || '',
        tags: knowledgeItem.tags || [],
        difficulty: knowledgeItem.difficulty,
        isPublic: knowledgeItem.isPublic,
        projectId: knowledgeItem.projectId
      });
    }
  }, [isEdit, knowledgeItem]);

  // Handle form field changes
  const handleInputChange = (field: keyof FormData, value: any) => {
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

  // Add tag
  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !formData.tags.includes(newTag)) {
      handleInputChange('tags', [...formData.tags, newTag]);
      setTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // Handle tag input key press
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters long';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async (status: ContentStatus = ContentStatus.DRAFT) => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      const saveData = {
        ...formData,
        status
      };

      let savedItem: KnowledgeItem;

      if (isEdit && knowledgeItem) {
        savedItem = await knowledgeApi.updateKnowledge(knowledgeItem.id, saveData);
      } else {
        savedItem = await knowledgeApi.createKnowledge(saveData);
      }

      toast({
        title: 'Success',
        description: `Knowledge item ${isEdit ? 'updated' : 'created'} successfully.`,
      });

      onSave?.(savedItem);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} knowledge item.`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle publish
  const handlePublish = () => {
    handleSave('PUBLISHED');
  };

  // Handle save as draft
  const handleSaveDraft = () => {
    handleSave('DRAFT');
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>
            {isEdit ? 'Edit Knowledge Item' : 'Create New Knowledge Item'}
          </CardTitle>
          <CardDescription>
            {isEdit 
              ? 'Update the knowledge item information below.'
              : 'Share your knowledge with the team by filling out the form below.'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a descriptive title..."
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of what this knowledge covers..."
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Content */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="content">Content *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
            </div>

            {showPreview ? (
              <Card className="p-4 min-h-[300px] bg-muted/50">
                <div className="prose prose-sm max-w-none">
                  {formData.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2">
                      {paragraph || '\u00A0'}
                    </p>
                  ))}
                </div>
              </Card>
            ) : (
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your knowledge content here... Use markdown for formatting."
                rows={15}
                className={`font-mono ${errors.content ? 'border-red-500' : ''}`}
              />
            )}
            
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value: KnowledgeType) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select knowledge type" />
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

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <Select value={formData.difficulty} onValueChange={(value: DifficultyLevel) => handleInputChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g., Frontend, Backend, Database..."
              />
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                />
                <Label className="text-sm">
                  {formData.isPublic ? 'Public (visible to everyone)' : 'Team only'}
                </Label>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <Label>Tags</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Add tags (press Enter or comma to add)"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                  <TagIcon className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Validation Errors */}
          {Object.keys(errors).length > 0 && (
            <Alert>
              <AlertDescription>
                Please fix the validation errors above before saving.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            
            <Button
              onClick={handlePublish}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {loading ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Preview Dialog for Mobile */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Content Preview</DialogTitle>
            <DialogDescription>
              This is how your content will appear to readers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="prose prose-sm max-w-none">
            <h1>{formData.title}</h1>
            {formData.description && (
              <p className="text-muted-foreground">{formData.description}</p>
            )}
            <div className="mt-4">
              {formData.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2">
                  {paragraph || '\u00A0'}
                </p>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 