import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  trafficClassifier, 
  generateRandomTraffic, 
  type TrafficClassification,
  type TrafficStats 
} from '@/lib/trafficClassifier';
import { alertSystem } from '@/lib/alertSystem';
import { toast } from '@/hooks/use-toast';
import { 
  Brain, 
  Activity, 
  AlertTriangle, 
  Play, 
  Pause, 
  Trash2,
  Wifi,
  Video,
  FileDown,
  Gamepad2,
  Phone,
  Database,
  Mail,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

const TrafficClassifier = () => {
  const [classifications, setClassifications] = useState<TrafficClassification[]>([]);
  const [stats, setStats] = useState<TrafficStats>({
    total: 0,
    byCategory: {},
    anomalies: 0,
    avgConfidence: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);

  useEffect(() => {
    // Check if model is ready
    const checkInterval = setInterval(() => {
      if (trafficClassifier.isReady()) {
        setIsModelReady(true);
        clearInterval(checkInterval);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, []);

  useEffect(() => {
    if (!isMonitoring || !isModelReady) return;

    const interval = setInterval(async () => {
      // Generate random traffic pattern
      const pattern = generateRandomTraffic();
      
      // Classify the traffic
      const classification = await trafficClassifier.classifyTraffic(pattern);
      
      // Update state
      setClassifications(trafficClassifier.getClassifications(50));
      setStats(trafficClassifier.getStatistics());

      // Check if anomaly and trigger alert
      if (classification.isAnomaly) {
        const alert = {
          id: `anomaly-${Date.now()}`,
          timestamp: new Date(),
          title: 'Unusual Traffic Detected',
          message: `${classification.category} traffic shows anomalous behavior (score: ${classification.anomalyScore.toFixed(3)})`,
          severity: 'high' as const,
          source: 'anomaly' as const,
          acknowledged: false,
          metadata: classification
        };

        alertSystem['addAlert'](alert);

        toast({
          title: 'Anomalous Traffic Detected',
          description: `${classification.category} - Anomaly Score: ${classification.anomalyScore.toFixed(3)}`,
          variant: 'destructive',
        });
      }

      // Check high traffic thresholds
      if (classification.features.bytesPerSecond > 5000000) {
        toast({
          title: 'High Bandwidth Usage',
          description: `${classification.category} traffic using ${(classification.features.bytesPerSecond / 1000000).toFixed(2)} MB/s`,
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring, isModelReady]);

  const getCategoryIcon = (category: TrafficClassification['category']) => {
    switch (category) {
      case 'web': return <Wifi className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'file_transfer': return <FileDown className="h-4 w-4" />;
      case 'gaming': return <Gamepad2 className="h-4 w-4" />;
      case 'voip': return <Phone className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: TrafficClassification['category']) => {
    const colors: Record<string, string> = {
      web: 'bg-blue-500',
      video: 'bg-purple-500',
      file_transfer: 'bg-green-500',
      gaming: 'bg-red-500',
      voip: 'bg-yellow-500',
      database: 'bg-cyan-500',
      email: 'bg-orange-500',
      unknown: 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getCategoryLabel = (category: TrafficClassification['category']) => {
    const labels: Record<string, string> = {
      web: 'Web Browsing',
      video: 'Video Streaming',
      file_transfer: 'File Transfer',
      gaming: 'Online Gaming',
      voip: 'Voice/Video Call',
      database: 'Database Query',
      email: 'Email',
      unknown: 'Unknown'
    };
    return labels[category] || 'Unknown';
  };

  const handleToggleMonitoring = () => {
    if (!isModelReady) {
      toast({
        title: 'Model Not Ready',
        description: 'Please wait for the neural network model to initialize.',
        variant: 'destructive',
      });
      return;
    }
    setIsMonitoring(!isMonitoring);
  };

  const handleClear = () => {
    trafficClassifier.clearHistory();
    setClassifications([]);
    setStats({
      total: 0,
      byCategory: {},
      anomalies: 0,
      avgConfidence: 0
    });
    toast({
      title: 'History Cleared',
      description: 'All traffic classifications have been cleared.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Neural Traffic Classifier
              </h1>
              <p className="text-muted-foreground">
                Real-time network traffic categorization using TensorFlow.js
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isMonitoring ? 'destructive' : 'default'}
                onClick={handleToggleMonitoring}
                disabled={!isModelReady}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Monitoring
                  </>
                )}
              </Button>
              {classifications.length > 0 && (
                <Button variant="outline" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {!isModelReady && (
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertTitle>Initializing Neural Network</AlertTitle>
              <AlertDescription>
                Training the traffic classification model... This may take a few moments.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Classified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.anomalies}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{(stats.avgConfidence * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                {isMonitoring ? 'Active' : 'Idle'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Traffic Distribution
              </CardTitle>
              <CardDescription>
                Categorized traffic by application type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.byCategory).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No traffic data yet. Start monitoring to see classifications.
                  </div>
                ) : (
                  Object.entries(stats.byCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, count]) => {
                      const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(category as any)}
                              <span className="text-sm font-medium">
                                {getCategoryLabel(category as any)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{count}</span>
                              <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
                            </div>
                          </div>
                          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`absolute left-0 top-0 h-full transition-all ${getCategoryColor(category as any)}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Classifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Classifications
              </CardTitle>
              <CardDescription>
                Real-time traffic analysis results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {classifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No classifications yet. Start monitoring to analyze traffic.
                  </div>
                ) : (
                  classifications.map((classification, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg space-y-3 ${
                        classification.isAnomaly ? 'border-destructive bg-destructive/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${getCategoryColor(classification.category)} bg-opacity-20`}>
                            {getCategoryIcon(classification.category)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{getCategoryLabel(classification.category)}</div>
                            <div className="text-sm text-muted-foreground">
                              {(classification.features.bytesPerSecond / 1000000).toFixed(2)} MB/s • 
                              {' '}{classification.features.packetsPerSecond.toFixed(0)} pps
                            </div>
                          </div>
                        </div>
                        {classification.isAnomaly && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Anomaly
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="font-medium">{(classification.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={classification.confidence * 100} />
                      </div>

                      {classification.isAnomaly && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Anomaly Score</span>
                          <Badge variant="destructive">
                            {classification.anomalyScore.toFixed(3)}
                          </Badge>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>Port: {classification.features.destPort}</div>
                        <div>Duration: {classification.features.connectionDuration.toFixed(0)}s</div>
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

export default TrafficClassifier;
