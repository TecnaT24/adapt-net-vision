import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ITSMLayout } from '@/components/itsm/ITSMLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  ArrowRight,
  Activity,
  Timer
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  totalIncidents: number;
  activeIncidents: number;
  resolvedToday: number;
  slaBreach: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface RecentIncident {
  id: string;
  title: string;
  severity: string;
  status: string;
  created_at: string;
  priority: string | null;
}

export default function ITSMDashboard() {
  const { profile, isITSupport } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncidents: 0,
    activeIncidents: 0,
    resolvedToday: 0,
    slaBreach: 0,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0 }
  });
  const [recentIncidents, setRecentIncidents] = useState<RecentIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      // Fetch all incidents for stats
      const { data: incidents } = await supabase
        .from('incidents')
        .select('*') as { data: any[] | null };
      
      if (incidents) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const active = incidents.filter((i: any) => i.status === 'active' || i.status === 'in_progress');
        const resolvedToday = incidents.filter((i: any) => 
          i.status === 'resolved' && 
          i.resolved_at && 
          new Date(i.resolved_at) >= today
        );
        const slaBreach = incidents.filter((i: any) => i.sla_breached);
        
        const bySeverity = {
          critical: incidents.filter((i: any) => i.severity === 'critical').length,
          high: incidents.filter((i: any) => i.severity === 'high').length,
          medium: incidents.filter((i: any) => i.severity === 'medium').length,
          low: incidents.filter((i: any) => i.severity === 'low').length,
        };
        
        setStats({
          totalIncidents: incidents.length,
          activeIncidents: active.length,
          resolvedToday: resolvedToday.length,
          slaBreach: slaBreach.length,
          bySeverity
        });
      }
      
      // Fetch recent incidents
      const { data: recent } = await supabase
        .from('incidents')
        .select('id, title, severity, status, created_at, priority')
        .order('created_at', { ascending: false })
        .limit(5) as { data: RecentIncident[] | null };
      
      if (recent) {
        setRecentIncidents(recent);
      }
      
      setIsLoading(false);
    };

    fetchDashboardData();

    // Set up realtime subscription
    const channel = supabase
      .channel('dashboard-incidents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents' },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
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

  return (
    <ITSMLayout 
      title={`Welcome, ${profile?.full_name || 'User'}`}
      description="IT Service Management Dashboard"
      actions={
        <Button asChild>
          <Link to="/itsm/incidents/new">
            <Plus className="h-4 w-4 mr-2" />
            New Incident
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeIncidents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalIncidents} total incidents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.resolvedToday}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tickets closed today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
              <Timer className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.slaBreach}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.totalIncidents > 0 
                  ? Math.round(((stats.totalIncidents - stats.activeIncidents) / stats.totalIncidents) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Overall resolution rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Severity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Incidents by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getSeverityColor('critical')}`} />
                <div>
                  <p className="text-2xl font-bold">{stats.bySeverity.critical}</p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getSeverityColor('high')}`} />
                <div>
                  <p className="text-2xl font-bold">{stats.bySeverity.high}</p>
                  <p className="text-xs text-muted-foreground">High</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getSeverityColor('medium')}`} />
                <div>
                  <p className="text-2xl font-bold">{stats.bySeverity.medium}</p>
                  <p className="text-xs text-muted-foreground">Medium</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getSeverityColor('low')}`} />
                <div>
                  <p className="text-2xl font-bold">{stats.bySeverity.low}</p>
                  <p className="text-xs text-muted-foreground">Low</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Incidents</CardTitle>
              <CardDescription>Latest tickets in the system</CardDescription>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/itsm/incidents">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentIncidents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No incidents logged yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentIncidents.map((incident) => (
                  <Link 
                    key={incident.id}
                    to={`/itsm/incidents/${incident.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(incident.severity)}`} />
                      <div>
                        <p className="font-medium text-sm">{incident.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(incident.created_at), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(incident.status)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions for IT Support */}
        {isITSupport && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" asChild className="h-auto py-4">
                  <Link to="/itsm/incidents/new" className="flex flex-col items-center gap-2">
                    <Plus className="h-5 w-5" />
                    <span className="text-xs">New Incident</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4">
                  <Link to="/itsm/incidents?status=active" className="flex flex-col items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-xs">Active Tickets</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4">
                  <Link to="/itsm/incidents?sla=breached" className="flex flex-col items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="text-xs">SLA Breaches</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4">
                  <Link to="/itsm/knowledge" className="flex flex-col items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-xs">Knowledge Base</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ITSMLayout>
  );
}
