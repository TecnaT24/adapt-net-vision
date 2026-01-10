import { useState, useEffect } from 'react';
import { ITSMLayout } from '@/components/itsm/ITSMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ChangeRequest {
  id: string;
  change_number: string;
  title: string;
  description: string;
  type: 'standard' | 'normal' | 'emergency';
  status: 'draft' | 'submitted' | 'approved' | 'scheduled' | 'implementing' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  risk_level: 'low' | 'medium' | 'high';
  requested_by: string;
  assigned_to: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  created_at: string;
  updated_at: string;
  impact: string;
  rollback_plan: string;
}

// Demo data for changes
const demoChanges: ChangeRequest[] = [
  {
    id: '1',
    change_number: 'CHG0001234',
    title: 'Network Switch Firmware Upgrade - DC1',
    description: 'Upgrade firmware on core switches in Data Center 1 to address security vulnerabilities',
    type: 'normal',
    status: 'approved',
    priority: 'high',
    risk_level: 'medium',
    requested_by: 'John Smith',
    assigned_to: 'Network Team',
    scheduled_start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    impact: 'Brief network interruption for connected devices during maintenance window',
    rollback_plan: 'Restore previous firmware version from backup'
  },
  {
    id: '2',
    change_number: 'CHG0001235',
    title: 'Emergency Patch - Critical Security Vulnerability',
    description: 'Deploy emergency security patch for CVE-2024-XXXX affecting production servers',
    type: 'emergency',
    status: 'implementing',
    priority: 'critical',
    risk_level: 'high',
    requested_by: 'Security Team',
    assigned_to: 'Server Team',
    scheduled_start: new Date().toISOString(),
    scheduled_end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    impact: 'Potential service restart required for affected applications',
    rollback_plan: 'Restore from snapshot taken before patch application'
  },
  {
    id: '3',
    change_number: 'CHG0001230',
    title: 'Standard Change - SSL Certificate Renewal',
    description: 'Renew SSL certificates for *.company.com domains',
    type: 'standard',
    status: 'completed',
    priority: 'medium',
    risk_level: 'low',
    requested_by: 'Web Team',
    assigned_to: 'Infrastructure Team',
    scheduled_start: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    impact: 'No service interruption expected',
    rollback_plan: 'Restore previous certificates from certificate store'
  },
  {
    id: '4',
    change_number: 'CHG0001236',
    title: 'Database Migration - Customer Portal',
    description: 'Migrate customer portal database to new cluster with improved performance',
    type: 'normal',
    status: 'scheduled',
    priority: 'high',
    risk_level: 'high',
    requested_by: 'Database Team',
    assigned_to: 'DBA Team',
    scheduled_start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    impact: 'Customer portal will be in read-only mode during migration',
    rollback_plan: 'Failback to original database cluster'
  },
  {
    id: '5',
    change_number: 'CHG0001237',
    title: 'Firewall Rule Update - New VPN Endpoints',
    description: 'Add firewall rules for new VPN endpoints in APAC region',
    type: 'standard',
    status: 'submitted',
    priority: 'medium',
    risk_level: 'low',
    requested_by: 'Network Security',
    assigned_to: null,
    scheduled_start: null,
    scheduled_end: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    impact: 'No service interruption',
    rollback_plan: 'Remove added firewall rules'
  },
  {
    id: '6',
    change_number: 'CHG0001225',
    title: 'Server Decommission - Legacy Mail Server',
    description: 'Decommission legacy mail server after migration to cloud email',
    type: 'normal',
    status: 'failed',
    priority: 'low',
    risk_level: 'medium',
    requested_by: 'IT Operations',
    assigned_to: 'Server Team',
    scheduled_start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    impact: 'None - server already migrated',
    rollback_plan: 'Power on server and restore DNS records'
  }
];

export default function Changes() {
  const { isAdmin, isITSupport } = useAuth();
  const [changes, setChanges] = useState<ChangeRequest[]>(demoChanges);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newChange, setNewChange] = useState<{
    title: string;
    description: string;
    type: 'standard' | 'normal' | 'emergency';
    priority: 'low' | 'medium' | 'high' | 'critical';
    risk_level: 'low' | 'medium' | 'high';
    impact: string;
    rollback_plan: string;
  }>({
    title: '',
    description: '',
    type: 'normal',
    priority: 'medium',
    risk_level: 'medium',
    impact: '',
    rollback_plan: ''
  });

  const filteredChanges = changes.filter(change => {
    const matchesSearch = change.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      change.change_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      change.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || change.status === statusFilter;
    const matchesType = typeFilter === 'all' || change.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'implementing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'scheduled': case 'approved': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-muted-foreground" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      submitted: 'secondary',
      approved: 'default',
      scheduled: 'default',
      implementing: 'default',
      completed: 'secondary',
      failed: 'destructive',
      cancelled: 'outline'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      standard: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      emergency: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return <Badge className={colors[type]}>{type}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return <Badge className={colors[priority]}>{priority}</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return <Badge className={colors[risk]}>{risk} risk</Badge>;
  };

  const handleCreateChange = () => {
    if (!newChange.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const changeNumber = `CHG${String(Date.now()).slice(-7)}`;
    const change: ChangeRequest = {
      id: crypto.randomUUID(),
      change_number: changeNumber,
      ...newChange,
      status: 'draft',
      requested_by: 'Current User',
      assigned_to: null,
      scheduled_start: null,
      scheduled_end: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setChanges([change, ...changes]);
    setIsDialogOpen(false);
    setNewChange({
      title: '',
      description: '',
      type: 'normal',
      priority: 'medium',
      risk_level: 'medium',
      impact: '',
      rollback_plan: ''
    });
    toast.success(`Change request ${changeNumber} created`);
  };

  const stats = {
    total: changes.length,
    pending: changes.filter(c => ['draft', 'submitted'].includes(c.status)).length,
    approved: changes.filter(c => ['approved', 'scheduled'].includes(c.status)).length,
    inProgress: changes.filter(c => c.status === 'implementing').length,
    completed: changes.filter(c => c.status === 'completed').length,
    failed: changes.filter(c => c.status === 'failed').length
  };

  return (
    <ITSMLayout 
      title="Change Management" 
      description="Manage and track change requests"
      actions={
        (isAdmin || isITSupport) && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Change
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Change Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the change"
                    value={newChange.title}
                    onChange={(e) => setNewChange({ ...newChange, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the change and its purpose"
                    value={newChange.description}
                    onChange={(e) => setNewChange({ ...newChange, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select 
                      value={newChange.type} 
                      onValueChange={(v: 'standard' | 'normal' | 'emergency') => setNewChange({ ...newChange, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select 
                      value={newChange.priority} 
                      onValueChange={(v: 'low' | 'medium' | 'high' | 'critical') => setNewChange({ ...newChange, priority: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Risk Level</Label>
                    <Select 
                      value={newChange.risk_level} 
                      onValueChange={(v: 'low' | 'medium' | 'high') => setNewChange({ ...newChange, risk_level: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impact">Impact Assessment</Label>
                  <Textarea
                    id="impact"
                    placeholder="Describe the expected impact of this change"
                    value={newChange.impact}
                    onChange={(e) => setNewChange({ ...newChange, impact: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollback">Rollback Plan</Label>
                  <Textarea
                    id="rollback"
                    placeholder="Steps to rollback if the change fails"
                    value={newChange.rollback_plan}
                    onChange={(e) => setNewChange({ ...newChange, rollback_plan: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateChange}>
                    Create Change Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )
      }
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Changes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search changes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="implementing">Implementing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Changes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Change Requests ({filteredChanges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Change #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Assigned To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChanges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No change requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredChanges.map((change) => (
                  <TableRow key={change.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{change.change_number}</TableCell>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <p className="font-medium truncate">{change.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{change.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(change.type)}</TableCell>
                    <TableCell>{getPriorityBadge(change.priority)}</TableCell>
                    <TableCell>{getRiskBadge(change.risk_level)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(change.status)}
                        {getStatusBadge(change.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {change.scheduled_start ? (
                        <span className="text-sm">
                          {format(new Date(change.scheduled_start), 'MMM d, yyyy HH:mm')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {change.assigned_to || <span className="text-muted-foreground">Unassigned</span>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ITSMLayout>
  );
}
