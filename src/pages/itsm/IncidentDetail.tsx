import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ITSMLayout } from '@/components/itsm/ITSMLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  AlertCircle, 
  ArrowLeft, 
  Clock, 
  User, 
  MessageSquare, 
  Send,
  Loader2,
  Edit,
  CheckCircle,
  Timer,
  Trash2,
  X,
  Check
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  priority: string | null;
  category: string | null;
  subcategory: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  sla_due_at: string | null;
  sla_breached: boolean | null;
  escalation_level: number | null;
  resolution_notes: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  reported_by: string | null;
  assigned_to: string | null;
  device_name: string | null;
  ip_address: string | null;
  details: Record<string, unknown>;
}

interface Comment {
  id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  user_id: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
}

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isITSupport, isAdmin } = useAuth();
  
  const [incident, setIncident] = useState<Incident | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [itStaff, setItStaff] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  useEffect(() => {
    const fetchIncident = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      // Fetch incident
      const { data: incidentData, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', id)
        .maybeSingle() as { data: any; error: any };
      
      if (error || !incidentData) {
        toast.error('Incident not found');
        navigate('/itsm/incidents');
        return;
      }
      
      setIncident(incidentData as Incident);
      
      // Fetch comments with user profiles
      const { data: commentsData } = await supabase
        .from('incident_comments' as any)
        .select('*')
        .eq('incident_id', id)
        .order('created_at', { ascending: true }) as { data: any[] | null };
      
      if (commentsData) {
        setComments(commentsData as Comment[]);
      }
      
      // Fetch IT staff for assignment dropdown
      if (isITSupport) {
        const { data: staffData } = await supabase
          .from('profiles' as any)
          .select('id, user_id, full_name') as { data: any[] | null };
        
        if (staffData) {
          setItStaff(staffData as Profile[]);
        }
      }
      
      setIsLoading(false);
    };

    fetchIncident();

    // Set up realtime subscription for comments
    const channel = supabase
      .channel(`incident-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incident_comments', filter: `incident_id=eq.${id}` },
        () => {
          fetchIncident();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'incidents', filter: `id=eq.${id}` },
        () => {
          fetchIncident();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, navigate, isITSupport]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !id) return;
    
    setIsSubmittingComment(true);
    
    const { error } = await supabase
      .from('incident_comments' as any)
      .insert({
        incident_id: id,
        user_id: user.id,
        comment: newComment.trim(),
        is_internal: isInternal,
      } as any);
    
    setIsSubmittingComment(false);
    
    if (error) {
      toast.error('Failed to add comment');
    } else {
      setNewComment('');
      toast.success('Comment added');
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.comment);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveEdit = async () => {
    if (!editingCommentId || !editingCommentText.trim()) return;
    
    const { error } = await supabase
      .from('incident_comments' as any)
      .update({ comment: editingCommentText.trim() } as any)
      .eq('id', editingCommentId);
    
    if (error) {
      toast.error('Failed to update comment');
    } else {
      setComments(comments.map(c => 
        c.id === editingCommentId ? { ...c, comment: editingCommentText.trim() } : c
      ));
      setEditingCommentId(null);
      setEditingCommentText('');
      toast.success('Comment updated');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('incident_comments' as any)
      .delete()
      .eq('id', commentId);
    
    if (error) {
      toast.error('Failed to delete comment');
    } else {
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!incident || !id) return;
    
    setIsUpdating(true);
    
    const updates: any = { status: newStatus };
    
    if (newStatus === 'resolved' && !incident.resolved_at) {
      updates.resolved_at = new Date().toISOString();
    }
    if (newStatus === 'in_progress' && !incident.acknowledged_at) {
      updates.acknowledged_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('incidents')
      .update(updates as any)
      .eq('id', id);
    
    setIsUpdating(false);
    
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Status updated to ${newStatus}`);
      setIncident({ ...incident, ...updates } as Incident);
    }
  };

  const handleAssignmentChange = async (assigneeId: string) => {
    if (!incident || !id) return;
    
    setIsUpdating(true);
    
    const { error } = await supabase
      .from('incidents')
      .update({ assigned_to: assigneeId === 'unassigned' ? null : assigneeId } as any)
      .eq('id', id);
    
    setIsUpdating(false);
    
    if (error) {
      toast.error('Failed to update assignment');
    } else {
      toast.success('Assignment updated');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-500">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-500 text-black">Medium</Badge>;
      case 'low': return <Badge className="bg-green-500">Low</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="destructive">Active</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'resolved': return <Badge className="bg-green-500">Resolved</Badge>;
      case 'closed': return <Badge variant="secondary">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <ITSMLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ITSMLayout>
    );
  }

  if (!incident) {
    return null;
  }

  return (
    <ITSMLayout 
      title={`Incident #${incident.id.slice(0, 8)}`}
      description={incident.title}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {isITSupport && (
            <Button variant="outline" asChild>
              <Link to={`/itsm/incidents/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{incident.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4" />
                    Created {format(new Date(incident.created_at), 'PPpp')}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {getSeverityBadge(incident.severity)}
                  {getStatusBadge(incident.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{incident.description}</p>
              </div>
              
              {incident.resolution_notes && (
                <div className="bg-green-500/10 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Resolution Notes
                  </h3>
                  <p className="text-muted-foreground">{incident.resolution_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Activity & Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No comments yet</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className={`flex gap-3 ${comment.is_internal ? 'bg-muted/50 p-3 rounded-lg' : 'p-3'}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {comment.profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {comment.profile?.full_name || 'Unknown User'}
                            </span>
                            {comment.is_internal && (
                              <Badge variant="outline" className="text-xs">Internal</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.created_at), 'MMM d, HH:mm')}
                            </span>
                          </div>
                          {(user?.id === comment.user_id || isITSupport || isAdmin) && editingCommentId !== comment.id && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEditComment(comment)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {editingCommentId === comment.id ? (
                          <div className="mt-2 space-y-2">
                            <Textarea
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              rows={2}
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                <X className="h-3.5 w-3.5 mr-1" />
                                Cancel
                              </Button>
                              <Button size="sm" onClick={handleSaveEdit} disabled={!editingCommentText.trim()}>
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm mt-1">{comment.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Separator />
              
              {/* Add Comment */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  {isITSupport && (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded border-input"
                      />
                      Internal note (only visible to IT staff)
                    </label>
                  )}
                  <Button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim() || isSubmittingComment}
                    size="sm"
                  >
                    {isSubmittingComment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {isITSupport && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={incident.status} 
                    onValueChange={handleStatusChange}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assigned To</label>
                  <Select 
                    value={incident.assigned_to || 'unassigned'} 
                    onValueChange={handleAssignmentChange}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {itStaff.map((staff) => (
                        <SelectItem key={staff.user_id} value={staff.user_id}>
                          {staff.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span>{incident.category || '-'}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <span className="capitalize">{incident.priority || '-'}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <span>{incident.source}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">SLA Due</span>
                <div className="flex items-center gap-2">
                  {incident.sla_breached && (
                    <Badge variant="destructive" className="text-xs">Breached</Badge>
                  )}
                  <span>
                    {incident.sla_due_at 
                      ? format(new Date(incident.sla_due_at), 'MMM d, HH:mm')
                      : '-'
                    }
                  </span>
                </div>
              </div>
              {incident.device_name && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Device</span>
                    <span>{incident.device_name}</span>
                  </div>
                </>
              )}
              {incident.ip_address && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IP Address</span>
                    <span className="font-mono">{incident.ip_address}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          {(incident.contact_email || incident.contact_phone) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {incident.contact_email && (
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <a href={`mailto:${incident.contact_email}`} className="text-primary hover:underline">
                      {incident.contact_email}
                    </a>
                  </div>
                )}
                {incident.contact_phone && (
                  <div>
                    <span className="text-muted-foreground">Phone: </span>
                    <a href={`tel:${incident.contact_phone}`} className="text-primary hover:underline">
                      {incident.contact_phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="font-medium">Created</p>
                  <p className="text-muted-foreground">
                    {format(new Date(incident.created_at), 'PPp')}
                  </p>
                </div>
              </div>
              {incident.acknowledged_at && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">Acknowledged</p>
                    <p className="text-muted-foreground">
                      {format(new Date(incident.acknowledged_at), 'PPp')}
                    </p>
                  </div>
                </div>
              )}
              {incident.resolved_at && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">Resolved</p>
                    <p className="text-muted-foreground">
                      {format(new Date(incident.resolved_at), 'PPp')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ITSMLayout>
  );
}
