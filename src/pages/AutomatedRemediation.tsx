import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Shield, Zap, PlayCircle, CheckCircle, XCircle, Clock, 
  AlertTriangle, RotateCcw, Activity, Settings, TrendingUp,
  Server, Trash2, Ban, RefreshCw, Database, Network, Cog, Ticket
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  remediationSystem, 
  RemediationAction, 
  RemediationPolicy,
  RemediationActionType 
} from '@/lib/remediationSystem';
import { toast } from 'sonner';

export default function AutomatedRemediation() {
  const [actions, setActions] = useState<RemediationAction[]>([]);
  const [policies, setPolicies] = useState<RemediationPolicy[]>([]);
  const [statistics, setStatistics] = useState(remediationSystem.getStatistics());
  const [selectedAction, setSelectedAction] = useState<RemediationAction | null>(null);

  useEffect(() => {
    const unsubscribe = remediationSystem.subscribe(() => {
      setActions(remediationSystem.getActions());
      setPolicies(remediationSystem.getPolicies());
      setStatistics(remediationSystem.getStatistics());
    });

    setActions(remediationSystem.getActions());
    setPolicies(remediationSystem.getPolicies());

    return unsubscribe;
  }, []);

  const handleExecuteAction = async (actionId: string) => {
    const success = await remediationSystem.executeAction(actionId);
    if (success) {
      toast.success('Remediation action executed successfully');
    } else {
      toast.error('Remediation action failed');
    }
  };

  const handleRollback = async (actionId: string) => {
    const success = await remediationSystem.rollbackAction(actionId);
    if (success) {
      toast.success('Action rolled back successfully');
    } else {
      toast.error('Failed to rollback action');
    }
  };

  const handleManualRemediation = (type: RemediationActionType) => {
    remediationSystem.manualExecute({
      type,
      target: { ip: '192.168.1.100' },
      description: `Manual ${type.replace('_', ' ')}`
    });
    toast.info('Manual remediation action queued');
  };

  const handleTogglePolicy = (policyId: string, enabled: boolean) => {
    remediationSystem.updatePolicy(policyId, { enabled });
    toast.success(enabled ? 'Policy enabled' : 'Policy disabled');
  };

  const getStatusIcon = (status: RemediationAction['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'executing': return <Activity className="h-4 w-4 text-primary animate-pulse" />;
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'rolled_back': return <RotateCcw className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: RemediationAction['status']) => {
    switch (status) {
      case 'success': return 'default';
      case 'failed': return 'destructive';
      case 'executing': return 'default';
      case 'pending': return 'secondary';
      case 'rolled_back': return 'outline';
    }
  };

  const getActionIcon = (type: RemediationActionType) => {
    switch (type) {
      case 'block_ip': return <Ban className="h-4 w-4" />;
      case 'restart_service': return <RefreshCw className="h-4 w-4" />;
      case 'clear_cache': return <Trash2 className="h-4 w-4" />;
      case 'adjust_bandwidth': return <Network className="h-4 w-4" />;
      case 'update_firewall': return <Shield className="h-4 w-4" />;
      case 'isolate_node': return <Server className="h-4 w-4" />;
      case 'rollback_config': return <RotateCcw className="h-4 w-4" />;
      case 'kill_process': return <XCircle className="h-4 w-4" />;
      case 'flush_dns': return <Database className="h-4 w-4" />;
      case 'reset_connection': return <Network className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Zap className="h-10 w-10 text-primary" />
              Automated Remediation
            </h1>
            <p className="text-muted-foreground mt-2">
              Intelligent automated responses to network issues and security threats
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/itsm">
                <Ticket className="h-4 w-4 mr-2" />
                ITSM Portal
              </Link>
            </Button>
            <Button 
              variant="outline"
              onClick={() => remediationSystem.clearHistory()}
            >
              Clear History
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Total Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.actions.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {statistics.actions.automatic} automatic, {statistics.actions.manual} manual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statistics.actions.total > 0 
                  ? Math.round((statistics.actions.successful / statistics.actions.total) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {statistics.actions.successful} successful actions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                Avg Execution Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.averageExecutionTime}ms</div>
              <p className="text-xs text-muted-foreground mt-1">
                {statistics.actions.executing} currently executing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Active Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.policies.enabled}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {statistics.policies.autoExecute} auto-execute
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="actions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="actions">Recent Actions</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="manual">Manual Actions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Recent Actions */}
          <TabsContent value="actions" className="space-y-4">
            {actions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No remediation actions yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {actions.map((action) => (
                  <Card key={action.id} className="hover:bg-accent/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getActionIcon(action.type)}
                          <div>
                            <CardTitle className="text-base">{action.description}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Badge variant={action.mode === 'automatic' ? 'default' : 'secondary'}>
                                {action.mode}
                              </Badge>
                              <span>•</span>
                              <span>Triggered by: {action.trigger.description}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(action.status)}
                          <Badge variant={getStatusVariant(action.status)}>
                            {action.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Executed At:</span>
                          <span className="ml-2">{action.executedAt.toLocaleTimeString()}</span>
                        </div>
                        {action.duration && (
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="ml-2">{action.duration}ms</span>
                          </div>
                        )}
                        {action.target.ip && (
                          <div>
                            <span className="text-muted-foreground">Target IP:</span>
                            <span className="ml-2 font-mono">{action.target.ip}</span>
                          </div>
                        )}
                        {action.target.service && (
                          <div>
                            <span className="text-muted-foreground">Service:</span>
                            <span className="ml-2">{action.target.service}</span>
                          </div>
                        )}
                      </div>

                      {action.metadata.changes && action.metadata.changes.length > 0 && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-2">Changes Applied:</p>
                          <ul className="text-sm space-y-1">
                            {action.metadata.changes.map((change: string, idx: number) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-success" />
                                {change}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {action.error && (
                        <div className="mt-3 p-3 bg-destructive/10 text-destructive rounded-lg">
                          <p className="text-sm"><strong>Error:</strong> {action.error}</p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        {action.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleExecuteAction(action.id)}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Execute Now
                          </Button>
                        )}
                        {action.rollbackable && action.status === 'success' && !action.rolledBack && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRollback(action.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Rollback
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Policies */}
          <TabsContent value="policies" className="space-y-4">
            {policies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {policy.name}
                        <Badge variant={policy.autoExecute ? 'default' : 'secondary'}>
                          {policy.autoExecute ? 'Auto' : 'Manual'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Action: <code className="font-mono">{policy.action}</code> • 
                        Priority: {policy.priority} • 
                        Cooldown: {policy.cooldownMinutes}min
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={policy.enabled}
                        onCheckedChange={(checked) => handleTogglePolicy(policy.id, checked)}
                      />
                      <Label htmlFor={policy.id}>
                        {policy.enabled ? 'Enabled' : 'Disabled'}
                      </Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-muted-foreground">Trigger:</span>
                      <span className="ml-2">{policy.condition.triggerType}</span>
                    </div>
                    {policy.condition.threatTypes && (
                      <div>
                        <span className="text-muted-foreground">Threat Types:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {policy.condition.threatTypes.map(type => (
                            <Badge key={type} variant="outline">{type}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {policy.requiresApproval && (
                      <div className="flex items-center gap-2 text-warning">
                        <AlertTriangle className="h-4 w-4" />
                        Requires manual approval before execution
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Manual Actions */}
          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manually trigger remediation actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleManualRemediation('block_ip')}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Block IP
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleManualRemediation('restart_service')}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart Service
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleManualRemediation('clear_cache')}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleManualRemediation('adjust_bandwidth')}
                  >
                    <Network className="h-4 w-4 mr-2" />
                    Adjust Bandwidth
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleManualRemediation('update_firewall')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Update Firewall
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleManualRemediation('flush_dns')}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Flush DNS
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Actions by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statistics.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getActionIcon(type as RemediationActionType)}
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Success vs Failed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-success">Successful</span>
                      <span className="font-bold">{statistics.actions.successful}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-destructive">Failed</span>
                      <span className="font-bold">{statistics.actions.failed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Execution Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Automatic</span>
                      <span className="font-bold">{statistics.actions.automatic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Manual</span>
                      <span className="font-bold">{statistics.actions.manual}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
