/**
 * Machine Learning Anomaly Detection System
 * Uses K-means clustering and statistical analysis to detect network anomalies
 */

export interface NetworkMetrics {
  timestamp: number;
  cpu: number;
  memory: number;
  latency: number;
  bandwidth: number;
  packetLoss?: number;
}

export interface Anomaly {
  id: string;
  deviceId: string;
  deviceName: string;
  type: 'traffic_spike' | 'latency_anomaly' | 'resource_exhaustion' | 'packet_loss' | 'performance_degradation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  detectedAt: number;
  metrics: {
    current: number;
    expected: number;
    deviation: number;
  };
  mlMethod: 'kmeans' | 'statistical' | 'threshold';
}

/**
 * K-means clustering implementation for anomaly detection
 */
class KMeansDetector {
  private k: number = 3;
  private maxIterations: number = 100;
  private centroids: number[][] = [];

  constructor(k: number = 3) {
    this.k = k;
  }

  /**
   * Convert metrics to feature vector
   */
  private toFeatureVector(metrics: NetworkMetrics): number[] {
    return [
      metrics.cpu / 100,
      metrics.memory / 100,
      metrics.latency / 150,
      metrics.bandwidth / 100,
      (metrics.packetLoss || 0) / 10
    ];
  }

  /**
   * Calculate Euclidean distance
   */
  private distance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }

  /**
   * Train K-means on historical data
   */
  train(historicalData: NetworkMetrics[]): void {
    if (historicalData.length < this.k) return;

    const features = historicalData.map(m => this.toFeatureVector(m));
    
    // Initialize centroids randomly
    this.centroids = [];
    const indices = new Set<number>();
    while (indices.size < this.k) {
      indices.add(Math.floor(Math.random() * features.length));
    }
    indices.forEach(i => this.centroids.push([...features[i]]));

    // K-means iterations
    for (let iter = 0; iter < this.maxIterations; iter++) {
      const clusters: number[][] = Array(this.k).fill(null).map(() => []);
      
      // Assign points to nearest centroid
      features.forEach((point, idx) => {
        let minDist = Infinity;
        let cluster = 0;
        this.centroids.forEach((centroid, k) => {
          const dist = this.distance(point, centroid);
          if (dist < minDist) {
            minDist = dist;
            cluster = k;
          }
        });
        clusters[cluster].push(idx);
      });

      // Update centroids
      let changed = false;
      clusters.forEach((cluster, k) => {
        if (cluster.length === 0) return;
        const newCentroid = Array(features[0].length).fill(0);
        cluster.forEach(idx => {
          features[idx].forEach((val, dim) => {
            newCentroid[dim] += val;
          });
        });
        newCentroid.forEach((val, dim) => {
          newCentroid[dim] = val / cluster.length;
        });
        
        if (this.distance(newCentroid, this.centroids[k]) > 0.001) {
          changed = true;
        }
        this.centroids[k] = newCentroid;
      });

      if (!changed) break;
    }
  }

  /**
   * Detect if current metrics are anomalous
   */
  detectAnomaly(metrics: NetworkMetrics): { isAnomaly: boolean; distance: number; normalizedDistance: number } {
    if (this.centroids.length === 0) {
      return { isAnomaly: false, distance: 0, normalizedDistance: 0 };
    }

    const features = this.toFeatureVector(metrics);
    
    // Find distance to nearest centroid
    let minDist = Infinity;
    this.centroids.forEach(centroid => {
      const dist = this.distance(features, centroid);
      if (dist < minDist) {
        minDist = dist;
      }
    });

    // Normalize distance (higher = more anomalous)
    const normalizedDistance = minDist * 100;
    const isAnomaly = normalizedDistance > 15; // Threshold for anomaly

    return { isAnomaly, distance: minDist, normalizedDistance };
  }
}

/**
 * Statistical anomaly detection using Z-score
 */
class StatisticalDetector {
  private mean: { [key: string]: number } = {};
  private stdDev: { [key: string]: number } = {};
  private zScoreThreshold: number = 2.5;

  /**
   * Train on historical data
   */
  train(historicalData: NetworkMetrics[]): void {
    if (historicalData.length === 0) return;

    const keys: (keyof NetworkMetrics)[] = ['cpu', 'memory', 'latency', 'bandwidth', 'packetLoss'];
    
    // Calculate mean
    keys.forEach(key => {
      const values = historicalData.map(m => m[key] as number || 0);
      this.mean[key] = values.reduce((a, b) => a + b, 0) / values.length;
    });

    // Calculate standard deviation
    keys.forEach(key => {
      const values = historicalData.map(m => m[key] as number || 0);
      const variance = values.reduce((sum, val) => sum + Math.pow(val - this.mean[key], 2), 0) / values.length;
      this.stdDev[key] = Math.sqrt(variance);
    });
  }

  /**
   * Detect anomalies using Z-score
   */
  detectAnomalies(metrics: NetworkMetrics): Array<{ metric: string; zScore: number; isAnomaly: boolean }> {
    const keys: (keyof NetworkMetrics)[] = ['cpu', 'memory', 'latency', 'bandwidth', 'packetLoss'];
    const results: Array<{ metric: string; zScore: number; isAnomaly: boolean }> = [];

    keys.forEach(key => {
      const value = metrics[key] as number || 0;
      if (this.stdDev[key] === 0) {
        results.push({ metric: key, zScore: 0, isAnomaly: false });
        return;
      }

      const zScore = Math.abs((value - this.mean[key]) / this.stdDev[key]);
      const isAnomaly = zScore > this.zScoreThreshold;
      results.push({ metric: key, zScore, isAnomaly });
    });

    return results;
  }

  getMean(metric: string): number {
    return this.mean[metric] || 0;
  }
}

/**
 * Main Anomaly Detection Engine
 */
export class AnomalyDetector {
  private kmeansDetector: KMeansDetector;
  private statisticalDetector: StatisticalDetector;
  private historicalData: Map<string, NetworkMetrics[]> = new Map();
  private detectedAnomalies: Anomaly[] = [];
  private maxHistorySize: number = 100;

  constructor() {
    this.kmeansDetector = new KMeansDetector(3);
    this.statisticalDetector = new StatisticalDetector();
  }

  /**
   * Add new metrics for a device
   */
  addMetrics(deviceId: string, deviceName: string, metrics: NetworkMetrics): void {
    if (!this.historicalData.has(deviceId)) {
      this.historicalData.set(deviceId, []);
    }

    const history = this.historicalData.get(deviceId)!;
    history.push(metrics);

    // Keep only recent history
    if (history.length > this.maxHistorySize) {
      history.shift();
    }

    // Retrain models periodically
    if (history.length >= 20 && history.length % 10 === 0) {
      this.train(deviceId);
    }
  }

  /**
   * Train models on historical data
   */
  private train(deviceId: string): void {
    const history = this.historicalData.get(deviceId);
    if (!history || history.length < 20) return;

    this.kmeansDetector.train(history);
    this.statisticalDetector.train(history);
  }

  /**
   * Detect anomalies in current metrics
   */
  detectAnomalies(deviceId: string, deviceName: string, currentMetrics: NetworkMetrics): Anomaly[] {
    const history = this.historicalData.get(deviceId);
    if (!history || history.length < 20) {
      return []; // Need minimum data for detection
    }

    const anomalies: Anomaly[] = [];

    // K-means detection
    const kmeansResult = this.kmeansDetector.detectAnomaly(currentMetrics);
    
    // Statistical detection
    const statResults = this.statisticalDetector.detectAnomalies(currentMetrics);

    // Combine results and generate anomaly reports
    if (kmeansResult.isAnomaly) {
      const severity = this.calculateSeverity(kmeansResult.normalizedDistance);
      anomalies.push({
        id: `${deviceId}-cluster-${Date.now()}`,
        deviceId,
        deviceName,
        type: 'performance_degradation',
        severity,
        confidence: Math.min(95, kmeansResult.normalizedDistance * 3),
        description: `Unusual behavior pattern detected via K-means clustering. Device metrics deviate significantly from normal operation clusters.`,
        detectedAt: Date.now(),
        metrics: {
          current: kmeansResult.normalizedDistance,
          expected: 10,
          deviation: kmeansResult.normalizedDistance - 10
        },
        mlMethod: 'kmeans'
      });
    }

    // Check individual metrics
    statResults.forEach(result => {
      if (result.isAnomaly) {
        const metricValue = currentMetrics[result.metric as keyof NetworkMetrics] as number || 0;
        const expectedValue = this.statisticalDetector.getMean(result.metric);
        
        anomalies.push(this.createAnomalyFromMetric(
          deviceId,
          deviceName,
          result.metric,
          metricValue,
          expectedValue,
          result.zScore
        ));
      }
    });

    // Threshold-based detection for critical values
    const thresholdAnomalies = this.detectThresholdAnomalies(deviceId, deviceName, currentMetrics);
    anomalies.push(...thresholdAnomalies);

    // Store detected anomalies
    this.detectedAnomalies.push(...anomalies);
    
    // Keep only recent anomalies
    const oneHourAgo = Date.now() - 3600000;
    this.detectedAnomalies = this.detectedAnomalies.filter(a => a.detectedAt > oneHourAgo);

    return anomalies;
  }

  /**
   * Create anomaly object from metric deviation
   */
  private createAnomalyFromMetric(
    deviceId: string,
    deviceName: string,
    metric: string,
    currentValue: number,
    expectedValue: number,
    zScore: number
  ): Anomaly {
    const deviation = Math.abs(currentValue - expectedValue);
    const deviationPercent = (deviation / expectedValue) * 100;

    let type: Anomaly['type'] = 'performance_degradation';
    let description = '';

    switch (metric) {
      case 'latency':
        type = 'latency_anomaly';
        description = `Latency spike detected: ${currentValue.toFixed(1)}ms (expected: ${expectedValue.toFixed(1)}ms). Network delay is ${deviationPercent.toFixed(0)}% higher than normal.`;
        break;
      case 'cpu':
      case 'memory':
        type = 'resource_exhaustion';
        description = `${metric.toUpperCase()} usage anomaly: ${currentValue.toFixed(1)}% (expected: ${expectedValue.toFixed(1)}%). Resource consumption is abnormally high.`;
        break;
      case 'bandwidth':
        type = 'traffic_spike';
        description = `Bandwidth usage surge: ${currentValue.toFixed(1)}% (expected: ${expectedValue.toFixed(1)}%). Traffic pattern deviates from historical baseline.`;
        break;
      case 'packetLoss':
        type = 'packet_loss';
        description = `Packet loss detected: ${currentValue.toFixed(2)}% (expected: ${expectedValue.toFixed(2)}%). Connection quality degraded.`;
        break;
    }

    return {
      id: `${deviceId}-${metric}-${Date.now()}`,
      deviceId,
      deviceName,
      type,
      severity: this.calculateSeverityFromZScore(zScore),
      confidence: Math.min(99, 70 + zScore * 5),
      description,
      detectedAt: Date.now(),
      metrics: {
        current: currentValue,
        expected: expectedValue,
        deviation
      },
      mlMethod: 'statistical'
    };
  }

  /**
   * Detect critical threshold breaches
   */
  private detectThresholdAnomalies(deviceId: string, deviceName: string, metrics: NetworkMetrics): Anomaly[] {
    const anomalies: Anomaly[] = [];

    if (metrics.cpu > 90) {
      anomalies.push({
        id: `${deviceId}-cpu-critical-${Date.now()}`,
        deviceId,
        deviceName,
        type: 'resource_exhaustion',
        severity: 'critical',
        confidence: 98,
        description: `Critical CPU usage: ${metrics.cpu.toFixed(1)}%. Immediate attention required to prevent service degradation.`,
        detectedAt: Date.now(),
        metrics: { current: metrics.cpu, expected: 70, deviation: metrics.cpu - 70 },
        mlMethod: 'threshold'
      });
    }

    if (metrics.memory > 90) {
      anomalies.push({
        id: `${deviceId}-memory-critical-${Date.now()}`,
        deviceId,
        deviceName,
        type: 'resource_exhaustion',
        severity: 'critical',
        confidence: 98,
        description: `Critical memory usage: ${metrics.memory.toFixed(1)}%. Risk of out-of-memory errors.`,
        detectedAt: Date.now(),
        metrics: { current: metrics.memory, expected: 70, deviation: metrics.memory - 70 },
        mlMethod: 'threshold'
      });
    }

    if (metrics.latency > 100) {
      anomalies.push({
        id: `${deviceId}-latency-critical-${Date.now()}`,
        deviceId,
        deviceName,
        type: 'latency_anomaly',
        severity: 'critical',
        confidence: 95,
        description: `Critical latency: ${metrics.latency.toFixed(1)}ms. Network performance severely degraded.`,
        detectedAt: Date.now(),
        metrics: { current: metrics.latency, expected: 20, deviation: metrics.latency - 20 },
        mlMethod: 'threshold'
      });
    }

    return anomalies;
  }

  /**
   * Calculate severity from normalized distance
   */
  private calculateSeverity(normalizedDistance: number): Anomaly['severity'] {
    if (normalizedDistance > 30) return 'critical';
    if (normalizedDistance > 22) return 'high';
    if (normalizedDistance > 17) return 'medium';
    return 'low';
  }

  /**
   * Calculate severity from Z-score
   */
  private calculateSeverityFromZScore(zScore: number): Anomaly['severity'] {
    if (zScore > 4) return 'critical';
    if (zScore > 3.5) return 'high';
    if (zScore > 3) return 'medium';
    return 'low';
  }

  /**
   * Get all recent anomalies
   */
  getRecentAnomalies(deviceId?: string, minutes: number = 60): Anomaly[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    let anomalies = this.detectedAnomalies.filter(a => a.detectedAt > cutoff);
    
    if (deviceId) {
      anomalies = anomalies.filter(a => a.deviceId === deviceId);
    }

    return anomalies.sort((a, b) => b.detectedAt - a.detectedAt);
  }

  /**
   * Get anomaly statistics
   */
  getStatistics(): {
    total: number;
    bySeverity: { [key: string]: number };
    byType: { [key: string]: number };
    byMethod: { [key: string]: number };
  } {
    const stats = {
      total: this.detectedAnomalies.length,
      bySeverity: {} as { [key: string]: number },
      byType: {} as { [key: string]: number },
      byMethod: {} as { [key: string]: number }
    };

    this.detectedAnomalies.forEach(a => {
      stats.bySeverity[a.severity] = (stats.bySeverity[a.severity] || 0) + 1;
      stats.byType[a.type] = (stats.byType[a.type] || 0) + 1;
      stats.byMethod[a.mlMethod] = (stats.byMethod[a.mlMethod] || 0) + 1;
    });

    return stats;
  }
}

// Singleton instance
export const anomalyDetector = new AnomalyDetector();
