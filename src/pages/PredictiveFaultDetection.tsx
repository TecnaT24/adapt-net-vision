import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, Clock, Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { predictiveFaultDetector, NetworkTimeSeries, Prediction, PredictiveFault } from '@/lib/predictiveFaultDetection';
import { alertSystem } from '@/lib/alertSystem';
import { toast } from 'sonner';

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'text-red-600 dark:text-red-400';
    case 'high': return 'text-orange-600 dark:text-orange-400';
    case 'medium': return 'text-yellow-600 dark:text-yellow-400';
    default: return 'text-blue-600 dark:text-blue-400';
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'high': return 'default';
    case 'medium': return 'secondary';
    default: return 'outline';
  }
};

const PredictiveFaultDetection = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [faults, setFaults] = useState<PredictiveFault[]>([]);
  const [stats, setStats] = useState({
    totalPredictions: 0,
    detectedFaults: 0,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    averageConfidence: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedHorizon, setSelectedHorizon] = useState<number>(15);

  useEffect(() => {
    // Initialize the predictor
    predictiveFaultDetector.initialize().then(() => {
      console.log('Predictive fault detector initialized');
    });
  }, []);

  useEffect(() => {
    if (!isMonitoring) return;

    const deviceId = 'device-001';
    
    // Generate initial baseline data
    const initialData: NetworkTimeSeries[] = [];
    const now = Date.now();
    
    for (let i = 30; i >= 0; i--) {
      initialData.push({
        timestamp: now - i * 60 * 1000,
        cpu: 40 + Math.random() * 20,
        memory: 50 + Math.random() * 15,
        latency: 50 + Math.random() * 30,
        bandwidth: 500 + Math.random() * 200,
        packetLoss: Math.random() * 0.5,
        errorRate: Math.random() * 0.3
      });
    }

    // Add baseline data
    initialData.forEach(data => predictiveFaultDetector.addDataPoint(deviceId, data));

    const interval = setInterval(async () => {
      // Simulate network metrics with occasional degradation patterns
      const time = Date.now();
      const degradationChance = Math.random();
      
      let cpuTrend = 0;
      let memoryTrend = 0;
      let latencyTrend = 0;
      
      // Simulate gradual degradation
      if (degradationChance > 0.7) {
        cpuTrend = Math.random() * 30;
        memoryTrend = Math.random() * 25;
        latencyTrend = Math.random() * 150;
      }

      const newData: NetworkTimeSeries = {
        timestamp: time,
        cpu: Math.min(98, 45 + Math.random() * 15 + cpuTrend),
        memory: Math.min(98, 55 + Math.random() * 12 + memoryTrend),
        latency: Math.min(450, 60 + Math.random() * 40 + latencyTrend),
        bandwidth: Math.max(50, 550 + Math.random() * 150 - latencyTrend * 0.5),
        packetLoss: Math.min(8, Math.random() * 0.8 + latencyTrend * 0.02),
        errorRate: Math.min(4, Math.random() * 0.4 + cpuTrend * 0.02)
      };

      predictiveFaultDetector.addDataPoint(deviceId, newData);

      // Generate predictions
      const newPredictions = await predictiveFaultDetector.generatePredictions(deviceId);
      const newFaults = predictiveFaultDetector.getDetectedFaults();
      const newStats = predictiveFaultDetector.getStatistics();

      setPredictions(newPredictions);
      setFaults(newFaults);
      setStats(newStats);

      // Check for new critical faults and trigger alerts
      newFaults.forEach(fault => {
        if (fault.severity === 'critical' || fault.severity === 'high') {
          const alerts = alertSystem.checkThresholds(
            { failureProbability: fault.confidence / 100, severity: fault.severity },
            'expert'
          );

          if (alerts.length > 0) {
            toast.error(`Predicted Fault: ${fault.failureType}`, {
              description: `Expected in ${fault.minutesUntilFailure} minutes. ${fault.recommendation}`,
              duration: 8000,
            });
          }
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const filteredPredictions = predictions.filter(p => p.minutesAhead === selectedHorizon);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatMinutes = (ms: number) => {
    const minutes = Math.round(ms / 60000);
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Predictive Fault Detection
            </h1>
            <p className="text-muted-foreground">
              LSTM-based time-series forecasting for network failure prediction
            </p>
          </div>
          <Button
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant={isMonitoring ? 'destructive' : 'default'}
            className="gap-2"
          >
            {isMonitoring ? (
              <>
                <Activity className="h-4 w-4 animate-pulse" />
                Stop Monitoring
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Start Monitoring
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Total Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalPredictions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Detected Faults
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.detectedFaults}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Critical/High
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.bySeverity.critical + stats.bySeverity.high}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                Avg Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageConfidence.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faults" className="space-y-4">
          <TabsList>
            <TabsTrigger value="faults">Predicted Faults</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="predictions">Detailed Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="faults" className="space-y-4">
            {faults.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <p className="text-xl font-semibold mb-2">No Faults Predicted</p>
                  <p className="text-muted-foreground text-center max-w-md">
                    The system is operating normally. No potential failures detected in the next 30 minutes.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {faults.map((fault) => (
                  <Card key={fault.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getSeverityBadge(fault.severity) as any}>
                              {fault.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {fault.minutesUntilFailure}m until failure
                            </Badge>
                          </div>
                          <CardTitle className={getSeverityColor(fault.severity)}>
                            {fault.failureType}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Detected at {formatTime(fault.detectedAt)} • Expected at {formatTime(fault.predictedFailureTime)}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{fault.confidence.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">Confidence</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Affected Metrics:</p>
                        <div className="flex flex-wrap gap-2">
                          {fault.affectedMetrics.map((metric) => (
                            <Badge key={metric} variant="secondary">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Recommendation:
                        </p>
                        <p className="text-sm text-muted-foreground">{fault.recommendation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Predicted Failures Timeline</CardTitle>
                <CardDescription>Chronological view of potential network failures</CardDescription>
              </CardHeader>
              <CardContent>
                {faults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No predicted failures to display
                  </div>
                ) : (
                  <div className="space-y-4">
                    {faults.map((fault, idx) => (
                      <div key={fault.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            fault.severity === 'critical' ? 'bg-red-500' :
                            fault.severity === 'high' ? 'bg-orange-500' :
                            fault.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          {idx < faults.length - 1 && (
                            <div className="w-0.5 h-16 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{formatTime(fault.predictedFailureTime)}</span>
                            <Badge variant="outline" className="text-xs">
                              T-{fault.minutesUntilFailure}m
                            </Badge>
                          </div>
                          <p className="font-medium">{fault.failureType}</p>
                          <p className="text-sm text-muted-foreground mt-1">{fault.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Detailed Predictions</CardTitle>
                    <CardDescription>Metric forecasts with confidence intervals</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {[15, 20, 25, 30].map((horizon) => (
                      <Button
                        key={horizon}
                        variant={selectedHorizon === horizon ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedHorizon(horizon)}
                      >
                        {horizon}m
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPredictions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No predictions available for this time horizon
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPredictions.slice(0, 5).map((pred) => (
                      <div key={pred.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getSeverityBadge(pred.severity) as any}>
                                {pred.severity}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatTime(pred.predictedTime)}
                              </span>
                            </div>
                            <p className="text-sm">{pred.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{(pred.failureProbability * 100).toFixed(0)}%</div>
                            <div className="text-xs text-muted-foreground">Failure Risk</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">CPU:</span>
                            <span className="ml-2 font-medium">{pred.metrics.cpu.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Memory:</span>
                            <span className="ml-2 font-medium">{pred.metrics.memory.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Latency:</span>
                            <span className="ml-2 font-medium">{pred.metrics.latency.toFixed(0)}ms</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Bandwidth:</span>
                            <span className="ml-2 font-medium">{pred.metrics.bandwidth.toFixed(0)} Mbps</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Packet Loss:</span>
                            <span className="ml-2 font-medium">{pred.metrics.packetLoss.toFixed(2)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Error Rate:</span>
                            <span className="ml-2 font-medium">{pred.metrics.errorRate.toFixed(2)}%</span>
                          </div>
                        </div>

                        <div className="bg-muted/50 rounded p-2 text-xs">
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="ml-2">{pred.confidence.lower.toFixed(0)}% - {pred.confidence.upper.toFixed(0)}%</span>
                          <span className="text-muted-foreground ml-3">(Mean: {pred.confidence.mean.toFixed(0)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PredictiveFaultDetection;
