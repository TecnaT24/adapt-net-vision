import { incidentService } from './incidentService';

export interface NetworkMetrics {
  timestamp: Date;
  bandwidth: number;
  latency: number;
  packetLoss: number;
  jitter: number;
  throughput: number;
  activeConnections: number;
  cpuUsage: number;
  memoryUsage: number;
}

const deviceNames = [
  'Core-Router-01', 'Core-Switch-01', 'Edge-Router-01', 'Access-Switch-01',
  'Firewall-01', 'Load-Balancer-01', 'Server-Rack-A', 'Server-Rack-B',
  'Wireless-Controller-01', 'AP-Floor-1', 'AP-Floor-2', 'UPS-Main'
];

const ipRanges = ['192.168.1', '192.168.2', '10.0.1', '10.0.2'];

const attackTypes = [
  'DDoS Attack', 'Port Scanning', 'Brute Force', 'SQL Injection',
  'XSS Attack', 'Man-in-the-Middle', 'DNS Spoofing', 'Malware Detected'
];

const anomalyTypes = [
  'Bandwidth Spike', 'Latency Anomaly', 'Unusual Traffic Pattern',
  'CPU Overload', 'Memory Leak', 'Packet Loss Surge', 'Connection Flood'
];

const faultTypes = [
  'Hardware Failure', 'Disk Degradation', 'Power Supply Issue',
  'Overheating', 'Interface Failure', 'Memory Exhaustion', 'Cable Fault'
];

const severities = ['critical', 'high', 'medium', 'low', 'info'] as const;

class DemoDataGenerator {
  private isGenerating = false;
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: ((metrics: NetworkMetrics) => void)[] = [];

  // Generate random network metrics
  generateNetworkMetrics(): NetworkMetrics {
    return {
      timestamp: new Date(),
      bandwidth: Math.random() * 1000 + 100, // 100-1100 Mbps
      latency: Math.random() * 100 + 5, // 5-105 ms
      packetLoss: Math.random() * 5, // 0-5%
      jitter: Math.random() * 30, // 0-30 ms
      throughput: Math.random() * 800 + 200, // 200-1000 Mbps
      activeConnections: Math.floor(Math.random() * 500) + 50,
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
    };
  }

  // Generate a random security threat
  async generateSecurityThreat() {
    const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
    const severity = severities[Math.floor(Math.random() * 3)]; // Bias toward higher severity
    const ipRange = ipRanges[Math.floor(Math.random() * ipRanges.length)];
    const target = deviceNames[Math.floor(Math.random() * deviceNames.length)];

    return incidentService.logSecurityThreat({
      type: attackType,
      severity,
      source: `${ipRange}.${Math.floor(Math.random() * 254) + 1}`,
      target,
      description: `${attackType} detected targeting ${target}. Immediate action required.`,
      confidence: Math.random() * 30 + 70, // 70-100%
      details: {
        packetCount: Math.floor(Math.random() * 10000) + 1000,
        duration: Math.floor(Math.random() * 300) + 10,
        protocol: ['TCP', 'UDP', 'ICMP'][Math.floor(Math.random() * 3)],
      },
    });
  }

  // Generate a random anomaly
  async generateAnomaly() {
    const anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
    const device = deviceNames[Math.floor(Math.random() * deviceNames.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    return incidentService.logAnomaly({
      type: anomalyType,
      severity,
      deviceId: `DEV-${Math.floor(Math.random() * 1000)}`,
      deviceName: device,
      description: `${anomalyType} detected on ${device}. ML model confidence high.`,
      confidence: Math.random() * 25 + 75, // 75-100%
      metrics: {
        value: Math.random() * 100,
        threshold: 80,
        deviation: Math.random() * 50 + 10,
      },
      method: ['Isolation Forest', 'Autoencoder', 'Z-Score'][Math.floor(Math.random() * 3)],
    });
  }

  // Generate a predictive fault
  async generatePredictiveFault() {
    const faultType = faultTypes[Math.floor(Math.random() * faultTypes.length)];
    const device = deviceNames[Math.floor(Math.random() * deviceNames.length)];
    const hoursAhead = Math.floor(Math.random() * 72) + 1;
    const severity = severities[Math.floor(Math.random() * 2)]; // Bias toward critical/high

    return incidentService.logPredictiveFault({
      deviceId: `DEV-${Math.floor(Math.random() * 1000)}`,
      failureType: faultType,
      predictedTime: new Date(Date.now() + hoursAhead * 60 * 60 * 1000),
      confidence: Math.random() * 20 + 80, // 80-100%
      severity,
      affectedMetrics: ['CPU', 'Memory', 'Disk', 'Network'].slice(0, Math.floor(Math.random() * 3) + 1),
      recommendations: [
        `Schedule maintenance for ${device}`,
        `Prepare backup ${faultType === 'Hardware Failure' ? 'hardware' : 'resources'}`,
        'Monitor closely for next 24 hours',
      ],
    });
  }

  // Generate an alert
  async generateAlert() {
    const device = deviceNames[Math.floor(Math.random() * deviceNames.length)];
    const alertMessages = [
      `High CPU usage on ${device}`,
      `Memory threshold exceeded on ${device}`,
      `Network latency spike detected`,
      `Bandwidth utilization at 90%`,
      `Connection limit approaching on ${device}`,
      `Packet loss detected on uplink`,
    ];
    const message = alertMessages[Math.floor(Math.random() * alertMessages.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    return incidentService.logAlert({
      message,
      severity,
      source: ['Threshold Monitor', 'Fuzzy Logic Engine', 'Expert System'][Math.floor(Math.random() * 3)],
      details: {
        currentValue: Math.random() * 100,
        threshold: 80,
        device,
      },
    });
  }

  // Generate remediation action
  async generateRemediation() {
    const device = deviceNames[Math.floor(Math.random() * deviceNames.length)];
    const actions = [
      'Traffic Reroute',
      'Load Rebalancing',
      'Bandwidth Throttling',
      'Connection Cleanup',
      'Cache Flush',
      'Service Restart',
    ];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const status = Math.random() > 0.1 ? 'success' : 'failed'; // 90% success rate

    return incidentService.logRemediationAction({
      actionType: action,
      targetDevice: device,
      status: status as 'success' | 'failed',
      triggeredBy: 'Automated Remediation System',
      details: {
        executionTime: Math.floor(Math.random() * 5000) + 500,
        previousState: 'degraded',
        newState: status === 'success' ? 'optimal' : 'degraded',
      },
    });
  }

  // Generate batch of demo incidents
  async generateBatchIncidents(count: number = 10) {
    const incidents = [];
    
    for (let i = 0; i < count; i++) {
      const type = Math.floor(Math.random() * 5);
      let incident;
      
      switch (type) {
        case 0:
          incident = await this.generateSecurityThreat();
          break;
        case 1:
          incident = await this.generateAnomaly();
          break;
        case 2:
          incident = await this.generatePredictiveFault();
          break;
        case 3:
          incident = await this.generateAlert();
          break;
        case 4:
          incident = await this.generateRemediation();
          break;
      }
      
      if (incident) {
        incidents.push(incident);
      }
      
      // Small delay to simulate realistic data
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return incidents;
  }

  // Start continuous metric generation
  startMetricGeneration(intervalMs: number = 2000) {
    if (this.isGenerating) return;
    
    this.isGenerating = true;
    this.intervalId = setInterval(() => {
      const metrics = this.generateNetworkMetrics();
      this.listeners.forEach(listener => listener(metrics));
    }, intervalMs);
  }

  // Stop metric generation
  stopMetricGeneration() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isGenerating = false;
  }

  // Subscribe to metric updates
  subscribeToMetrics(listener: (metrics: NetworkMetrics) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Get generation status
  isGeneratingMetrics() {
    return this.isGenerating;
  }
}

export const demoDataGenerator = new DemoDataGenerator();
