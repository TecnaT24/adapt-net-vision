export interface AlertThreshold {
  id: string;
  name: string;
  metric: string;
  operator: 'greater' | 'less' | 'equals';
  value: number;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
  id: string;
  timestamp: Date;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: 'anomaly' | 'fuzzy' | 'expert';
  acknowledged: boolean;
  metadata?: any;
}

export const DEFAULT_THRESHOLDS: AlertThreshold[] = [
  {
    id: 'latency-high',
    name: 'High Latency Alert',
    metric: 'latency',
    operator: 'greater',
    value: 100,
    enabled: true,
    severity: 'high'
  },
  {
    id: 'traffic-spike',
    name: 'Traffic Spike Alert',
    metric: 'traffic',
    operator: 'greater',
    value: 80,
    enabled: true,
    severity: 'medium'
  },
  {
    id: 'cpu-critical',
    name: 'Critical CPU Usage',
    metric: 'cpuUsage',
    operator: 'greater',
    value: 90,
    enabled: true,
    severity: 'critical'
  },
  {
    id: 'bandwidth-low',
    name: 'Low Bandwidth Alert',
    metric: 'bandwidth',
    operator: 'less',
    value: 20,
    enabled: true,
    severity: 'medium'
  },
  {
    id: 'packet-loss',
    name: 'Packet Loss Alert',
    metric: 'packetLoss',
    operator: 'greater',
    value: 5,
    enabled: true,
    severity: 'high'
  }
];

class AlertSystemManager {
  private alerts: Alert[] = [];
  private thresholds: AlertThreshold[] = DEFAULT_THRESHOLDS;
  private listeners: ((alerts: Alert[]) => void)[] = [];

  getThresholds(): AlertThreshold[] {
    return [...this.thresholds];
  }

  updateThreshold(id: string, updates: Partial<AlertThreshold>): void {
    const index = this.thresholds.findIndex(t => t.id === id);
    if (index !== -1) {
      this.thresholds[index] = { ...this.thresholds[index], ...updates };
    }
  }

  addThreshold(threshold: AlertThreshold): void {
    this.thresholds.push(threshold);
  }

  removeThreshold(id: string): void {
    this.thresholds = this.thresholds.filter(t => t.id !== id);
  }

  checkThresholds(data: any, source: 'anomaly' | 'fuzzy' | 'expert'): Alert[] {
    const triggeredAlerts: Alert[] = [];

    this.thresholds.forEach(threshold => {
      if (!threshold.enabled) return;

      const value = data[threshold.metric];
      if (value === undefined) return;

      let triggered = false;
      switch (threshold.operator) {
        case 'greater':
          triggered = value > threshold.value;
          break;
        case 'less':
          triggered = value < threshold.value;
          break;
        case 'equals':
          triggered = value === threshold.value;
          break;
      }

      if (triggered) {
        const alert: Alert = {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          title: threshold.name,
          message: `${threshold.metric} is ${value.toFixed(2)} (threshold: ${threshold.value})`,
          severity: threshold.severity,
          source,
          acknowledged: false,
          metadata: { metric: threshold.metric, value, threshold: threshold.value }
        };
        triggeredAlerts.push(alert);
        this.addAlert(alert);
      }
    });

    return triggeredAlerts;
  }

  private addAlert(alert: Alert): void {
    this.alerts.unshift(alert);
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }
    this.notifyListeners();
  }

  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  acknowledgeAlert(id: string): void {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      this.notifyListeners();
    }
  }

  clearAlerts(): void {
    this.alerts = [];
    this.notifyListeners();
  }

  subscribe(listener: (alerts: Alert[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getAlerts()));
  }

  getAlertStats() {
    const total = this.alerts.length;
    const unacknowledged = this.alerts.filter(a => !a.acknowledged).length;
    const bySeverity = {
      critical: this.alerts.filter(a => a.severity === 'critical').length,
      high: this.alerts.filter(a => a.severity === 'high').length,
      medium: this.alerts.filter(a => a.severity === 'medium').length,
      low: this.alerts.filter(a => a.severity === 'low').length
    };
    const bySource = {
      anomaly: this.alerts.filter(a => a.source === 'anomaly').length,
      fuzzy: this.alerts.filter(a => a.source === 'fuzzy').length,
      expert: this.alerts.filter(a => a.source === 'expert').length
    };

    return { total, unacknowledged, bySeverity, bySource };
  }
}

export const alertSystem = new AlertSystemManager();
