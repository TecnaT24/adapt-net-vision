import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, Brain, Gauge, TrendingUp, Shield, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";

const Home = () => {
  const features = [
    {
      icon: Network,
      title: "Smart Network Monitoring",
      description: "Real-time tracking of network devices, bandwidth, latency, and performance metrics across all infrastructure.",
    },
    {
      icon: Brain,
      title: "AI-Powered Analytics",
      description: "Machine learning models predict congestion, failures, and bottlenecks before they impact operations.",
    },
    {
      icon: Gauge,
      title: "Automated Optimization",
      description: "Intelligent routing decisions and load balancing strategies applied automatically for peak performance.",
    },
    {
      icon: TrendingUp,
      title: "Predictive Intelligence",
      description: "Forecast network issues and capacity requirements with advanced predictive analytics.",
    },
    {
      icon: Shield,
      title: "Enhanced Reliability",
      description: "Reduce downtime through proactive fault detection and automated response mechanisms.",
    },
    {
      icon: Zap,
      title: "Continuous Learning",
      description: "Self-improving system that refines accuracy and performance with each network event.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, hsl(217 91% 60% / 0.1) 0%, transparent 50%)`,
        }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 glow-primary">
              <Network className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Based Network Optimization</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
              NetOptimAI System
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Advanced AI-driven network optimization platform designed for <span className="text-foreground font-semibold">Adrian Kenya Limited</span>, 
              delivering predictive analytics, automated responses, and intelligent performance enhancement.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-primary glow-primary-lg text-lg h-14 px-8" asChild>
                <Link to="/dashboard">Explore Live Dashboard</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-14 px-8" asChild>
                <Link to="/architecture">View Architecture</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">System Capabilities</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive AI-powered network management combining real-time monitoring, predictive analytics, and automated optimization
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-smooth hover:glow-primary group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth glow-primary">
                  <feature.icon className="h-6 w-6 text-background" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* System Overview */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center">System Architecture Overview</h2>
            
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { label: "Data Collection", color: "from-primary to-primary-glow" },
                { label: "AI Processing", color: "from-secondary to-primary" },
                { label: "Network Control", color: "from-accent to-success" },
                { label: "Visualization", color: "from-warning to-destructive" },
                { label: "Feedback Loop", color: "from-primary to-accent" },
              ].map((layer, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur border-border text-center hover:scale-105 transition-smooth">
                  <CardHeader className="pb-3">
                    <div className={`h-2 w-full rounded-full bg-gradient-to-r ${layer.color} mb-4 glow-primary`} />
                    <CardTitle className="text-sm">{layer.label}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" variant="outline" className="h-12 px-6" asChild>
                <Link to="/architecture">Explore Detailed Architecture →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4">
        <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30 glow-primary-lg">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl md:text-4xl mb-4">Ready to Optimize Your Network?</CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              Experience intelligent network management with real-time insights, predictive analytics, and automated optimization tailored for Adrian Kenya Limited's infrastructure in Gitaru.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gradient-primary h-12 px-8" asChild>
              <Link to="/dashboard">Launch Dashboard</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Home;
