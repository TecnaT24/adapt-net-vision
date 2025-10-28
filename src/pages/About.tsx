import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Target, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">About the Project</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              NetOptimAI: A conceptual AI-based network optimization system designed for Adrian Kenya Limited
            </p>
          </div>

          <Card className="mb-8 bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                Adrian Kenya Limited
              </CardTitle>
              <CardDescription className="text-base mt-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Gitaru, Kenya
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base leading-relaxed">
                Adrian Kenya Limited is a forward-thinking organization based in Gitaru, Kenya, committed to leveraging cutting-edge technology 
                to enhance operational efficiency and service delivery. This network optimization system represents a strategic initiative 
                to modernize network infrastructure management through artificial intelligence and machine learning.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Target className="h-7 w-7 text-secondary" />
                Project Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Predictive Network Management",
                    description: "Implement AI-driven predictive analytics to forecast and prevent network issues before they impact operations."
                  },
                  {
                    title: "Automated Optimization",
                    description: "Deploy machine learning models that automatically optimize routing, bandwidth allocation, and load balancing in real-time."
                  },
                  {
                    title: "Enhanced Reliability",
                    description: "Achieve higher network uptime and performance through intelligent fault detection and automated response systems."
                  },
                  {
                    title: "Operational Intelligence",
                    description: "Provide network engineers with actionable insights and recommendations through intuitive dashboards and analytics."
                  },
                  {
                    title: "Scalability & Future-Readiness",
                    description: "Build a self-learning system that continuously improves and adapts to growing network demands and complexity."
                  }
                ].map((objective, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border">
                    <h3 className="font-bold text-lg mb-2 text-foreground">{objective.title}</h3>
                    <p className="text-muted-foreground">{objective.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Users className="h-7 w-7 text-accent" />
                Research & Demonstration Purpose
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base leading-relaxed">
                This system serves as a <strong>conceptual design and research prototype</strong> demonstrating how artificial intelligence 
                and machine learning technologies can be applied to network infrastructure management. It is specifically tailored for 
                educational and demonstration purposes, showcasing:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span>How AI models can analyze network performance data to identify patterns and anomalies</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span>The architecture and data flow of an intelligent network optimization system</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span>Integration strategies between AI processing, network control, and visualization layers</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span>Practical applications of predictive analytics in network infrastructure management</span>
                </li>
              </ul>
              <p className="text-base leading-relaxed">
                While this is a conceptual system, it is designed with realistic components and workflows that could be implemented 
                in production environments using technologies such as Cisco Packet Tracer, Python-based ML frameworks, SDN controllers, 
                and modern visualization platforms.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30 glow-primary">
            <CardHeader>
              <CardTitle className="text-2xl text-center">System Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { metric: "↓ 60%", label: "Downtime Reduction" },
                  { metric: "↑ 40%", label: "Network Efficiency" },
                  { metric: "↑ 85%", label: "Prediction Accuracy" }
                ].map((stat, idx) => (
                  <div key={idx} className="text-center p-4">
                    <div className="text-4xl font-bold text-primary mb-2">{stat.metric}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
