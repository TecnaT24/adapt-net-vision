import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { 
  Target, CheckCircle2, ArrowRight, Brain, Network, 
  BarChart3, Shield, Zap, Activity, Gauge, ExternalLink
} from "lucide-react";

const ResearchObjectives = () => {
  const objectives = [
    {
      id: 1,
      title: "Manual Optimization Challenges",
      description: "Establish baseline understanding of current network management limitations",
      systemFeature: "Baseline Dashboard",
      systemLink: "/dashboard",
      icon: BarChart3,
      achievements: [
        "Real-time performance monitoring dashboard",
        "Historical data visualization and trends",
        "Current vs. optimal performance comparison",
        "Manual intervention tracking",
      ],
      status: "implemented",
    },
    {
      id: 2,
      title: "AI Techniques Integration",
      description: "Implement and combine multiple AI approaches for network optimization",
      systemFeature: "ML + Fuzzy Logic + Expert Rules",
      systemLink: "/anomaly",
      icon: Brain,
      achievements: [
        "Machine Learning anomaly detection (Isolation Forest)",
        "Fuzzy Logic engine for imprecise data handling",
        "Expert System with rule-based decision making",
        "Deep Learning for predictive fault detection",
      ],
      relatedLinks: [
        { path: "/fuzzy", label: "Fuzzy Logic Engine" },
        { path: "/expert", label: "Expert System" },
        { path: "/predictive", label: "Predictive Faults" },
      ],
      status: "implemented",
    },
    {
      id: 3,
      title: "Conceptual System Design",
      description: "Design a modular, scalable architecture for the optimization system",
      systemFeature: "Modular Architecture",
      systemLink: "/architecture",
      icon: Network,
      achievements: [
        "Layered architecture design (Data, AI, Control, Visualization)",
        "Modular component separation",
        "Real-time data flow implementation",
        "Integration with existing infrastructure",
      ],
      relatedLinks: [
        { path: "/dataflow", label: "Data Flow" },
        { path: "/framework", label: "Conceptual Framework" },
      ],
      status: "implemented",
    },
    {
      id: 4,
      title: "Automated Response System",
      description: "Develop automated remediation capabilities for common network issues",
      systemFeature: "Auto-Remediation Engine",
      systemLink: "/remediation",
      icon: Zap,
      achievements: [
        "Automated traffic rerouting",
        "Load balancing automation",
        "Security threat response",
        "Self-healing network capabilities",
      ],
      status: "implemented",
    },
    {
      id: 5,
      title: "Validation & Testing",
      description: "Validate system effectiveness through simulations and live demos",
      systemFeature: "Live Demo + Simulations",
      systemLink: "/demo",
      icon: Activity,
      achievements: [
        "Demo data generation for testing",
        "Real-time incident simulation",
        "Performance metrics tracking",
        "Comparative analysis tools",
      ],
      relatedLinks: [
        { path: "/reports", label: "Incident Reports" },
        { path: "/analytics", label: "Analytics" },
      ],
      status: "implemented",
    },
  ];

  const keyContributions = [
    {
      title: "Hybrid AI Approach",
      description: "Novel combination of ML, Fuzzy Logic, and Expert Systems for network optimization",
      icon: Brain,
    },
    {
      title: "Real-Time Optimization",
      description: "Sub-second response to network anomalies with automated remediation",
      icon: Gauge,
    },
    {
      title: "Predictive Capabilities",
      description: "AI-powered fault prediction before issues impact network performance",
      icon: Activity,
    },
    {
      title: "Security Integration",
      description: "Unified security and performance optimization in single platform",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-lg px-4 py-1">
            Research Mapping
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Research Objectives</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Direct mapping between research objectives and implemented system features 
            demonstrating how each goal has been achieved in NetOptimAI.
          </p>
        </div>

        {/* Objectives Grid */}
        <section className="mb-16">
          <div className="space-y-6">
            {objectives.map((obj) => (
              <Card key={obj.id} className="border-2 hover:border-primary/50 transition-all overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                      <obj.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <Badge variant="secondary">Objective {obj.id}</Badge>
                        <CardTitle className="text-xl">{obj.title}</CardTitle>
                        {obj.status === 'implemented' && (
                          <Badge className="bg-success/20 text-success border-success/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Implemented
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-base">{obj.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Achievements */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Achievements
                      </h4>
                      <ul className="space-y-2">
                        {obj.achievements.map((achievement, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* System Feature */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-1">System Feature:</p>
                        <p className="font-semibold text-lg mb-3">{obj.systemFeature}</p>
                        <Button asChild size="sm" className="gap-2">
                          <Link to={obj.systemLink}>
                            View Feature <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                      
                      {obj.relatedLinks && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Related Features:</p>
                          <div className="flex flex-wrap gap-2">
                            {obj.relatedLinks.map((link) => (
                              <Button key={link.path} variant="outline" size="sm" asChild>
                                <Link to={link.path}>{link.label}</Link>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Key Contributions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Key Research Contributions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyContributions.map((contribution) => (
              <Card key={contribution.title} className="text-center hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                    <contribution.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{contribution.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{contribution.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Summary Table */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Research-to-System Mapping Summary</CardTitle>
              <CardDescription>
                Quick reference table linking research objectives to system implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Research Objective</th>
                      <th className="text-left py-3 px-4 font-semibold">System Feature</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Demo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {objectives.map((obj) => (
                      <tr key={obj.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{obj.title}</td>
                        <td className="py-3 px-4 font-medium">{obj.systemFeature}</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-success/20 text-success border-success/30">
                            Implemented
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={obj.systemLink}>
                              View <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ResearchObjectives;
