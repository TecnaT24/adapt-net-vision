import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Server, Wifi, HardDrive, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    bandwidth: 0,
    latency: 0,
    packetLoss: 0,
    uptime: 0,
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setMetrics({
        bandwidth: 750 + Math.random() * 250,
        latency: 12 + Math.random() * 8,
        packetLoss: Math.random() * 2,
        uptime: 99.2 + Math.random() * 0.8,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const devices = [
    { name: "Core Router 01", status: "healthy", ip: "192.168.1.1", load: 68 },
    { name: "Distribution Switch 01", status: "healthy", ip: "192.168.1.10", load: 54 },
    { name: "Access Point 01", status: "warning", ip: "192.168.1.20", load: 82 },
    { name: "Server Rack A", status: "healthy", ip: "192.168.1.100", load: 45 },
    { name: "Core Router 02", status: "healthy", ip: "192.168.1.2", load: 71 },
    { name: "Distribution Switch 02", status: "healthy", ip: "192.168.1.11", load: 58 },
  ];

  const alerts = [
    { type: "warning", message: "Access Point 01 experiencing high load (82%)", time: "2 mins ago" },
    { type: "info", message: "AI optimized routing for better bandwidth distribution", time: "5 mins ago" },
    { type: "success", message: "Preventive maintenance scheduled for Switch 03", time: "15 mins ago" },
  ];

  const predictions = [
    { title: "Bandwidth Spike Expected", desc: "High traffic predicted at 14:00 - 16:00 today", trend: "up" },
    { title: "Router Maintenance Due", desc: "Core Router 01 due for update in 3 days", trend: "neutral" },
    { title: "Optimal Performance", desc: "Network efficiency improved by 23% this week", trend: "up" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Live Network Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring and AI-powered insights for Adrian Kenya Limited</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bandwidth Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.bandwidth.toFixed(0)} Mbps</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-xs text-accent">+12% from avg</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Network Latency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.latency.toFixed(1)} ms</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="h-4 w-4 text-accent" />
                <span className="text-xs text-accent">Optimal range</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Packet Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.packetLoss.toFixed(2)}%</div>
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span className="text-xs text-accent">Within threshold</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">System Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.uptime.toFixed(2)}%</div>
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span className="text-xs text-accent">Excellent</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Network Devices */}
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Network Devices Status
              </CardTitle>
              <CardDescription>Real-time device monitoring across infrastructure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {devices.map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-smooth">
                    <div className="flex items-center gap-3">
                      {device.status === "healthy" ? (
                        <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-warning animate-pulse" />
                      )}
                      <div>
                        <div className="font-medium text-sm">{device.name}</div>
                        <div className="text-xs text-muted-foreground">{device.ip}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Load</div>
                        <div className="text-sm font-medium">{device.load}%</div>
                      </div>
                      <Badge variant={device.status === "healthy" ? "default" : "outline"}>
                        {device.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Predictions */}
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-secondary" />
                AI Predictions
              </CardTitle>
              <CardDescription>Intelligent forecasting and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map((prediction, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-start gap-2 mb-2">
                      {prediction.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-accent mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                      )}
                      <div>
                        <div className="font-medium text-sm mb-1">{prediction.title}</div>
                        <div className="text-xs text-muted-foreground">{prediction.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              System Alerts & Notifications
            </CardTitle>
            <CardDescription>Recent events and AI-generated recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  {alert.type === "warning" && <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />}
                  {alert.type === "info" && <Activity className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />}
                  {alert.type === "success" && <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1">{alert.message}</div>
                    <div className="text-xs text-muted-foreground">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
