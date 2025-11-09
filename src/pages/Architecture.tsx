import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Cpu, Network, Monitor, RefreshCw, ArrowRight } from "lucide-react";

const Architecture = () => {
  const layers = [
    {
      icon: Database,
      title: "Data Collection & Preprocessing Layer",
      color: "primary",
      components: [
        "SNMP Protocol Integration",
        "NetFlow Data Capture",
        "Device Telemetry & Logs",
        "Real-time Data Normalization",
        "Historical Data Storage"
      ],
      description: "Captures raw network data from multiple sources including SNMP, NetFlow, system logs, and device telemetry at Adrian Kenya Limited."
    },
    {
      icon: Cpu,
      title: "Machine Learning Layer",
      color: "secondary",
      components: [
        "Traffic Prediction Models",
        "Anomaly Detection Algorithms",
        "Pattern Recognition Engine",
        "Neural Network Training",
        "Inference & Forecasting System"
      ],
      description: "Applies ML algorithms to predict traffic patterns, detect anomalies, and forecast network behavior using historical and real-time data."
    },
    {
      icon: Network,
      title: "Fuzzy Logic Layer",
      color: "accent",
      components: [
        "Fuzzy Rule Interpretation",
        "ML Result Processing",
        "Network State Fuzification",
        "Linguistic Variable Mapping",
        "Uncertainty Handling System"
      ],
      description: "Interprets ML predictions using fuzzy logic rules to handle uncertainty and translate numerical outputs into actionable network states."
    },
    {
      icon: Monitor,
      title: "Expert System Layer",
      color: "warning",
      components: [
        "If-Then Rule Engine",
        "Automated Decision Making",
        "Escalation Protocols",
        "Configuration Recommendations",
        "Action Priority Management"
      ],
      description: "Applies expert knowledge through rule-based system to determine optimal actions, trigger automated responses, and manage escalation procedures."
    },
    {
      icon: RefreshCw,
      title: "Network Control & Feedback Loop",
      color: "destructive",
      components: [
        "Policy Application System",
        "Traffic Rerouting Controller",
        "QoS Configuration Manager",
        "Performance Monitoring",
        "Model Refinement Pipeline"
      ],
      description: "Executes optimization decisions by applying configuration changes, measures outcomes, and feeds results back to improve ML models and rules."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">System Architecture</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Five-layer architecture integrating Machine Learning, Fuzzy Logic, and Expert Systems for intelligent network optimization at Adrian Kenya Limited
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {layers.map((layer, index) => (
            <div key={index} className="relative">
              <Card className={`bg-card/50 backdrop-blur border-border hover:border-${layer.color}/50 transition-smooth group`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl gradient-${layer.color === 'primary' ? 'primary' : layer.color === 'secondary' ? 'primary' : layer.color === 'accent' ? 'success' : layer.color === 'warning' ? 'warning' : 'danger'} flex items-center justify-center glow-primary group-hover:scale-110 transition-smooth`}>
                      <layer.icon className="h-7 w-7 text-background" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl">{layer.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">Layer {index + 1}</Badge>
                      </div>
                      <CardDescription className="text-base">{layer.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {layer.components.map((component, compIndex) => (
                      <div key={compIndex} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-smooth">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-sm font-medium">{component}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {index < layers.length - 1 && (
                <div className="flex justify-center my-4">
                  <ArrowRight className="h-8 w-8 text-primary rotate-90 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        <Card className="mt-12 bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30 max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Key Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "ML-Powered Prediction", desc: "Advanced forecasting of traffic patterns and anomalies" },
                { title: "Fuzzy Logic Reasoning", desc: "Handles uncertainty in network state interpretation" },
                { title: "Expert System Automation", desc: "Rule-based automated responses and escalation" }
              ].map((benefit, idx) => (
                <div key={idx} className="text-center p-4">
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Architecture;
