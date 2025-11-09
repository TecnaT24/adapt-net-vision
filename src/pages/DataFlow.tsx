import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Database, Cpu, Zap, Eye, RefreshCcw } from "lucide-react";

const DataFlow = () => {
  const flowSteps = [
    {
      icon: Database,
      title: "Network Data Sources",
      description: "Multiple data collection points across Adrian Kenya Limited infrastructure",
      details: [
        "SNMP protocol data from network devices",
        "NetFlow traffic analysis records",
        "System logs and event monitoring",
        "Device telemetry and performance metrics",
      ],
      color: "from-primary to-primary-glow"
    },
    {
      icon: RefreshCcw,
      title: "Data Collection & Preprocessing",
      description: "Raw network data is collected, normalized, and prepared for analysis",
      details: [
        "Data ingestion from multiple sources",
        "Normalization and cleaning processes",
        "Feature extraction and transformation",
        "Storage in time-series databases",
      ],
      color: "from-secondary to-primary"
    },
    {
      icon: Cpu,
      title: "Machine Learning Processing",
      description: "ML models perform training and inference for predictions and anomaly detection",
      details: [
        "Traffic prediction using historical patterns",
        "Anomaly detection algorithms",
        "Network behavior forecasting",
        "Pattern recognition and classification",
      ],
      color: "from-accent to-secondary"
    },
    {
      icon: Zap,
      title: "Fuzzy Logic Interpretation",
      description: "Fuzzy rules interpret ML results and assess current network state",
      details: [
        "Fuzzy rule evaluation on predictions",
        "Linguistic variable mapping",
        "Uncertainty and ambiguity handling",
        "Network state classification",
      ],
      color: "from-warning to-accent"
    },
    {
      icon: Eye,
      title: "Expert System Decision",
      description: "Rule-based system determines automated actions and escalation procedures",
      details: [
        "If-then rule engine execution",
        "Automated action recommendations",
        "Escalation protocol triggering",
        "Policy-based decision making",
      ],
      color: "from-destructive to-warning"
    },
    {
      icon: Database,
      title: "Network Control & Policy",
      description: "Configuration changes and optimizations are applied to network devices",
      details: [
        "Traffic rerouting implementation",
        "QoS parameter adjustments",
        "Resource allocation updates",
        "Configuration deployment",
      ],
      color: "from-primary to-destructive"
    },
    {
      icon: RefreshCcw,
      title: "Monitoring & Feedback",
      description: "System measures outcomes and updates models for continuous improvement",
      details: [
        "Performance outcome measurement",
        "Effectiveness validation",
        "Model retraining with new data",
        "Rule refinement and optimization",
      ],
      color: "from-secondary to-primary"
    },
    {
      icon: Zap,
      title: "Optimized Network",
      description: "Final state: improved network performance and reliability",
      details: [
        "Reduced latency across connections",
        "Higher throughput efficiency",
        "Decreased fault occurrences",
        "Enhanced overall reliability",
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
            Complete data flow showing integration of Machine Learning, Fuzzy Logic, and Expert Systems for intelligent network optimization
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
            <CardTitle className="text-2xl">Intelligent Integration Flow</CardTitle>
            <CardDescription className="text-base">
              This system uniquely combines Machine Learning for prediction, Fuzzy Logic for uncertainty handling, and Expert Systems for automated decision-making,
              creating a robust and adaptive network optimization solution for Adrian Kenya Limited.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default DataFlow;
