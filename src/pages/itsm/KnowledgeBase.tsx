import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ITSMLayout } from '@/components/itsm/ITSMLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Search, Plus, BookOpen, Eye, ThumbsUp, Tag, AlertCircle, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  incident_types: string[];
  tags: string[];
  views: number;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

const INCIDENT_TYPES = [
  { value: 'security_threat', label: 'Security Threat' },
  { value: 'anomaly', label: 'Anomaly' },
  { value: 'predictive_fault', label: 'Predictive Fault' },
  { value: 'alert', label: 'Alert' },
  { value: 'remediation_action', label: 'Remediation Action' },
];

export default function KnowledgeBase() {
  const { isAdmin, isITSupport } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  
  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newTags, setNewTags] = useState('');
  const [selectedIncidentTypes, setSelectedIncidentTypes] = useState<string[]>([]);

  const canManageArticles = isAdmin || isITSupport;

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['knowledge-articles'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('knowledge_articles' as any)
        .select('*')
        .order('created_at', { ascending: false }) as any);
      
      if (error) throw error;
      return data as KnowledgeArticle[];
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: async (article: Partial<KnowledgeArticle>) => {
      const { error } = await (supabase
        .from('knowledge_articles' as any)
        .insert(article) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      toast.success('Article created successfully');
      resetForm();
      setIsCreateOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to create article: ${error.message}`);
    },
  });

  const incrementViewMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await (supabase
        .from('knowledge_articles' as any)
        .update({ views: (selectedArticle?.views || 0) + 1 })
        .eq('id', articleId) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
    },
  });

  const markHelpfulMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const article = articles.find(a => a.id === articleId);
      if (!article) return;
      
      const { error } = await (supabase
        .from('knowledge_articles' as any)
        .update({ helpful_count: article.helpful_count + 1 })
        .eq('id', articleId) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      toast.success('Thank you for your feedback!');
    },
  });

  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setNewSummary('');
    setNewTags('');
    setSelectedIncidentTypes([]);
  };

  const handleCreateArticle = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Title and content are required');
      return;
    }

    createArticleMutation.mutate({
      title: newTitle,
      content: newContent,
      summary: newSummary || null,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      incident_types: selectedIncidentTypes,
    });
  };

  const handleViewArticle = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    incrementViewMutation.mutate(article.id);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'all' || 
      article.incident_types.includes(selectedType);
    
    return matchesSearch && matchesType;
  });

  const getIncidentTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'security_threat': return 'destructive';
      case 'anomaly': return 'default';
      case 'predictive_fault': return 'secondary';
      case 'alert': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <ITSMLayout 
      title="Knowledge Base" 
      description="Search and browse articles for troubleshooting and best practices"
      actions={
        canManageArticles && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Knowledge Article</DialogTitle>
                <DialogDescription>
                  Add a new article to help users resolve common issues
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., How to reset network configuration"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Input
                    id="summary"
                    placeholder="Brief description of the article"
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Write the article content here..."
                    className="min-h-[200px]"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Related Incident Types</Label>
                  <div className="flex flex-wrap gap-3">
                    {INCIDENT_TYPES.map(type => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.value}
                          checked={selectedIncidentTypes.includes(type.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIncidentTypes([...selectedIncidentTypes, type.value]);
                            } else {
                              setSelectedIncidentTypes(selectedIncidentTypes.filter(t => t !== type.value));
                            }
                          }}
                        />
                        <Label htmlFor={type.value} className="text-sm font-normal">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., network, troubleshooting, reset"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateArticle} disabled={createArticleMutation.isPending}>
                  {createArticleMutation.isPending ? 'Creating...' : 'Create Article'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      }
    >
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {INCIDENT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Article View Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedArticle.title}</DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(selectedArticle.created_at), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    <Eye className="h-3 w-3" />
                    {selectedArticle.views} views
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    <ThumbsUp className="h-3 w-3" />
                    {selectedArticle.helpful_count} found helpful
                  </span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {selectedArticle.incident_types.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.incident_types.map(type => (
                      <Badge key={type} variant={getIncidentTypeBadgeVariant(type)}>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {INCIDENT_TYPES.find(t => t.value === type)?.label || type}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{selectedArticle.content}</p>
                </div>

                {selectedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {selectedArticle.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => markHelpfulMutation.mutate(selectedArticle.id)}
                  disabled={markHelpfulMutation.isPending}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Helpful
                </Button>
                <Button onClick={() => setSelectedArticle(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedType !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No knowledge articles have been created yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map(article => (
            <Card 
              key={article.id} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleViewArticle(article)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base line-clamp-2">{article.title}</CardTitle>
                {article.summary && (
                  <CardDescription className="line-clamp-2">{article.summary}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.incident_types.slice(0, 2).map(type => (
                    <Badge key={type} variant={getIncidentTypeBadgeVariant(type)} className="text-xs">
                      {INCIDENT_TYPES.find(t => t.value === type)?.label || type}
                    </Badge>
                  ))}
                  {article.incident_types.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{article.incident_types.length - 2}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {article.helpful_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ITSMLayout>
  );
}