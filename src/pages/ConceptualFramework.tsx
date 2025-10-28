import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Brain, Network, Users, FileText, Target } from "lucide-react";

const ConceptualFramework = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Conceptual Framework</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Research framework illustrating the relationship between AI technologies and network optimization outcomes, 
            moderated by key organizational factors
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Independent Variable */}
          <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30 glow-primary">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
                  <Brain className="h-10 w-10 text-background" />
                </div>
              </div>
              <CardTitle className="text-3xl">Artificial Intelligence Technologies</CardTitle>
              <CardDescription className="text-base font-semibold text-primary">
                Independent Variable
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <ArrowDown className="h-12 w-12 text-primary animate-pulse" />
          </div>

          {/* Moderating Variables */}
          <Card className="bg-gradient-to-br from-secondary/20 to-accent/20 border-secondary/30">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-6">Moderating Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-smooth">
                  <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <Network className="h-8 w-8 text-background" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Network Infrastructure</h3>
                  <p className="text-sm text-muted-foreground">Quality and capability of existing network systems</p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-smooth">
                  <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-background" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Human Expertise</h3>
                  <p className="text-sm text-muted-foreground">Technical skills and knowledge of network engineers</p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-smooth">
                  <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-background" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Organizational Policy</h3>
                  <p className="text-sm text-muted-foreground">Guidelines and procedures governing network operations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <ArrowDown className="h-12 w-12 text-primary animate-pulse" />
          </div>

          {/* Dependent Variable */}
          <Card className="bg-gradient-to-br from-success/20 to-warning/20 border-success/30 glow-primary">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-2xl gradient-success flex items-center justify-center glow-primary">
                  <Target className="h-10 w-10 text-background" />
                </div>
              </div>
              <CardTitle className="text-3xl">Network Optimization Outcomes</CardTitle>
              <CardDescription className="text-base font-semibold text-success">
                Dependent Variable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "Improved Efficiency", desc: "Enhanced network resource utilization" },
                  { title: "Reduced Latency", desc: "Faster data transmission and response times" },
                  { title: "Enhanced Reliability", desc: "Increased network uptime and stability" },
                  { title: "Automated Fault Detection", desc: "Proactive identification and resolution of issues" }
                ].map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                    <div className="w-2 h-2 rounded-full bg-success mt-2 animate-pulse" />
                    <div>
                      <h4 className="font-bold mb-1">{outcome.title}</h4>
                      <p className="text-sm text-muted-foreground">{outcome.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Research Notes */}
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-xl">Framework Interpretation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Independent Variable:</span> Artificial Intelligence technologies 
                serve as the primary factor influencing network optimization outcomes at Adrian Kenya Limited.
              </p>
              <p>
                <span className="font-semibold text-foreground">Moderating Variables:</span> The effectiveness of AI implementation 
                is moderated by three critical factors: the quality of existing network infrastructure, the technical expertise of 
                personnel, and organizational policies governing network management.
              </p>
              <p>
                <span className="font-semibold text-foreground">Dependent Variable:</span> The research measures four key outcomes 
                that indicate successful network optimization: efficiency improvements, latency reduction, reliability enhancement, 
                and automated fault detection capabilities.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConceptualFramework;
