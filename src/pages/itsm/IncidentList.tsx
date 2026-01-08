import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ITSMLayout } from '@/components/itsm/ITSMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  priority: string | null;
  category: string | null;
  source: string;
  created_at: string;
  sla_due_at: string | null;
  sla_breached: boolean | null;
  assigned_to: string | null;
}

export default function IncidentList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isITSupport } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    const fetchIncidents = async () => {
      setIsLoading(true);
      
      let query = supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false }) as any;
      
      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }
      if (searchParams.get('sla') === 'breached') {
        query = query.eq('sla_breached', true);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching incidents:', error);
      } else {
        setIncidents((data || []) as Incident[]);
      }
      
      setIsLoading(false);
    };

    fetchIncidents();

    // Set up realtime subscription
    const channel = supabase
      .channel('incident-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents' },
        () => {
          fetchIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter, severityFilter, searchParams]);

  const filteredIncidents = incidents.filter(incident =>
    incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Medium</Badge>;
      case 'low': return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="destructive">Active</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
      case 'resolved': return <Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>;
      case 'closed': return <Badge variant="secondary">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ITSMLayout 
      title="Incidents"
      description="Manage and track IT incidents"
      actions={
        <Button asChild>
          <Link to="/itsm/incidents/new">
            <Plus className="h-4 w-4 mr-2" />
            New Incident
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[180px]">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Incidents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Incidents ({filteredIncidents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No incidents found</p>
                <Button asChild className="mt-4">
                  <Link to="/itsm/incidents/new">Create First Incident</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium max-w-[300px]">
                        <Link 
                          to={`/itsm/incidents/${incident.id}`}
                          className="hover:underline hover:text-primary"
                        >
                          {incident.title}
                        </Link>
                      </TableCell>
                      <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>{incident.category || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(incident.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell>
                        {incident.sla_breached ? (
                          <Badge variant="destructive">Breached</Badge>
                        ) : incident.sla_due_at ? (
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(incident.sla_due_at), 'MMM d, HH:mm')}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/itsm/incidents/${incident.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {isITSupport && (
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/itsm/incidents/${incident.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ITSMLayout>
  );
}
