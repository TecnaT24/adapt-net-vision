import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Cpu, Network, Monitor, RefreshCw, ArrowRight } from "lucide-react";

const Architecture = () => {
  const layers = [
    {
      icon: Database,
      title: "Data Collection Layer",
      color: "primary",
      components: [
        "Network Devices (Routers, Switches, Access Points)",
        "Performance Metrics (Bandwidth, Latency, Packet Loss)",
        "SNMP Logs & IoT Sensor Data",
        "System Event Monitoring",
        "Real-time Telemetry Collection"
      ],
      description: "Foundation layer capturing comprehensive network performance data from all infrastructure components."
    },
    {
      icon: Cpu,
      title: "AI Processing Layer",
      color: "secondary",
      components: [
        "Machine Learning Engine",
        "Predictive Analytics Module",
        "Reinforcement Learning Models",
        "Decision-Tree Optimization Algorithms",
        "Pattern Recognition System"
      ],
      description: "Core intelligence layer processing data through advanced ML models to generate actionable insights."
    },
    {
      icon: Network,
      title: "Network Control Layer",
      color: "accent",
      components: [
        "Automated Response System",
        "Dynamic Routing Controller",
        "Bandwidth Allocation Manager",
        "SDN Controller Integration",
        "Load Balancing Orchestrator"
      ],
      description: "Execution layer implementing AI-driven optimization decisions across the network infrastructure."
    },
    {
      icon: Monitor,
      title: "Visualization & Monitoring Layer",
      color: "warning",
      components: [
        "Interactive Network Topology Map",
        "Real-time KPI Dashboard",
        "Predictive Alert System",
        "Performance Analytics Reports",
        "Decision Intelligence Interface"
      ],
      description: "User-facing layer providing intuitive visualization and monitoring of network status and AI recommendations."
    },
    {
      icon: RefreshCw,
      title: "Feedback & Learning Loop",
      color: "destructive",
      components: [
        "Continuous Data Feedback Pipeline",
        "Model Refinement Engine",
        "Self-Learning Mechanism",
        "Performance Validation System",
        "Accuracy Improvement Tracker"
      ],
      description: "Adaptive layer ensuring system continuously improves through feedback-driven machine learning."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">System Architecture</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive five-layer architecture demonstrating the flow from data collection through AI processing to automated network optimization
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
                { title: "Predictive Fault Detection", desc: "Reduce downtime through early issue identification" },
                { title: "Intelligent Optimization", desc: "Automated bandwidth and routing improvements" },
                { title: "Enhanced Scalability", desc: "Adaptive system growing with network demands" }
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
