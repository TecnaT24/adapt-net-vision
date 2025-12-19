import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { demoDataGenerator, NetworkMetrics } from "@/lib/demoDataGenerator";
import Navbar from "@/components/Navbar";
import { 
  Play, Pause, AlertTriangle, Activity, Shield, Gauge, 
  Zap, Database, RefreshCw, TrendingUp
} from "lucide-react";

const DemoControl = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);
  const [generatedCounts, setGeneratedCounts] = useState({
    security: 0,
    anomaly: 0,
    predictive: 0,
    alert: 0,
    remediation: 0,
  });

  useEffect(() => {
    const unsubscribe = demoDataGenerator.subscribeToMetrics((newMetrics) => {
      setMetrics(newMetrics);
    });
    return () => unsubscribe();
  }, []);

  const handleGenerateSingle = async (type: string) => {
    setIsLoading(type);
    try {
      let incident;
      switch (type) {
        case 'security':
          incident = await demoDataGenerator.generateSecurityThreat();
          break;
        case 'anomaly':
          incident = await demoDataGenerator.generateAnomaly();
          break;
        case 'predictive':
          incident = await demoDataGenerator.generatePredictiveFault();
          break;
        case 'alert':
          incident = await demoDataGenerator.generateAlert();
          break;
        case 'remediation':
          incident = await demoDataGenerator.generateRemediation();
          break;
      }
      
      if (incident) {
        setGeneratedCounts(prev => ({ ...prev, [type]: prev[type as keyof typeof prev] + 1 }));
        toast({
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Generated`,
          description: incident.title,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate incident",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleGenerateBatch = async () => {
    setIsLoading('batch');
    try {
      const incidents = await demoDataGenerator.generateBatchIncidents(10);
      toast({
        title: "Batch Generated",
        description: `Successfully created ${incidents.length} demo incidents`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate batch incidents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const toggleMetricGeneration = () => {
    if (isGenerating) {
      demoDataGenerator.stopMetricGeneration();
      setIsGenerating(false);
      toast({ title: "Metrics Paused", description: "Live metric generation stopped" });
    } else {
      demoDataGenerator.startMetricGeneration(2000);
      setIsGenerating(true);
      toast({ title: "Metrics Started", description: "Generating live network metrics" });
    }
  };

  const incidentTypes = [
    {
      type: 'security',
      label: 'Security Threat',
      icon: Shield,
      color: 'text-destructive',
      description: 'DDoS, port scanning, brute force attacks',
    },
    {
      type: 'anomaly',
      label: 'Anomaly',
      icon: Activity,
      color: 'text-warning',
      description: 'ML-detected unusual patterns',
    },
    {
      type: 'predictive',
      label: 'Predictive Fault',
      icon: TrendingUp,
      color: 'text-primary',
      description: 'AI-predicted future failures',
    },
    {
      type: 'alert',
      label: 'Alert',
      icon: AlertTriangle,
      color: 'text-warning',
      description: 'Threshold and rule-based alerts',
    },
    {
      type: 'remediation',
      label: 'Remediation',
      icon: Zap,
      color: 'text-success',
      description: 'Automated fix actions',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Demo Control Panel</h1>
          <p className="text-muted-foreground text-lg">
            Generate simulated incidents and network metrics for thesis defense demonstration
          </p>
        </div>

        {/* Live Metrics Display */}
        <Card className="mb-8 border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  Live Network Metrics
                </CardTitle>
                <CardDescription>
                  Real-time simulated network performance data
                </CardDescription>
              </div>
              <Button 
                onClick={toggleMetricGeneration}
                variant={isGenerating ? "destructive" : "default"}
                className="gap-2"
              >
                {isGenerating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isGenerating ? "Stop" : "Start"} Metrics
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {metrics ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Bandwidth</p>
                  <p className="text-2xl font-bold">{metrics.bandwidth.toFixed(0)} Mbps</p>
                  <Progress value={metrics.bandwidth / 11} className="h-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Latency</p>
                  <p className="text-2xl font-bold">{metrics.latency.toFixed(1)} ms</p>
                  <Progress value={metrics.latency} className="h-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">CPU Usage</p>
                  <p className="text-2xl font-bold">{metrics.cpuUsage.toFixed(0)}%</p>
                  <Progress value={metrics.cpuUsage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Active Connections</p>
                  <p className="text-2xl font-bold">{metrics.activeConnections}</p>
                  <Progress value={metrics.activeConnections / 5.5} className="h-2" />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Click "Start Metrics" to begin generating live data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Incident Generators */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {incidentTypes.map((item) => (
            <Card key={item.type} className="hover:border-primary/50 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  {item.label}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Generated:</span>
                  <Badge variant="secondary">{generatedCounts[item.type as keyof typeof generatedCounts]}</Badge>
                </div>
                <Button 
                  className="w-full gap-2"
                  onClick={() => handleGenerateSingle(item.type)}
                  disabled={isLoading !== null}
                >
                  {isLoading === item.type ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Generate {item.label}
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Batch Generator */}
          <Card className="bg-primary/5 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Batch Generator
              </CardTitle>
              <CardDescription>Generate 10 random incidents at once</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full gap-2 gradient-primary"
                onClick={handleGenerateBatch}
                disabled={isLoading !== null}
              >
                {isLoading === 'batch' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Generate Batch (10 incidents)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions for Demo</CardTitle>
            <CardDescription>
              Pre-configured scenarios for defense presentation
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              onClick={async () => {
                setIsLoading('scenario');
                for (let i = 0; i < 3; i++) {
                  await demoDataGenerator.generateSecurityThreat();
                }
                toast({ title: "Security Scenario", description: "3 security threats created" });
                setIsLoading(null);
              }}
              disabled={isLoading !== null}
            >
              Security Attack Scenario
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                setIsLoading('scenario');
                for (let i = 0; i < 3; i++) {
                  await demoDataGenerator.generateAnomaly();
                }
                await demoDataGenerator.generateRemediation();
                toast({ title: "Anomaly Scenario", description: "3 anomalies + 1 remediation created" });
                setIsLoading(null);
              }}
              disabled={isLoading !== null}
            >
              Anomaly Detection Demo
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                setIsLoading('scenario');
                for (let i = 0; i < 2; i++) {
                  await demoDataGenerator.generatePredictiveFault();
                }
                toast({ title: "Predictive Scenario", description: "2 predictive faults created" });
                setIsLoading(null);
              }}
              disabled={isLoading !== null}
            >
              Predictive Failure Demo
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                setIsLoading('scenario');
                await demoDataGenerator.generateAlert();
                await demoDataGenerator.generateAnomaly();
                await demoDataGenerator.generateRemediation();
                toast({ title: "Full Cycle", description: "Alert → Detection → Remediation flow created" });
                setIsLoading(null);
              }}
              disabled={isLoading !== null}
            >
              Full Response Cycle
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoControl;
