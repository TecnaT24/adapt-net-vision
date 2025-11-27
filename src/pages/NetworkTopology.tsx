import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Wifi, Cpu, HardDrive, Activity, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type DeviceStatus = "normal" | "warning" | "critical";

interface NetworkDevice {
  id: string;
  name: string;
  type: "router" | "switch" | "server" | "access-point" | "endpoint";
  status: DeviceStatus;
  x: number;
  y: number;
  metrics: {
    cpu: number;
    memory: number;
    latency: number;
    bandwidth: number;
  };
}

interface Connection {
  from: string;
  to: string;
  status: DeviceStatus;
}

const NetworkTopology = () => {
  const [devices, setDevices] = useState<NetworkDevice[]>([
    {
      id: "core-router",
      name: "Core Router",
      type: "router",
      status: "normal",
      x: 400,
      y: 50,
      metrics: { cpu: 45, memory: 60, latency: 12, bandwidth: 85 }
    },
    {
      id: "dist-switch-1",
      name: "Distribution Switch 1",
      type: "switch",
      status: "normal",
      x: 200,
      y: 180,
      metrics: { cpu: 35, memory: 50, latency: 8, bandwidth: 70 }
    },
    {
      id: "dist-switch-2",
      name: "Distribution Switch 2",
      type: "switch",
      status: "warning",
      x: 600,
      y: 180,
      metrics: { cpu: 78, memory: 82, latency: 45, bandwidth: 90 }
    },
    {
      id: "server-1",
      name: "Database Server",
      type: "server",
      status: "normal",
      x: 100,
      y: 320,
      metrics: { cpu: 52, memory: 68, latency: 5, bandwidth: 60 }
    },
    {
      id: "server-2",
      name: "Web Server",
      type: "server",
      status: "critical",
      x: 300,
      y: 320,
      metrics: { cpu: 95, memory: 88, latency: 120, bandwidth: 95 }
    },
    {
      id: "ap-1",
      name: "Access Point 1",
      type: "access-point",
      status: "normal",
      x: 500,
      y: 320,
      metrics: { cpu: 40, memory: 45, latency: 15, bandwidth: 65 }
    },
    {
      id: "ap-2",
      name: "Access Point 2",
      type: "access-point",
      status: "normal",
      x: 700,
      y: 320,
      metrics: { cpu: 38, memory: 42, latency: 18, bandwidth: 58 }
    },
    {
      id: "endpoint-1",
      name: "Workstation 1",
      type: "endpoint",
      status: "normal",
      x: 450,
      y: 450,
      metrics: { cpu: 25, memory: 55, latency: 10, bandwidth: 30 }
    },
    {
      id: "endpoint-2",
      name: "Workstation 2",
      type: "endpoint",
      status: "normal",
      x: 550,
      y: 450,
      metrics: { cpu: 30, memory: 48, latency: 12, bandwidth: 35 }
    }
  ]);

  const [connections] = useState<Connection[]>([
    { from: "core-router", to: "dist-switch-1", status: "normal" },
    { from: "core-router", to: "dist-switch-2", status: "warning" },
    { from: "dist-switch-1", to: "server-1", status: "normal" },
    { from: "dist-switch-1", to: "server-2", status: "critical" },
    { from: "dist-switch-2", to: "ap-1", status: "normal" },
    { from: "dist-switch-2", to: "ap-2", status: "normal" },
    { from: "ap-1", to: "endpoint-1", status: "normal" },
    { from: "ap-1", to: "endpoint-2", status: "normal" }
  ]);

  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);

  // Simulate real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prevDevices =>
        prevDevices.map(device => {
          const newMetrics = {
            cpu: Math.max(10, Math.min(98, device.metrics.cpu + (Math.random() - 0.5) * 10)),
            memory: Math.max(20, Math.min(95, device.metrics.memory + (Math.random() - 0.5) * 8)),
            latency: Math.max(1, Math.min(150, device.metrics.latency + (Math.random() - 0.5) * 15)),
            bandwidth: Math.max(10, Math.min(100, device.metrics.bandwidth + (Math.random() - 0.5) * 5))
          };

          let newStatus: DeviceStatus = "normal";
          if (newMetrics.cpu > 80 || newMetrics.memory > 85 || newMetrics.latency > 100) {
            newStatus = "critical";
          } else if (newMetrics.cpu > 70 || newMetrics.memory > 75 || newMetrics.latency > 50) {
            newStatus = "warning";
          }

          return { ...device, metrics: newMetrics, status: newStatus };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getDeviceIcon = (type: NetworkDevice["type"]) => {
    switch (type) {
      case "router":
        return <Cpu className="h-6 w-6" />;
      case "switch":
        return <Server className="h-6 w-6" />;
      case "server":
        return <HardDrive className="h-6 w-6" />;
      case "access-point":
        return <Wifi className="h-6 w-6" />;
      case "endpoint":
        return <Activity className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case "normal":
        return "hsl(var(--success))";
      case "warning":
        return "hsl(var(--warning))";
      case "critical":
        return "hsl(var(--destructive))";
    }
  };

  const getStatusBadgeVariant = (status: DeviceStatus): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "normal":
        return "default";
      case "warning":
        return "secondary";
      case "critical":
        return "destructive";
    }
  };

  const getConnectionColor = (status: DeviceStatus) => {
    return getStatusColor(status);
  };

  const drawConnection = (conn: Connection) => {
    const fromDevice = devices.find(d => d.id === conn.from);
    const toDevice = devices.find(d => d.id === conn.to);
    
    if (!fromDevice || !toDevice) return null;

    return (
      <line
        key={`${conn.from}-${conn.to}`}
        x1={fromDevice.x}
        y1={fromDevice.y}
        x2={toDevice.x}
        y2={toDevice.y}
        stroke={getConnectionColor(conn.status)}
        strokeWidth="2"
        strokeDasharray={conn.status !== "normal" ? "5,5" : "none"}
        opacity="0.6"
      />
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Network Topology Map
            </h1>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Real-time visualization of network infrastructure at Adrian Kenya Limited. 
              Devices are color-coded by status: Green (Normal), Yellow (Warning), Red (Critical).
            </p>
          </div>

          {/* Legend */}
          <Card className="mb-8 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Status Legend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Normal: All metrics within safe range</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm">Warning: Some metrics elevated</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm">Critical: Immediate attention required</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Topology Visualization */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Network Infrastructure</CardTitle>
                <CardDescription>Click on any device for detailed metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative bg-muted/30 rounded-lg p-4 min-h-[550px]">
                  <svg width="100%" height="550" className="overflow-visible">
                    {/* Draw connections first (behind devices) */}
                    {connections.map(conn => drawConnection(conn))}
                    
                    {/* Draw devices */}
                    {devices.map(device => (
                      <g
                        key={device.id}
                        onClick={() => setSelectedDevice(device)}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        {/* Device circle with status color */}
                        <circle
                          cx={device.x}
                          cy={device.y}
                          r="30"
                          fill={getStatusColor(device.status)}
                          opacity="0.2"
                          className="animate-pulse"
                        />
                        <circle
                          cx={device.x}
                          cy={device.y}
                          r="25"
                          fill={getStatusColor(device.status)}
                          stroke="hsl(var(--border))"
                          strokeWidth="2"
                        />
                        
                        {/* Device label */}
                        <text
                          x={device.x}
                          y={device.y + 45}
                          textAnchor="middle"
                          className="fill-foreground text-xs font-medium"
                        >
                          {device.name}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* Device Details Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Device Details</CardTitle>
                <CardDescription>
                  {selectedDevice ? "Real-time metrics" : "Select a device to view details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDevice ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-3 rounded-lg",
                          selectedDevice.status === "normal" && "bg-green-500/20",
                          selectedDevice.status === "warning" && "bg-yellow-500/20",
                          selectedDevice.status === "critical" && "bg-red-500/20"
                        )}>
                          {getDeviceIcon(selectedDevice.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{selectedDevice.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{selectedDevice.type}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(selectedDevice.status)}>
                        {selectedDevice.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>CPU Usage</span>
                          <span className="font-medium">{selectedDevice.metrics.cpu.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              selectedDevice.metrics.cpu > 80 && "bg-destructive",
                              selectedDevice.metrics.cpu > 70 && selectedDevice.metrics.cpu <= 80 && "bg-yellow-500",
                              selectedDevice.metrics.cpu <= 70 && "bg-green-500"
                            )}
                            style={{ width: `${selectedDevice.metrics.cpu}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Memory Usage</span>
                          <span className="font-medium">{selectedDevice.metrics.memory.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              selectedDevice.metrics.memory > 85 && "bg-destructive",
                              selectedDevice.metrics.memory > 75 && selectedDevice.metrics.memory <= 85 && "bg-yellow-500",
                              selectedDevice.metrics.memory <= 75 && "bg-green-500"
                            )}
                            style={{ width: `${selectedDevice.metrics.memory}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Latency</span>
                          <span className="font-medium">{selectedDevice.metrics.latency.toFixed(1)}ms</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              selectedDevice.metrics.latency > 100 && "bg-destructive",
                              selectedDevice.metrics.latency > 50 && selectedDevice.metrics.latency <= 100 && "bg-yellow-500",
                              selectedDevice.metrics.latency <= 50 && "bg-green-500"
                            )}
                            style={{ width: `${Math.min(100, (selectedDevice.metrics.latency / 150) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Bandwidth Usage</span>
                          <span className="font-medium">{selectedDevice.metrics.bandwidth.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${selectedDevice.metrics.bandwidth}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-2">Device ID</h4>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{selectedDevice.id}</code>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Click on any device in the topology map to view its details and real-time metrics.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Network Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">
                    {devices.filter(d => d.status === "normal").length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Normal Devices</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500">
                    {devices.filter(d => d.status === "warning").length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Warnings</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-destructive">
                    {devices.filter(d => d.status === "critical").length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Critical Devices</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {devices.length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Total Devices</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default NetworkTopology;
