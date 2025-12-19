import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { 
  Database, Brain, Cog, BarChart3, RefreshCw, ArrowRight,
  Network, Gauge, Shield, Zap, Activity, TrendingUp
} from "lucide-react";

const HowItWorks = () => {
  const systemFlow = [
    {
      step: 1,
      title: "Data Collection",
      icon: Database,
      color: "from-blue-500 to-cyan-500",
      description: "Real-time network data acquisition",
      details: [
        "SNMP polling from network devices (routers, switches, firewalls)",
        "NetFlow/sFlow traffic analysis and packet inspection",
        "Server metrics: CPU, memory, disk, network interfaces",
        "Application-layer monitoring and response times",
        "Security logs and event streams",
      ],
      output: "Raw metrics, logs, and traffic data",
    },
    {
      step: 2,
      title: "AI Analysis",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      description: "Intelligent pattern recognition and prediction",
      details: [
        "Machine Learning: Anomaly detection using Isolation Forest & Autoencoders",
        "Fuzzy Logic: Multi-variable reasoning for network state evaluation",
        "Expert System: Rule-based decision making from domain knowledge",
        "Deep Learning: Pattern recognition and trend forecasting",
        "Statistical Analysis: Baseline computation and deviation detection",
      ],
      output: "Insights, predictions, and anomaly scores",
    },
    {
      step: 3,
      title: "Decision Logic",
      icon: Cog,
      color: "from-orange-500 to-red-500",
      description: "Intelligent action determination",
      details: [
        "Severity classification based on impact analysis",
        "Priority scoring using multiple AI techniques",
        "Action selection from remediation playbook",
        "Risk assessment before automated actions",
        "Escalation rules for critical incidents",
      ],
      output: "Prioritized actions and recommendations",
    },
    {
      step: 4,
      title: "Optimization Output",
      icon: Zap,
      color: "from-green-500 to-emerald-500",
      description: "Automated response and optimization",
      details: [
        "Traffic rerouting to reduce congestion",
        "Load balancing across network paths",
        "Bandwidth allocation adjustments",
        "Security policy enforcement",
        "Resource scaling and allocation",
      ],
      output: "Network optimizations and incident resolution",
    },
    {
      step: 5,
      title: "Feedback Loop",
      icon: RefreshCw,
      color: "from-indigo-500 to-violet-500",
      description: "Continuous learning and improvement",
      details: [
        "Action effectiveness measurement",
        "Model retraining with new data",
        "Threshold auto-adjustment",
        "False positive reduction",
        "System performance optimization",
      ],
      output: "Improved accuracy and faster response",
    },
  ];

  const aiTechniques = [
    {
      name: "Isolation Forest",
      type: "Machine Learning",
      icon: Activity,
      purpose: "Detects anomalies by isolating outliers in high-dimensional data",
      application: "Network traffic anomaly detection, unusual behavior identification",
    },
    {
      name: "Fuzzy Logic",
      type: "Soft Computing",
      icon: Gauge,
      purpose: "Handles uncertainty and imprecise data using linguistic variables",
      application: "Network congestion assessment, quality of service evaluation",
    },
    {
      name: "Expert System",
      type: "Knowledge-Based AI",
      icon: Brain,
      purpose: "Applies human expert knowledge through if-then rules",
      application: "Diagnostic reasoning, remediation action selection",
    },
    {
      name: "Neural Networks",
      type: "Deep Learning",
      icon: Network,
      purpose: "Learns complex patterns for prediction and classification",
      application: "Fault prediction, traffic classification",
    },
    {
      name: "Statistical Models",
      type: "Data Science",
      icon: TrendingUp,
      purpose: "Baseline computation and threshold-based detection",
      application: "Performance monitoring, trend analysis",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How NetOptimAI Works</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive AI-driven approach to network optimization combining multiple 
            intelligent techniques for real-time monitoring, prediction, and automated response.
          </p>
        </div>

        {/* System Flow */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">System Flow</h2>
          
          <div className="space-y-6">
            {systemFlow.map((phase, index) => (
              <div key={phase.step} className="relative">
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center shrink-0`}>
                        <phase.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            Step {phase.step}
                          </Badge>
                          <CardTitle className="text-2xl">{phase.title}</CardTitle>
                        </div>
                        <CardDescription className="text-base">{phase.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-primary">Key Activities:</h4>
                        <ul className="space-y-2">
                          {phase.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <p className="text-sm text-muted-foreground mb-1">Output:</p>
                          <p className="font-medium">{phase.output}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Connector Arrow */}
                {index < systemFlow.length - 1 && (
                  <div className="flex justify-center my-2">
                    <div className="w-0.5 h-6 bg-gradient-to-b from-primary to-transparent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* AI Techniques */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">AI Techniques Used</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiTechniques.map((technique) => (
              <Card key={technique.name} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <technique.icon className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{technique.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{technique.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Purpose:</p>
                    <p className="text-sm">{technique.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Application:</p>
                    <p className="text-sm font-medium">{technique.application}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Integration Flow Diagram */}
        <section>
          <Card className="bg-card/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Integration Architecture</CardTitle>
              <CardDescription>
                How all components work together in the NetOptimAI system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center items-center gap-4 py-8">
                {[
                  { icon: Network, label: "Network Data" },
                  { icon: Database, label: "Data Lake" },
                  { icon: Brain, label: "AI Engine" },
                  { icon: Shield, label: "Security" },
                  { icon: Zap, label: "Remediation" },
                  { icon: BarChart3, label: "Visualization" },
                ].map((item, index) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <item.icon className="h-8 w-8 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {index < 5 && (
                      <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default HowItWorks;
