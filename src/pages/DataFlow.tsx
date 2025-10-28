import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Database, Cpu, Zap, Eye, RefreshCcw } from "lucide-react";

const DataFlow = () => {
  const flowSteps = [
    {
      icon: Database,
      title: "Data Ingestion",
      description: "Network devices continuously generate and transmit performance metrics",
      details: [
        "SNMP polling from routers and switches",
        "Real-time bandwidth and latency measurements",
        "IoT sensor readings from infrastructure",
        "System logs and event data collection",
      ],
      color: "from-primary to-primary-glow"
    },
    {
      icon: Cpu,
      title: "AI Analysis",
      description: "Machine learning models process and analyze incoming data streams",
      details: [
        "Pattern recognition across historical data",
        "Anomaly detection algorithms",
        "Predictive modeling for future states",
        "Optimization algorithm execution",
      ],
      color: "from-secondary to-primary"
    },
    {
      icon: Zap,
      title: "Decision Making",
      description: "AI generates optimization recommendations and control commands",
      details: [
        "Route optimization calculations",
        "Load balancing strategies",
        "Bandwidth reallocation plans",
        "Failure mitigation actions",
      ],
      color: "from-accent to-success"
    },
    {
      icon: Eye,
      title: "Visualization",
      description: "Results displayed on interactive dashboards for monitoring",
      details: [
        "Real-time topology updates",
        "KPI metric visualization",
        "Alert notifications",
        "Performance trend analysis",
      ],
      color: "from-warning to-destructive"
    },
    {
      icon: RefreshCcw,
      title: "Feedback Loop",
      description: "System outcomes feed back to refine AI models and improve accuracy",
      details: [
        "Performance validation",
        "Model retraining with new data",
        "Accuracy improvement tracking",
        "Continuous learning cycle",
      ],
      color: "from-primary to-accent"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Data Flow Diagram</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive visualization of how data moves through the AI-based network optimization system, from collection to continuous improvement
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {flowSteps.map((step, index) => (
            <div key={index} className="mb-8 last:mb-0">
              <Card className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-smooth group">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center glow-primary group-hover:scale-110 transition-smooth`}>
                      <step.icon className="h-8 w-8 text-background" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl">{step.title}</CardTitle>
                        <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-bold text-primary">
                          Step {index + 1}
                        </div>
                      </div>
                      <CardDescription className="text-base">{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3 pl-20">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 animate-pulse" />
                        <span className="text-sm text-muted-foreground">{detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {index < flowSteps.length - 1 && (
                <div className="flex justify-center my-6">
                  <div className="flex flex-col items-center gap-2">
                    <ArrowRight className="h-8 w-8 text-primary rotate-90 animate-pulse" />
                    <div className="h-8 w-0.5 bg-gradient-to-b from-primary to-transparent" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <Card className="mt-12 bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30 glow-primary max-w-5xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Continuous Improvement Cycle</CardTitle>
            <CardDescription className="text-base">
              The system operates in a perpetual feedback loop, where each network event contributes to refining AI models, 
              improving prediction accuracy, and enhancing optimization strategies over time.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default DataFlow;
