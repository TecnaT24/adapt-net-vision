import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Brain,
  Server,
  Zap,
  ShieldAlert,
  CheckCircle,
  XCircle
} from "lucide-react";
import { anomalyDetector, Anomaly, NetworkMetrics } from "@/lib/anomalyDetection";
import { cn } from "@/lib/utils";

const AnomalyDashboard = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof anomalyDetector.getStatistics>>({
    total: 0,
    bySeverity: {},
    byType: {},
    byMethod: {}
  });
  const [deviceMetrics, setDeviceMetrics] = useState<Map<string, NetworkMetrics>>(new Map());

  // Simulated devices for demonstration
  const devices = [
    { id: "core-router-1", name: "Core Router 1" },
    { id: "dist-switch-1", name: "Distribution Switch 1" },
    { id: "dist-switch-2", name: "Distribution Switch 2" },
    { id: "web-server-1", name: "Web Server 1" },
    { id: "db-server-1", name: "Database Server 1" },
    { id: "access-point-1", name: "Access Point 1" }
  ];

  useEffect(() => {
    // Initialize with baseline data
    devices.forEach(device => {
      // Generate initial baseline data (20 samples)
      for (let i = 0; i < 20; i++) {
        const baselineMetrics: NetworkMetrics = {
          timestamp: Date.now() - (20 - i) * 10000,
          cpu: 40 + Math.random() * 20,
          memory: 50 + Math.random() * 20,
          latency: 10 + Math.random() * 15,
          bandwidth: 50 + Math.random() * 20,
          packetLoss: Math.random() * 0.5
        };
        anomalyDetector.addMetrics(device.id, device.name, baselineMetrics);
      }
    });

    // Real-time monitoring
    const interval = setInterval(() => {
      const newMetrics = new Map<string, NetworkMetrics>();
      const newAnomalies: Anomaly[] = [];

      devices.forEach((device, index) => {
        // Simulate realistic metrics with occasional anomalies
        const shouldGenerateAnomaly = Math.random() < 0.15; // 15% chance
        
        let metrics: NetworkMetrics;
        if (shouldGenerateAnomaly) {
          // Generate anomalous data
          const anomalyType = Math.floor(Math.random() * 4);
          metrics = {
            timestamp: Date.now(),
            cpu: anomalyType === 0 ? 85 + Math.random() * 10 : 40 + Math.random() * 20,
            memory: anomalyType === 1 ? 85 + Math.random() * 10 : 50 + Math.random() * 20,
            latency: anomalyType === 2 ? 80 + Math.random() * 50 : 10 + Math.random() * 15,
            bandwidth: anomalyType === 3 ? 85 + Math.random() * 10 : 50 + Math.random() * 20,
            packetLoss: anomalyType === 2 ? 2 + Math.random() * 3 : Math.random() * 0.5
          };
        } else {
          // Generate normal data with slight variations
          metrics = {
            timestamp: Date.now(),
            cpu: 40 + Math.random() * 25,
            memory: 50 + Math.random() * 25,
            latency: 10 + Math.random() * 20,
            bandwidth: 50 + Math.random() * 25,
            packetLoss: Math.random() * 0.8
          };
        }

        newMetrics.set(device.id, metrics);
        anomalyDetector.addMetrics(device.id, device.name, metrics);

        // Detect anomalies
        const detected = anomalyDetector.detectAnomalies(device.id, device.name, metrics);
        newAnomalies.push(...detected);
      });

      setDeviceMetrics(newMetrics);
      setAnomalies(anomalyDetector.getRecentAnomalies(undefined, 30));
      setStats(anomalyDetector.getStatistics());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-destructive';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
    }
  };

  const getSeverityBadgeVariant = (severity: Anomaly['severity']): "default" | "destructive" | "secondary" => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: Anomaly['type']) => {
    switch (type) {
      case 'traffic_spike':
        return <TrendingUp className="h-4 w-4" />;
      case 'latency_anomaly':
        return <Activity className="h-4 w-4" />;
      case 'resource_exhaustion':
        return <AlertTriangle className="h-4 w-4" />;
      case 'packet_loss':
        return <XCircle className="h-4 w-4" />;
      default:
        return <ShieldAlert className="h-4 w-4" />;
    }
  };

  const getMethodBadge = (method: Anomaly['mlMethod']) => {
    const labels = {
      'kmeans': 'K-Means Clustering',
      'statistical': 'Statistical Analysis',
      'threshold': 'Threshold Detection'
    };
    return labels[method];
  };

  const formatTimestamp = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                ML Anomaly Detection
              </h1>
            </div>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Real-time anomaly detection using Machine Learning algorithms including K-means clustering and statistical analysis
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Anomalies</div>
                    <div className="text-3xl font-bold">{stats.total}</div>
                  </div>
                  <ShieldAlert className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Critical</div>
                    <div className="text-3xl font-bold text-destructive">{stats.bySeverity['critical'] || 0}</div>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-destructive opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">High Priority</div>
                    <div className="text-3xl font-bold text-orange-500">{stats.bySeverity['high'] || 0}</div>
                  </div>
                  <Zap className="h-8 w-8 text-orange-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Active Devices</div>
                    <div className="text-3xl font-bold text-green-500">{devices.length}</div>
                  </div>
                  <Server className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="anomalies" className="space-y-6">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
              <TabsTrigger value="anomalies">Active Anomalies</TabsTrigger>
              <TabsTrigger value="devices">Device Status</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Anomalies Tab */}
            <TabsContent value="anomalies" className="space-y-4">
              {anomalies.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-xl font-semibold mb-2">No Anomalies Detected</h3>
                    <p className="text-muted-foreground">
                      All network devices are operating within normal parameters
                    </p>
                  </CardContent>
                </Card>
              ) : (
                anomalies.map((anomaly) => (
                  <Alert key={anomaly.id} className={cn(
                    "border-l-4",
                    anomaly.severity === 'critical' && "border-l-destructive",
                    anomaly.severity === 'high' && "border-l-orange-500",
                    anomaly.severity === 'medium' && "border-l-yellow-500",
                    anomaly.severity === 'low' && "border-l-blue-500"
                  )}>
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2 rounded-lg", getSeverityColor(anomaly.severity))}>
                        {getTypeIcon(anomaly.type)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <AlertTitle className="flex items-center gap-2">
                              {anomaly.deviceName}
                              <Badge variant={getSeverityBadgeVariant(anomaly.severity)}>
                                {anomaly.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="font-mono text-xs">
                                {anomaly.confidence.toFixed(0)}% confidence
                              </Badge>
                            </AlertTitle>
                            <AlertDescription className="mt-2">
                              {anomaly.description}
                            </AlertDescription>
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(anomaly.detectedAt)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                          <div>
                            <div className="text-xs text-muted-foreground">Current Value</div>
                            <div className="font-semibold">{anomaly.metrics.current.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Expected Value</div>
                            <div className="font-semibold">{anomaly.metrics.expected.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Deviation</div>
                            <div className="font-semibold text-destructive">
                              +{anomaly.metrics.deviation.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <Badge variant="outline" className="text-xs">
                          <Brain className="h-3 w-3 mr-1" />
                          {getMethodBadge(anomaly.mlMethod)}
                        </Badge>
                      </div>
                    </div>
                  </Alert>
                ))
              )}
            </TabsContent>

            {/* Devices Tab */}
            <TabsContent value="devices" className="space-y-4">
              <div className="grid gap-4">
                {devices.map((device) => {
                  const metrics = deviceMetrics.get(device.id);
                  const deviceAnomalies = anomalies.filter(a => a.deviceId === device.id);
                  
                  return (
                    <Card key={device.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Server className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{device.name}</CardTitle>
                          </div>
                          {deviceAnomalies.length > 0 ? (
                            <Badge variant="destructive">
                              {deviceAnomalies.length} {deviceAnomalies.length === 1 ? 'Anomaly' : 'Anomalies'}
                            </Badge>
                          ) : (
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Normal
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      {metrics && (
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">CPU</div>
                              <div className="font-semibold">{metrics.cpu.toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Memory</div>
                              <div className="font-semibold">{metrics.memory.toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Latency</div>
                              <div className="font-semibold">{metrics.latency.toFixed(1)}ms</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Bandwidth</div>
                              <div className="font-semibold">{metrics.bandwidth.toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Packet Loss</div>
                              <div className="font-semibold">{metrics.packetLoss?.toFixed(2)}%</div>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Anomalies by Type</CardTitle>
                    <CardDescription>Distribution of detected anomaly types</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(type as Anomaly['type'])}
                          <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detection Methods</CardTitle>
                    <CardDescription>ML algorithms used for detection</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(stats.byMethod).map(([method, count]) => (
                      <div key={method} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          <span>{getMethodBadge(method as Anomaly['mlMethod'])}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default AnomalyDashboard;
