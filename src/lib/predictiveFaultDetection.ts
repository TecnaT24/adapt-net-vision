import * as tf from '@tensorflow/tfjs';

export interface NetworkTimeSeries {
  timestamp: number;
  cpu: number;
  memory: number;
  latency: number;
  bandwidth: number;
  packetLoss: number;
  errorRate: number;
}

export interface Prediction {
  id: string;
  timestamp: number;
  predictedTime: number;
  minutesAhead: number;
  metrics: {
    cpu: number;
    memory: number;
    latency: number;
    bandwidth: number;
    packetLoss: number;
    errorRate: number;
  };
  confidence: {
    lower: number;
    upper: number;
    mean: number;
  };
  failureProbability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface PredictiveFault {
  id: string;
  detectedAt: number;
  predictedFailureTime: number;
  minutesUntilFailure: number;
  failureType: string;
  confidence: number;
  affectedMetrics: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

class LSTMPredictor {
  private model: tf.LayersModel | null = null;
  private isTraining = false;
  private sequenceLength = 20; // Use last 20 time points
  private featureCount = 6; // cpu, memory, latency, bandwidth, packetLoss, errorRate
  private predictionHorizons = [15, 20, 25, 30]; // Minutes ahead to predict

  async buildModel(): Promise<void> {
    // Multi-output LSTM model for predicting multiple time horizons
    const input = tf.input({ shape: [this.sequenceLength, this.featureCount] });
    
    // First LSTM layer
    let lstm1 = tf.layers.lstm({
      units: 128,
      returnSequences: true,
      kernelInitializer: 'glorotUniform',
    }).apply(input) as tf.SymbolicTensor;
    
    lstm1 = tf.layers.dropout({ rate: 0.2 }).apply(lstm1) as tf.SymbolicTensor;
    
    // Second LSTM layer
    let lstm2 = tf.layers.lstm({
      units: 64,
      returnSequences: false,
      kernelInitializer: 'glorotUniform',
    }).apply(lstm1) as tf.SymbolicTensor;
    
    lstm2 = tf.layers.dropout({ rate: 0.2 }).apply(lstm2) as tf.SymbolicTensor;
    
    // Dense layers
    let dense = tf.layers.dense({ units: 128, activation: 'relu' }).apply(lstm2) as tf.SymbolicTensor;
    dense = tf.layers.dropout({ rate: 0.15 }).apply(dense) as tf.SymbolicTensor;
    
    // Output layer: predict all features for multiple time horizons
    const output = tf.layers.dense({
      units: this.featureCount * this.predictionHorizons.length,
      activation: 'linear'
    }).apply(dense) as tf.SymbolicTensor;

    this.model = tf.model({ inputs: input, outputs: output });
    
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
  }

  async train(data: NetworkTimeSeries[]): Promise<void> {
    if (this.isTraining || data.length < this.sequenceLength + 30) {
      return;
    }

    this.isTraining = true;
    
    try {
      if (!this.model) {
        await this.buildModel();
      }

      // Prepare training data
      const { inputs, targets } = this.prepareTrainingData(data);
      
      if (inputs.length === 0) {
        this.isTraining = false;
        return;
      }

      const xs = tf.tensor3d(inputs);
      const ys = tf.tensor2d(targets);

      // Train the model
      await this.model!.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 0,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
            }
          }
        }
      });

      xs.dispose();
      ys.dispose();
    } finally {
      this.isTraining = false;
    }
  }

  private prepareTrainingData(data: NetworkTimeSeries[]): { inputs: number[][][], targets: number[][] } {
    const inputs: number[][][] = [];
    const targets: number[][] = [];

    // Normalize data
    const normalized = this.normalizeData(data);

    // Create sequences
    for (let i = 0; i < normalized.length - this.sequenceLength - 30; i++) {
      const sequence = normalized.slice(i, i + this.sequenceLength);
      const input = sequence.map(d => [d.cpu, d.memory, d.latency, d.bandwidth, d.packetLoss, d.errorRate]);
      
      // Target: predictions at 15, 20, 25, 30 minutes ahead
      const target: number[] = [];
      for (const horizon of this.predictionHorizons) {
        const futureIndex = i + this.sequenceLength + horizon;
        if (futureIndex < normalized.length) {
          const future = normalized[futureIndex];
          target.push(future.cpu, future.memory, future.latency, future.bandwidth, future.packetLoss, future.errorRate);
        }
      }

      if (target.length === this.featureCount * this.predictionHorizons.length) {
        inputs.push(input);
        targets.push(target);
      }
    }

    return { inputs, targets };
  }

  async predict(sequence: NetworkTimeSeries[]): Promise<Prediction[]> {
    if (!this.model || sequence.length < this.sequenceLength) {
      return [];
    }

    const normalized = this.normalizeData(sequence);
    const recentSequence = normalized.slice(-this.sequenceLength);
    const input = recentSequence.map(d => [d.cpu, d.memory, d.latency, d.bandwidth, d.packetLoss, d.errorRate]);

    const inputTensor = tf.tensor3d([input]);
    const prediction = this.model.predict(inputTensor) as tf.Tensor;
    const predValues = await prediction.data();

    inputTensor.dispose();
    prediction.dispose();

    // Denormalize and create predictions
    const predictions: Prediction[] = [];
    const currentTime = Date.now();

    for (let i = 0; i < this.predictionHorizons.length; i++) {
      const offset = i * this.featureCount;
      const metrics = {
        cpu: this.denormalize(predValues[offset], 0, 100),
        memory: this.denormalize(predValues[offset + 1], 0, 100),
        latency: this.denormalize(predValues[offset + 2], 0, 500),
        bandwidth: this.denormalize(predValues[offset + 3], 0, 1000),
        packetLoss: this.denormalize(predValues[offset + 4], 0, 10),
        errorRate: this.denormalize(predValues[offset + 5], 0, 5)
      };

      // Calculate confidence intervals (simplified using standard deviation estimation)
      const confidence = this.calculateConfidence(metrics);
      const failureProbability = this.calculateFailureProbability(metrics);
      const severity = this.determineSeverity(failureProbability, metrics);

      predictions.push({
        id: `pred-${currentTime}-${this.predictionHorizons[i]}`,
        timestamp: currentTime,
        predictedTime: currentTime + this.predictionHorizons[i] * 60 * 1000,
        minutesAhead: this.predictionHorizons[i],
        metrics,
        confidence,
        failureProbability,
        severity,
        description: this.generateDescription(metrics, failureProbability, this.predictionHorizons[i])
      });
    }

    return predictions;
  }

  private normalizeData(data: NetworkTimeSeries[]): NetworkTimeSeries[] {
    return data.map(d => ({
      ...d,
      cpu: d.cpu / 100,
      memory: d.memory / 100,
      latency: d.latency / 500,
      bandwidth: d.bandwidth / 1000,
      packetLoss: d.packetLoss / 10,
      errorRate: d.errorRate / 5
    }));
  }

  private denormalize(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value * (max - min) + min));
  }

  private calculateConfidence(metrics: any): { lower: number; upper: number; mean: number } {
    // Simplified confidence calculation based on metric stability
    const values = Object.values(metrics) as number[];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      mean: Math.min(95, Math.max(60, 85 - stdDev * 10)),
      lower: Math.min(90, Math.max(50, 75 - stdDev * 15)),
      upper: Math.min(99, Math.max(70, 95 - stdDev * 5))
    };
  }

  private calculateFailureProbability(metrics: any): number {
    let probability = 0;
    
    if (metrics.cpu > 90) probability += 0.25;
    else if (metrics.cpu > 80) probability += 0.15;
    
    if (metrics.memory > 90) probability += 0.25;
    else if (metrics.memory > 80) probability += 0.15;
    
    if (metrics.latency > 300) probability += 0.2;
    else if (metrics.latency > 200) probability += 0.1;
    
    if (metrics.packetLoss > 3) probability += 0.2;
    else if (metrics.packetLoss > 1) probability += 0.1;
    
    if (metrics.errorRate > 2) probability += 0.15;
    else if (metrics.errorRate > 1) probability += 0.08;

    return Math.min(1, probability);
  }

  private determineSeverity(probability: number, metrics: any): 'low' | 'medium' | 'high' | 'critical' {
    if (probability > 0.7 || metrics.cpu > 95 || metrics.memory > 95) return 'critical';
    if (probability > 0.5 || metrics.cpu > 85 || metrics.memory > 85) return 'high';
    if (probability > 0.3 || metrics.cpu > 75 || metrics.memory > 75) return 'medium';
    return 'low';
  }

  private generateDescription(metrics: any, probability: number, minutesAhead: number): string {
    if (probability > 0.7) {
      return `Critical failure likely in ${minutesAhead} minutes. Immediate action required.`;
    } else if (probability > 0.5) {
      return `High probability of failure in ${minutesAhead} minutes. Prepare mitigation.`;
    } else if (probability > 0.3) {
      return `Potential issues detected ${minutesAhead} minutes ahead. Monitor closely.`;
    }
    return `Normal operation predicted for next ${minutesAhead} minutes.`;
  }
}

export class PredictiveFaultDetector {
  private predictor: LSTMPredictor;
  private timeSeriesData: Map<string, NetworkTimeSeries[]> = new Map();
  private predictions: Prediction[] = [];
  private detectedFaults: PredictiveFault[] = [];
  private maxHistoryLength = 100;
  private lastTrainingTime = 0;
  private trainingInterval = 5 * 60 * 1000; // Retrain every 5 minutes

  constructor() {
    this.predictor = new LSTMPredictor();
  }

  async initialize(): Promise<void> {
    await this.predictor.buildModel();
  }

  addDataPoint(deviceId: string, data: NetworkTimeSeries): void {
    if (!this.timeSeriesData.has(deviceId)) {
      this.timeSeriesData.set(deviceId, []);
    }

    const series = this.timeSeriesData.get(deviceId)!;
    series.push(data);

    // Keep only recent data
    if (series.length > this.maxHistoryLength) {
      series.shift();
    }

    // Retrain periodically
    const now = Date.now();
    if (now - this.lastTrainingTime > this.trainingInterval && series.length >= 30) {
      this.lastTrainingTime = now;
      this.predictor.train(series).catch(console.error);
    }
  }

  async generatePredictions(deviceId: string): Promise<Prediction[]> {
    const series = this.timeSeriesData.get(deviceId);
    if (!series || series.length < 20) {
      return [];
    }

    const newPredictions = await this.predictor.predict(series);
    
    // Update predictions list
    this.predictions = [
      ...newPredictions,
      ...this.predictions.filter(p => p.timestamp > Date.now() - 60000)
    ].slice(0, 50);

    // Detect faults from predictions
    this.detectFaults(deviceId, newPredictions);

    return newPredictions;
  }

  private detectFaults(deviceId: string, predictions: Prediction[]): void {
    const now = Date.now();
    
    for (const pred of predictions) {
      if (pred.failureProbability > 0.5 && pred.severity !== 'low') {
        const existingFault = this.detectedFaults.find(
          f => f.predictedFailureTime === pred.predictedTime && Date.now() - f.detectedAt < 60000
        );

        if (!existingFault) {
          const fault: PredictiveFault = {
            id: `fault-${now}-${pred.minutesAhead}`,
            detectedAt: now,
            predictedFailureTime: pred.predictedTime,
            minutesUntilFailure: pred.minutesAhead,
            failureType: this.identifyFailureType(pred.metrics),
            confidence: pred.confidence.mean,
            affectedMetrics: this.getAffectedMetrics(pred.metrics),
            severity: pred.severity,
            recommendation: this.generateRecommendation(pred)
          };

          this.detectedFaults.push(fault);
        }
      }
    }

    // Remove old faults
    this.detectedFaults = this.detectedFaults.filter(
      f => f.predictedFailureTime > now - 60000
    );
  }

  private identifyFailureType(metrics: any): string {
    if (metrics.cpu > 85 && metrics.memory > 85) return 'System Resource Exhaustion';
    if (metrics.cpu > 85) return 'CPU Overload';
    if (metrics.memory > 85) return 'Memory Exhaustion';
    if (metrics.latency > 250) return 'Network Latency Spike';
    if (metrics.packetLoss > 2) return 'Packet Loss Event';
    if (metrics.errorRate > 1.5) return 'High Error Rate';
    return 'Performance Degradation';
  }

  private getAffectedMetrics(metrics: any): string[] {
    const affected: string[] = [];
    if (metrics.cpu > 75) affected.push('CPU');
    if (metrics.memory > 75) affected.push('Memory');
    if (metrics.latency > 200) affected.push('Latency');
    if (metrics.bandwidth < 100) affected.push('Bandwidth');
    if (metrics.packetLoss > 1) affected.push('Packet Loss');
    if (metrics.errorRate > 1) affected.push('Error Rate');
    return affected;
  }

  private generateRecommendation(pred: Prediction): string {
    const metrics = pred.metrics;
    const recommendations: string[] = [];

    if (metrics.cpu > 85) recommendations.push('Scale up CPU resources or optimize processes');
    if (metrics.memory > 85) recommendations.push('Increase memory allocation or clear caches');
    if (metrics.latency > 250) recommendations.push('Check network routes and reduce traffic load');
    if (metrics.packetLoss > 2) recommendations.push('Inspect network hardware and connections');
    if (metrics.errorRate > 1.5) recommendations.push('Review application logs and fix errors');

    return recommendations.join('. ') || 'Monitor system closely for changes';
  }

  getPredictions(minutesAhead?: number): Prediction[] {
    if (minutesAhead) {
      return this.predictions.filter(p => p.minutesAhead === minutesAhead);
    }
    return [...this.predictions];
  }

  getDetectedFaults(): PredictiveFault[] {
    return [...this.detectedFaults].sort((a, b) => a.minutesUntilFailure - b.minutesUntilFailure);
  }

  getStatistics() {
    return {
      totalPredictions: this.predictions.length,
      detectedFaults: this.detectedFaults.length,
      bySeverity: {
        critical: this.detectedFaults.filter(f => f.severity === 'critical').length,
        high: this.detectedFaults.filter(f => f.severity === 'high').length,
        medium: this.detectedFaults.filter(f => f.severity === 'medium').length,
        low: this.detectedFaults.filter(f => f.severity === 'low').length,
      },
      averageConfidence: this.detectedFaults.length > 0
        ? this.detectedFaults.reduce((sum, f) => sum + f.confidence, 0) / this.detectedFaults.length
        : 0
    };
  }

  clearHistory(): void {
    this.predictions = [];
    this.detectedFaults = [];
  }
}

export const predictiveFaultDetector = new PredictiveFaultDetector();
