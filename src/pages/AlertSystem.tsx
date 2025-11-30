import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { alertSystem, Alert, AlertThreshold } from '@/lib/alertSystem';
import { Bell, BellOff, CheckCircle, AlertCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AlertSystem = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const [stats, setStats] = useState(alertSystem.getAlertStats());

  useEffect(() => {
    setThresholds(alertSystem.getThresholds());
    const unsubscribe = alertSystem.subscribe((updatedAlerts) => {
      setAlerts(updatedAlerts);
      setStats(alertSystem.getAlertStats());
    });

    return unsubscribe;
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleAcknowledge = (id: string) => {
    alertSystem.acknowledgeAlert(id);
    toast({
      title: "Alert Acknowledged",
      description: "The alert has been marked as acknowledged.",
    });
  };

  const handleClearAll = () => {
    alertSystem.clearAlerts();
    toast({
      title: "Alerts Cleared",
      description: "All alerts have been cleared.",
    });
  };

  const handleToggleThreshold = (id: string, enabled: boolean) => {
    alertSystem.updateThreshold(id, { enabled });
    setThresholds(alertSystem.getThresholds());
    toast({
      title: enabled ? "Alert Enabled" : "Alert Disabled",
      description: `The alert threshold has been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleUpdateThreshold = (id: string, field: keyof AlertThreshold, value: any) => {
    alertSystem.updateThreshold(id, { [field]: value });
    setThresholds(alertSystem.getThresholds());
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Alert Management System
          </h1>
          <p className="text-muted-foreground">
            Configure thresholds and monitor real-time network alerts
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Unacknowledged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{stats.unacknowledged}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.bySeverity.critical}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{stats.bySeverity.high}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alert Thresholds Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alert Thresholds
              </CardTitle>
              <CardDescription>
                Configure threshold values and enable/disable alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {thresholds.map((threshold) => (
                <div key={threshold.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {threshold.enabled ? (
                        <Bell className="h-4 w-4 text-primary" />
                      ) : (
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <div className="font-medium">{threshold.name}</div>
                        <div className="text-sm text-muted-foreground">{threshold.metric}</div>
                      </div>
                    </div>
                    <Switch
                      checked={threshold.enabled}
                      onCheckedChange={(checked) => handleToggleThreshold(threshold.id, checked)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Operator</Label>
                      <Select
                        value={threshold.operator}
                        onValueChange={(value: any) => handleUpdateThreshold(threshold.id, 'operator', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="greater">Greater than</SelectItem>
                          <SelectItem value="less">Less than</SelectItem>
                          <SelectItem value="equals">Equals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">Threshold Value</Label>
                      <Input
                        type="number"
                        value={threshold.value}
                        onChange={(e) => handleUpdateThreshold(threshold.id, 'value', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Severity</Label>
                    <Select
                      value={threshold.severity}
                      onValueChange={(value: any) => handleUpdateThreshold(threshold.id, 'severity', value)}
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
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Alert History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Recent Alerts
                  </CardTitle>
                  <CardDescription>
                    View and acknowledge network alerts
                  </CardDescription>
                </div>
                {alerts.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No alerts yet. Configure thresholds and monitor your network.
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg space-y-2 ${
                        alert.acknowledged ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {getSeverityIcon(alert.severity)}
                          <div className="flex-1">
                            <div className="font-medium">{alert.title}</div>
                            <div className="text-sm text-muted-foreground">{alert.message}</div>
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">{alert.source}</Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                        {alert.acknowledged && (
                          <Badge variant="secondary">Acknowledged</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AlertSystem;
