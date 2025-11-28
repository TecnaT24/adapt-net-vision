import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import Navbar from '@/components/Navbar';
import { analyzeFuzzyLogic, generateSampleNetworkData, type FuzzyInput, type FuzzyOutput } from '@/lib/fuzzyLogic';
import { Brain, Zap, RefreshCw, Activity } from 'lucide-react';

const FuzzyLogicEngine = () => {
  const [networkData, setNetworkData] = useState<FuzzyInput>(generateSampleNetworkData());
  const [analysis, setAnalysis] = useState<FuzzyOutput | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const newAnalysis = analyzeFuzzyLogic(networkData);
    setAnalysis(newAnalysis);
  }, [networkData]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setNetworkData(generateSampleNetworkData());
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleManualInput = (field: keyof FuzzyInput, value: number) => {
    setNetworkData(prev => ({ ...prev, [field]: value }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getMembershipColor = (value: number) => {
    if (value > 0.7) return 'hsl(var(--destructive))';
    if (value > 0.4) return 'hsl(var(--warning))';
    return 'hsl(var(--primary))';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Brain className="w-10 h-10 text-primary" />
                Fuzzy Logic Decision Engine
              </h1>
              <p className="text-muted-foreground text-lg">
                Interpreting ambiguous network conditions with membership functions
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <Activity className="w-4 h-4 mr-2" />
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setNetworkData(generateSampleNetworkData())}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Recommendation */}
        {analysis && (
          <Card className="mb-6 border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Overall Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{analysis.overallRecommendation}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Input Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Network Input Parameters</CardTitle>
              <CardDescription>Adjust parameters to see fuzzy logic analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Latency</label>
                  <span className="text-sm text-muted-foreground">{networkData.latency.toFixed(1)} ms</span>
                </div>
                <Slider
                  value={[networkData.latency]}
                  onValueChange={(v) => handleManualInput('latency', v[0])}
                  max={200}
                  step={1}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Traffic</label>
                  <span className="text-sm text-muted-foreground">{networkData.traffic.toFixed(1)} Mbps</span>
                </div>
                <Slider
                  value={[networkData.traffic]}
                  onValueChange={(v) => handleManualInput('traffic', v[0])}
                  max={150}
                  step={1}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">CPU Usage</label>
                  <span className="text-sm text-muted-foreground">{networkData.cpuUsage.toFixed(1)}%</span>
                </div>
                <Slider
                  value={[networkData.cpuUsage]}
                  onValueChange={(v) => handleManualInput('cpuUsage', v[0])}
                  max={100}
                  step={1}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Bandwidth Utilization</label>
                  <span className="text-sm text-muted-foreground">{networkData.bandwidth.toFixed(1)}%</span>
                </div>
                <Slider
                  value={[networkData.bandwidth]}
                  onValueChange={(v) => handleManualInput('bandwidth', v[0])}
                  max={100}
                  step={1}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Packet Loss</label>
                  <span className="text-sm text-muted-foreground">{networkData.packetLoss.toFixed(2)}%</span>
                </div>
                <Slider
                  value={[networkData.packetLoss]}
                  onValueChange={(v) => handleManualInput('packetLoss', v[0])}
                  max={10}
                  step={0.1}
                />
              </div>
            </CardContent>
          </Card>

          {/* Membership Functions Visualization */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Fuzzy Membership Degrees</CardTitle>
                <CardDescription>How input values map to linguistic terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analysis.fuzzyValues).map(([key, values]) => (
                  <div key={key}>
                    <div className="font-medium text-sm mb-2 capitalize">{key}</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-16">Low:</span>
                        <Progress value={values.low * 100} className="flex-1" />
                        <span className="text-xs w-12 text-right">{(values.low * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-16">Medium:</span>
                        <Progress value={values.medium * 100} className="flex-1" />
                        <span className="text-xs w-12 text-right">{(values.medium * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-16">High:</span>
                        <Progress value={values.high * 100} className="flex-1" />
                        <span className="text-xs w-12 text-right">{(values.high * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fuzzy Rules Applied */}
        {analysis && analysis.rules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fuzzy Rules Applied ({analysis.rules.length})</CardTitle>
              <CardDescription>Rule-based recommendations with confidence levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.rules.map((rule, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(rule.priority)}>
                          {rule.priority.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">
                          Confidence: {rule.confidence}%
                        </span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm font-semibold">Condition: </span>
                      <span className="text-sm text-muted-foreground">{rule.condition}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">Recommendation: </span>
                      <span className="text-sm">{rule.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {analysis && analysis.rules.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No fuzzy rules triggered. Network parameters are within normal ranges.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default FuzzyLogicEngine;
