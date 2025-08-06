import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Eye, Calendar, User, Tag as TagIcon, Star, Share2, Bookmark, Download } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  Separator,
  Alert,
  AlertDescription,
  Skeleton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';
import { knowledgeApi, KnowledgeItem } from '@/services/api/knowledge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';

interface KnowledgeDetailProps {
  knowledgeId: string;
  onBack?: () => void;
  onEdit?: (item: KnowledgeItem) => void;
}

export const KnowledgeDetail: React.FC<KnowledgeDetailProps> = ({
  knowledgeId,
  onBack,
  onEdit
}) => {
  const [knowledgeItem, setKnowledgeItem] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch knowledge item
  useEffect(() => {
    const fetchKnowledgeItem = async () => {
      try {
        setLoading(true);
        const response = await knowledgeApi.getKnowledgeById(knowledgeId);
        setKnowledgeItem(response.data);
        
        // Set ratings (mock data for now)
        setRating(response.data.rating || 4.2);
        // In a real app, we'd fetch the user's rating from the API
        setUserRating(0);
      } catch (error) {
        console.error('Error fetching knowledge item:', error);
        toast({
          title: 'Error',
          description: 'Failed to load knowledge item',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (knowledgeId) {
      fetchKnowledgeItem();
    }
  }, [knowledgeId, toast]);

  // Handle rating
  const handleRate = (newRating: number) => {
    setUserRating(newRating);
    // In a real app, we'd send this to the API
    toast({
      title: 'Rating Submitted',
      description: `You rated this knowledge item ${newRating} stars.`,
    });
  };

  // Handle share
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied',
      description: 'Knowledge item link copied to clipboard.',
    });
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

  // Get type color
  const getTypeColor = (type: string) => {
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

  // Render star rating
  const renderStarRating = (currentRating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= currentRating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRate ? () => onRate(star) : undefined}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!knowledgeItem) {
    return (
      <Alert>
        <AlertDescription>
          Knowledge item not found or you don't have permission to view it.
        </AlertDescription>
      </Alert>
    );
  }

  const canEdit = user && user.id === knowledgeItem.authorId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          
          {canEdit && (
            <Button onClick={() => onEdit?.(knowledgeItem)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle className="text-2xl mb-2">{knowledgeItem.title}</CardTitle>
              {knowledgeItem.description && (
                <CardDescription className="text-base">
                  {knowledgeItem.description}
                </CardDescription>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={getTypeColor(knowledgeItem.type)}>
                {knowledgeItem.type.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" className={getDifficultyColor(knowledgeItem.difficulty)}>
                {knowledgeItem.difficulty}
              </Badge>
              {knowledgeItem.category && (
                <Badge variant="outline">
                  {knowledgeItem.category}
                </Badge>
              )}
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {knowledgeItem.author?.firstName?.[0]}{knowledgeItem.author?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span>By {knowledgeItem.author?.firstName} {knowledgeItem.author?.lastName}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(knowledgeItem.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{knowledgeItem.viewCount} views</span>
              </div>
              
              <div className="flex items-center gap-2">
                {renderStarRating(rating)}
                <span>{rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Tags */}
            {knowledgeItem.tags && knowledgeItem.tags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <TagIcon className="h-4 w-4" />
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {knowledgeItem.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {/* Content */}
          <div className="prose prose-sm max-w-none">
            {knowledgeItem.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph || '\u00A0'}
              </p>
            ))}
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex justify-between items-center">
          {/* User Rating */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Rate this knowledge:</span>
            {renderStarRating(userRating, true, handleRate)}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bookmark Knowledge</DialogTitle>
                  <DialogDescription>
                    Add this knowledge item to your bookmarks for quick access later.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button onClick={() => toast({ title: 'Bookmarked', description: 'Knowledge item added to bookmarks.' })}>
                    Add to Bookmarks
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Comments Section Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comments & Discussion</CardTitle>
          <CardDescription>
            Share your thoughts and ask questions about this knowledge item.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Comments feature will be implemented in the next phase. For now, you can share this knowledge item with your team.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Related Knowledge Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Related Knowledge</CardTitle>
          <CardDescription>
            Other knowledge items that might be helpful.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Related knowledge recommendations will be implemented in the next phase.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}; 