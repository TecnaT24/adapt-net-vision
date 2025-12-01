import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import Navbar from '@/components/Navbar';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Unlock,
  Activity,
  Ban,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Trash2,
  Plus
} from 'lucide-react';
import { securitySystem, SecurityThreat, FirewallRule, SecurityEvent } from '@/lib/securitySystem';
import { toast } from 'sonner';

export default function SecuritySystem() {
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState(securitySystem.getStatistics());

  useEffect(() => {
    const updateData = () => {
      setThreats(securitySystem.getThreats());
      setFirewallRules(securitySystem.getFirewallRules());
      setSecurityEvents(securitySystem.getSecurityEvents(50));
      setStats(securitySystem.getStatistics());
    };

    updateData();
    const unsubscribe = securitySystem.subscribe(updateData);

    return () => unsubscribe();
  }, []);

  const handleStartMonitoring = () => {
    securitySystem.startMonitoring();
    setIsMonitoring(true);
    toast.success('Security monitoring started', {
      description: 'Real-time threat detection is now active'
    });
  };

  const handleStopMonitoring = () => {
    securitySystem.stopMonitoring();
    setIsMonitoring(false);
    toast.info('Security monitoring stopped');
  };

  const handleNeutralizeThreat = (threatId: string) => {
    const success = securitySystem.neutralizeThreat(threatId);
    if (success) {
      toast.success('Threat neutralized', {
        description: 'Firewall rule added and threat blocked'
      });
    }
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    securitySystem.updateFirewallRule(ruleId, { enabled });
    toast.info(`Firewall rule ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleDeleteRule = (ruleId: string) => {
    securitySystem.removeFirewallRule(ruleId);
    toast.success('Firewall rule removed');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'neutralized': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'blocked': return <Ban className="h-4 w-4 text-muted-foreground" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const securityScore = Math.max(0, 100 - (stats.active * 10) - (stats.bySeverity.critical * 20));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Security & Firewall</h1>
              <p className="text-muted-foreground">Advanced threat detection and network protection</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Security Score</div>
              <div className="text-2xl font-bold">{securityScore}%</div>
            </div>
            {isMonitoring ? (
              <Button onClick={handleStopMonitoring} variant="outline" size="lg">
                <Pause className="h-4 w-4 mr-2" />
                Stop Monitoring
              </Button>
            ) : (
              <Button onClick={handleStartMonitoring} size="lg">
                <Play className="h-4 w-4 mr-2" />
                Start Monitoring
              </Button>
            )}
          </div>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Active Threats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Neutralized
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{stats.neutralized}</div>
              <p className="text-xs text-muted-foreground mt-1">Threats blocked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.bySeverity.critical}</div>
              <p className="text-xs text-muted-foreground mt-1">High priority</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Firewall Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.firewallRules.enabled}</div>
              <p className="text-xs text-muted-foreground mt-1">Active rules</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="threats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="firewall">Firewall Rules</TabsTrigger>
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Threats Tab */}
          <TabsContent value="threats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detected Threats</CardTitle>
                <CardDescription>
                  Real-time monitoring of security threats and attack attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {threats.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No threats detected</p>
                      <p className="text-sm">Your network is secure</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {threats.map((threat) => (
                        <Card key={threat.id} className="border-l-4" style={{
                          borderLeftColor: threat.severity === 'critical' ? 'hsl(var(--destructive))' : 
                                          threat.severity === 'high' ? 'hsl(var(--destructive))' :
                                          threat.severity === 'medium' ? 'hsl(var(--warning))' : 
                                          'hsl(var(--muted))'
                        }}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-3">
                                {getStatusIcon(threat.status)}
                                <div>
                                  <h4 className="font-semibold">{threat.type.replace(/_/g, ' ').toUpperCase()}</h4>
                                  <p className="text-sm text-muted-foreground">{threat.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getSeverityColor(threat.severity)}>
                                  {threat.severity}
                                </Badge>
                                {threat.status === 'active' && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleNeutralizeThreat(threat.id)}
                                  >
                                    <Ban className="h-4 w-4 mr-1" />
                                    Neutralize
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Source IP:</span>
                                <span className="ml-2 font-mono">{threat.sourceIp}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Target IP:</span>
                                <span className="ml-2 font-mono">{threat.targetIp}</span>
                              </div>
                              {threat.targetPort && (
                                <div>
                                  <span className="text-muted-foreground">Target Port:</span>
                                  <span className="ml-2 font-mono">{threat.targetPort}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Confidence:</span>
                                <span className="ml-2">{(threat.confidence * 100).toFixed(1)}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Detected:</span>
                                <span className="ml-2">{threat.detectedAt.toLocaleTimeString()}</span>
                              </div>
                              {threat.neutralizedAt && (
                                <div>
                                  <span className="text-muted-foreground">Neutralized:</span>
                                  <span className="ml-2">{threat.neutralizedAt.toLocaleTimeString()}</span>
                                </div>
                              )}
                            </div>
                            
                            {threat.attackPattern && (
                              <div className="mt-4 p-3 bg-muted rounded-md">
                                <div className="text-xs text-muted-foreground mb-1">Attack Pattern:</div>
                                <code className="text-xs">{threat.attackPattern}</code>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Firewall Rules Tab */}
          <TabsContent value="firewall" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Firewall Rules</CardTitle>
                    <CardDescription>
                      Manage network access control and traffic filtering
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {firewallRules.map((rule) => (
                      <Card key={rule.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {rule.enabled ? (
                                  <Lock className="h-4 w-4 text-success" />
                                ) : (
                                  <Unlock className="h-4 w-4 text-muted-foreground" />
                                )}
                                <h4 className="font-semibold">{rule.name}</h4>
                                <Badge variant={rule.type === 'block' ? 'destructive' : 'default'}>
                                  {rule.type}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground ml-7">
                                <div>
                                  <span>Source: </span>
                                  <span className="font-mono">{rule.source}</span>
                                </div>
                                {rule.port && (
                                  <div>
                                    <span>Port: </span>
                                    <span className="font-mono">{rule.port}</span>
                                  </div>
                                )}
                                <div>
                                  <span>Protocol: </span>
                                  <span className="font-mono">{rule.protocol || 'all'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                              >
                                {rule.enabled ? 'Disable' : 'Enable'}
                              </Button>
                              {!rule.id.startsWith('rule_') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteRule(rule.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Event Log</CardTitle>
                <CardDescription>
                  Chronological record of all security-related events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {securityEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="mt-1">
                          {event.type === 'threat_detected' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                          {event.type === 'threat_blocked' && <Ban className="h-4 w-4 text-success" />}
                          {event.type === 'rule_triggered' && <Lock className="h-4 w-4 text-primary" />}
                          {event.type === 'system_alert' && <Activity className="h-4 w-4 text-warning" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{event.message}</span>
                            <Badge variant={getSeverityColor(event.severity)} className="text-xs">
                              {event.severity}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {event.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Threat Distribution by Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <Progress value={(count / stats.total) * 100} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Severity Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(stats.bySeverity).map(([severity, count]) => (
                    <div key={severity}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="capitalize">{severity}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <Progress 
                        value={(count / stats.total) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
