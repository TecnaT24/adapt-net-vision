import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Navbar from '@/components/Navbar';
import {
  InferenceEngine,
  generateNetworkFacts,
  knowledgeBase,
  type DiagnosisResult,
  type Fact,
  type Rule,
} from '@/lib/expertSystem';
import { alertSystem } from '@/lib/alertSystem';
import { toast } from '@/hooks/use-toast';
import {
  Brain,
  Database,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Play,
  BookOpen,
  Shield,
  TrendingUp,
} from 'lucide-react';

const ExpertSystem = () => {
  const [engine] = useState(() => new InferenceEngine());
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runDiagnosis = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const newFacts = generateNetworkFacts();
      setFacts(newFacts);
      
      engine.reset();
      engine.addFacts(newFacts);
      const result = engine.infer();
      setDiagnosis(result);

      // Check alert thresholds based on facts
      const metricsFromFacts: any = {};
      newFacts.forEach(fact => {
        if (fact.id === 'latency') metricsFromFacts.latency = fact.value;
        if (fact.id === 'cpuUsage') metricsFromFacts.cpuUsage = fact.value;
        if (fact.id === 'bandwidth') metricsFromFacts.bandwidth = fact.value;
        if (fact.id === 'packetLoss') metricsFromFacts.packetLoss = fact.value;
        if (fact.id === 'traffic') metricsFromFacts.traffic = fact.value;
      });

      const alerts = alertSystem.checkThresholds(metricsFromFacts, 'expert');
      alerts.forEach(alert => {
        toast({
          title: alert.title,
          description: alert.message,
          variant: alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' : 'default',
        });
      });

      setIsAnalyzing(false);
    }, 1000);
  };

  useEffect(() => {
    runDiagnosis();
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'medium':
        return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
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
                Expert System
              </h1>
              <p className="text-muted-foreground text-lg">
                Automated network troubleshooting and root cause analysis
              </p>
            </div>
            <Button
              onClick={runDiagnosis}
              disabled={isAnalyzing}
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Diagnosis
                </>
              )}
            </Button>
          </div>
        </div>

        {diagnosis && diagnosis.primaryDiagnosis && (
          <Alert className="mb-6 border-2">
            <div className="flex items-start gap-3">
              {getSeverityIcon(diagnosis.primaryDiagnosis.severity)}
              <div className="flex-1">
                <AlertTitle className="text-xl mb-2 flex items-center gap-2">
                  {diagnosis.primaryDiagnosis.diagnosis}
                  <Badge variant={getSeverityVariant(diagnosis.primaryDiagnosis.severity)}>
                    {diagnosis.primaryDiagnosis.severity.toUpperCase()}
                  </Badge>
                </AlertTitle>
                <AlertDescription className="text-base">
                  <strong>Root Cause:</strong> {diagnosis.primaryDiagnosis.rootCause}
                </AlertDescription>
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">
                    Confidence: {Math.round(diagnosis.matchedRules[0]?.matchConfidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </Alert>
        )}

        <Tabs defaultValue="diagnosis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="facts">Network Facts</TabsTrigger>
            <TabsTrigger value="rules">Knowledge Base</TabsTrigger>
            <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
          </TabsList>

          {/* Primary Diagnosis Tab */}
          <TabsContent value="diagnosis">
            {diagnosis?.primaryDiagnosis ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Troubleshooting Steps
                    </CardTitle>
                    <CardDescription>Follow these steps to resolve the issue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {diagnosis.primaryDiagnosis.troubleshootingSteps.map((step, index) => (
                        <li key={index} className="text-sm leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Preventive Measures
                    </CardTitle>
                    <CardDescription>Long-term solutions to prevent recurrence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {diagnosis.primaryDiagnosis.preventiveMeasures.map((measure, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{measure}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No diagnosis available. Click "Run Diagnosis" to analyze network state.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Network Facts Tab */}
          <TabsContent value="facts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Current Network Facts ({facts.length})
                </CardTitle>
                <CardDescription>Real-time network parameters used for inference</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {facts.map((fact) => (
                    <div key={fact.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{fact.description}</span>
                        <Badge variant="outline">
                          {typeof fact.value === 'number'
                            ? fact.value.toFixed(2)
                            : fact.value.toString()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Confidence:</span>
                        <Progress value={fact.confidence * 100} className="flex-1" />
                        <span className="text-muted-foreground">
                          {Math.round(fact.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Knowledge Base ({knowledgeBase.length} Rules)
                </CardTitle>
                <CardDescription>Expert rules for network troubleshooting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {knowledgeBase.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{rule.id}</Badge>
                          <span className="font-semibold">{rule.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityVariant(rule.conclusion.severity)}>
                            {rule.conclusion.severity}
                          </Badge>
                          <Badge variant="secondary">Priority: {rule.priority}</Badge>
                        </div>
                      </div>
                      <div className="text-sm space-y-2">
                        <div>
                          <span className="font-medium">Conditions:</span>
                          <ul className="ml-4 mt-1 space-y-1">
                            {rule.conditions.map((cond, idx) => (
                              <li key={idx} className="text-muted-foreground">
                                {cond.factId} {cond.operator} {cond.value.toString()}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-medium">Diagnosis:</span>
                          <p className="text-muted-foreground mt-1">
                            {rule.conclusion.diagnosis}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alternative Diagnoses Tab */}
          <TabsContent value="alternatives">
            {diagnosis && diagnosis.alternativeDiagnoses.length > 0 ? (
              <div className="space-y-4">
                {diagnosis.alternativeDiagnoses.map((altDiagnosis, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {getSeverityIcon(altDiagnosis.severity)}
                          {altDiagnosis.diagnosis}
                        </CardTitle>
                        <Badge variant={getSeverityVariant(altDiagnosis.severity)}>
                          {altDiagnosis.severity}
                        </Badge>
                      </div>
                      <CardDescription>{altDiagnosis.rootCause}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Troubleshooting Steps:</h4>
                          <ol className="space-y-1 text-sm">
                            {altDiagnosis.troubleshootingSteps.slice(0, 3).map((step, idx) => (
                              <li key={idx} className="text-muted-foreground">{step}</li>
                            ))}
                          </ol>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Confidence: {Math.round(altDiagnosis.confidence * 100)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No alternative diagnoses available.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ExpertSystem;
