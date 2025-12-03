import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, RefreshCw, Search, AlertTriangle, Shield, Activity, Cpu, Wrench, CheckCircle, XCircle, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { incidentService, type Incident, type IncidentFilters } from '@/lib/incidentService';

const IncidentReports: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<IncidentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState<{
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    last24Hours: number;
    last7Days: number;
  } | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    const [data, stats] = await Promise.all([
      incidentService.getIncidents(filters),
      incidentService.getStatistics(),
    ]);
    setIncidents(data);
    setStatistics(stats);
    setLoading(false);
  };

  useEffect(() => {
    fetchIncidents();
  }, [filters]);

  const handleExport = () => {
    const csv = incidentService.exportToCSV(incidents);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const handleStatusUpdate = async (id: string, status: 'acknowledged' | 'resolved' | 'false_positive') => {
    const success = await incidentService.updateIncidentStatus(id, status);
    if (success) {
      toast.success(`Incident ${status}`);
      fetchIncidents();
    } else {
      toast.error('Failed to update incident');
    }
  };

  const filteredIncidents = incidents.filter(inc => 
    searchTerm === '' || 
    inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'low': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'acknowledged': return 'bg-warning/20 text-warning border-warning/30';
      case 'resolved': return 'bg-success/20 text-success border-success/30';
      case 'false_positive': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security_threat': return <Shield className="w-4 h-4" />;
      case 'anomaly': return <Activity className="w-4 h-4" />;
      case 'predictive_fault': return <Cpu className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'remediation_action': return <Wrench className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              Incident Reports Database
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive incident tracking and reporting system
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchIncidents} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button onClick={handleExport} className="gap-2 bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{statistics?.total || 0}</div>
              <div className="text-sm text-muted-foreground">Total Incidents</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-cyan-400">{statistics?.last24Hours || 0}</div>
              <div className="text-sm text-muted-foreground">Last 24 Hours</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{statistics?.last7Days || 0}</div>
              <div className="text-sm text-muted-foreground">Last 7 Days</div>
            </CardContent>
          </Card>
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-destructive">{statistics?.bySeverity?.critical || 0}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </CardContent>
          </Card>
          <Card className="bg-success/10 border-success/30">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{statistics?.byStatus?.resolved || 0}</div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </CardContent>
          </Card>
          <Card className="bg-warning/10 border-warning/30">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">{statistics?.byStatus?.active || 0}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Filter Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? undefined : value as any })}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="security_threat">Security Threats</SelectItem>
                  <SelectItem value="anomaly">Anomalies</SelectItem>
                  <SelectItem value="predictive_fault">Predictive Faults</SelectItem>
                  <SelectItem value="alert">Alerts</SelectItem>
                  <SelectItem value="remediation_action">Remediation Actions</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.severity || 'all'}
                onValueChange={(value) => setFilters({ ...filters, severity: value === 'all' ? undefined : value as any })}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value as any })}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="false_positive">False Positive</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Incidents Table */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Incident Records ({filteredIncidents.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No incidents found. Incidents will appear here as they are logged by the monitoring systems.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidents.map((incident) => (
                      <TableRow key={incident.id} className="border-border/30 hover:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center gap-2 text-primary">
                            {getTypeIcon(incident.incident_type)}
                            <span className="text-xs capitalize">{incident.incident_type.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium text-foreground truncate">{incident.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{incident.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(incident.status)}>
                            {incident.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{incident.source}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {incident.device_name || incident.ip_address || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {incident.confidence ? `${incident.confidence.toFixed(1)}%` : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(incident.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {incident.status === 'active' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={() => handleStatusUpdate(incident.id, 'acknowledged')}
                                  title="Acknowledge"
                                >
                                  <Clock className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-success hover:text-success"
                                  onClick={() => handleStatusUpdate(incident.id, 'resolved')}
                                  title="Resolve"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-muted-foreground"
                                  onClick={() => handleStatusUpdate(incident.id, 'false_positive')}
                                  title="Mark as False Positive"
                                >
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            {incident.status === 'acknowledged' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-success hover:text-success"
                                onClick={() => handleStatusUpdate(incident.id, 'resolved')}
                                title="Resolve"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Type Distribution */}
        {statistics && Object.keys(statistics.byType).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {Object.entries(statistics.byType).map(([type, count]) => (
              <Card key={type} className="bg-card/30 border-border/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="text-primary">{getTypeIcon(type)}</div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{count}</div>
                    <div className="text-xs text-muted-foreground capitalize">{type.replace('_', ' ')}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default IncidentReports;
