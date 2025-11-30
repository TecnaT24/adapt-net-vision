import * as tf from '@tensorflow/tfjs';

export interface TrafficPattern {
  timestamp: number;
  packetSize: number;
  protocol: number; // 0: TCP, 1: UDP, 2: HTTP, 3: HTTPS
  sourcePort: number;
  destPort: number;
  bytesPerSecond: number;
  packetsPerSecond: number;
  connectionDuration: number;
}

export interface TrafficClassification {
  category: 'web' | 'video' | 'file_transfer' | 'gaming' | 'voip' | 'database' | 'email' | 'unknown';
  confidence: number;
  isAnomaly: boolean;
  anomalyScore: number;
  features: TrafficPattern;
}

export interface TrafficStats {
  total: number;
  byCategory: Record<string, number>;
  anomalies: number;
  avgConfidence: number;
}

class NeuralTrafficClassifier {
  private model: tf.LayersModel | null = null;
  private autoencoder: tf.LayersModel | null = null;
  private isModelReady = false;
  private classifications: TrafficClassification[] = [];
  private readonly maxHistorySize = 100;

  constructor() {
    this.initializeModels();
  }

  private async initializeModels() {
    try {
      // Create classification model (MLP for traffic categorization)
      const classificationModel = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [8], units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 8, activation: 'softmax' }) // 8 categories
        ]
      });

      classificationModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      // Create autoencoder for anomaly detection
      const encoder = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [8], units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 4, activation: 'relu' })
        ]
      });

      const decoder = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [4], units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 8, activation: 'sigmoid' })
        ]
      });

      const autoencoderInput = tf.input({ shape: [8] });
      const encoded = encoder.apply(autoencoderInput) as tf.SymbolicTensor;
      const decoded = decoder.apply(encoded) as tf.SymbolicTensor;
      
      const autoencoder = tf.model({ 
        inputs: autoencoderInput, 
        outputs: decoded 
      });

      autoencoder.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError'
      });

      // Train with synthetic data
      await this.trainModels(classificationModel, autoencoder);

      this.model = classificationModel;
      this.autoencoder = autoencoder;
      this.isModelReady = true;
    } catch (error) {
      console.error('Error initializing models:', error);
    }
  }

  private async trainModels(classificationModel: tf.LayersModel, autoencoder: tf.LayersModel) {
    // Generate synthetic training data
    const trainingSize = 1000;
    const features: number[][] = [];
    const labels: number[][] = [];

    for (let i = 0; i < trainingSize; i++) {
      const category = Math.floor(Math.random() * 8);
      const pattern = this.generateSyntheticPattern(category);
      features.push(this.normalizeFeatures(pattern));
      
      const label = new Array(8).fill(0);
      label[category] = 1;
      labels.push(label);
    }

    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);

    // Train classification model
    await classificationModel.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      verbose: 0,
      shuffle: true
    });

    // Train autoencoder for anomaly detection
    await autoencoder.fit(xs, xs, {
      epochs: 50,
      batchSize: 32,
      verbose: 0,
      shuffle: true
    });

    xs.dispose();
    ys.dispose();
  }

  private generateSyntheticPattern(category: number): TrafficPattern {
    const basePatterns = {
      0: { // web
        packetSize: 1500 + Math.random() * 500,
        protocol: Math.random() > 0.5 ? 2 : 3,
        sourcePort: 50000 + Math.floor(Math.random() * 15000),
        destPort: Math.random() > 0.5 ? 80 : 443,
        bytesPerSecond: 50000 + Math.random() * 200000,
        packetsPerSecond: 30 + Math.random() * 100,
        connectionDuration: 5 + Math.random() * 60
      },
      1: { // video
        packetSize: 1200 + Math.random() * 300,
        protocol: 1,
        sourcePort: 50000 + Math.floor(Math.random() * 15000),
        destPort: 443,
        bytesPerSecond: 500000 + Math.random() * 2000000,
        packetsPerSecond: 200 + Math.random() * 500,
        connectionDuration: 30 + Math.random() * 300
      },
      2: { // file_transfer
        packetSize: 1400 + Math.random() * 100,
        protocol: 0,
        sourcePort: 50000 + Math.floor(Math.random() * 15000),
        destPort: 21,
        bytesPerSecond: 1000000 + Math.random() * 5000000,
        packetsPerSecond: 500 + Math.random() * 1000,
        connectionDuration: 10 + Math.random() * 120
      },
      3: { // gaming
        packetSize: 100 + Math.random() * 200,
        protocol: 1,
        sourcePort: 50000 + Math.floor(Math.random() * 15000),
        destPort: 27015 + Math.floor(Math.random() * 100),
        bytesPerSecond: 10000 + Math.random() * 50000,
        packetsPerSecond: 50 + Math.random() * 100,
        connectionDuration: 600 + Math.random() * 1800
      },
      4: { // voip
        packetSize: 160 + Math.random() * 80,
        protocol: 1,
        sourcePort: 50000 + Math.floor(Math.random() * 15000),
        destPort: 5060,
        bytesPerSecond: 64000 + Math.random() * 64000,
        packetsPerSecond: 50 + Math.random() * 50,
        connectionDuration: 60 + Math.random() * 600
      },
      5: { // database
        packetSize: 500 + Math.random() * 500,
        protocol: 0,
        sourcePort: 50000 + Math.floor(Math.random() * 15000),
        destPort: Math.random() > 0.5 ? 3306 : 5432,
        bytesPerSecond: 100000 + Math.random() * 500000,
        packetsPerSecond: 100 + Math.random() * 300,
        connectionDuration: 1 + Math.random() * 10
      },
      6: { // email
        packetSize: 800 + Math.random() * 400,
        protocol: 0,
        sourcePort: 50000 + Math.floor(Math.random() * 15000),
        destPort: Math.random() > 0.5 ? 25 : 587,
        bytesPerSecond: 20000 + Math.random() * 80000,
        packetsPerSecond: 10 + Math.random() * 40,
        connectionDuration: 2 + Math.random() * 20
      },
      7: { // unknown
        packetSize: 500 + Math.random() * 1000,
        protocol: Math.floor(Math.random() * 4),
        sourcePort: 1024 + Math.floor(Math.random() * 64000),
        destPort: 1024 + Math.floor(Math.random() * 64000),
        bytesPerSecond: 10000 + Math.random() * 500000,
        packetsPerSecond: 10 + Math.random() * 200,
        connectionDuration: 1 + Math.random() * 100
      }
    };

    const pattern = basePatterns[category as keyof typeof basePatterns];
    return {
      timestamp: Date.now(),
      ...pattern
    };
  }

  private normalizeFeatures(pattern: TrafficPattern): number[] {
    return [
      pattern.packetSize / 2000,
      pattern.protocol / 3,
      pattern.sourcePort / 65535,
      pattern.destPort / 65535,
      Math.min(pattern.bytesPerSecond / 10000000, 1),
      Math.min(pattern.packetsPerSecond / 2000, 1),
      Math.min(pattern.connectionDuration / 3600, 1),
      Math.random() // noise feature
    ];
  }

  async classifyTraffic(pattern: TrafficPattern): Promise<TrafficClassification> {
    if (!this.isModelReady || !this.model || !this.autoencoder) {
      return {
        category: 'unknown',
        confidence: 0,
        isAnomaly: false,
        anomalyScore: 0,
        features: pattern
      };
    }

    const features = this.normalizeFeatures(pattern);
    const inputTensor = tf.tensor2d([features]);

    try {
      // Classification
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const probabilities = await prediction.data();
      const categoryIndex = probabilities.indexOf(Math.max(...Array.from(probabilities)));
      
      const categories: TrafficClassification['category'][] = [
        'web', 'video', 'file_transfer', 'gaming', 'voip', 'database', 'email', 'unknown'
      ];

      // Anomaly detection
      const reconstruction = this.autoencoder.predict(inputTensor) as tf.Tensor;
      const reconstructionError = tf.losses.meanSquaredError(inputTensor, reconstruction);
      const anomalyScore = await reconstructionError.data();
      const isAnomaly = anomalyScore[0] > 0.1; // threshold for anomaly

      const classification: TrafficClassification = {
        category: categories[categoryIndex],
        confidence: probabilities[categoryIndex],
        isAnomaly,
        anomalyScore: anomalyScore[0],
        features: pattern
      };

      this.classifications.unshift(classification);
      if (this.classifications.length > this.maxHistorySize) {
        this.classifications = this.classifications.slice(0, this.maxHistorySize);
      }

      inputTensor.dispose();
      prediction.dispose();
      reconstruction.dispose();
      reconstructionError.dispose();

      return classification;
    } catch (error) {
      console.error('Classification error:', error);
      inputTensor.dispose();
      return {
        category: 'unknown',
        confidence: 0,
        isAnomaly: false,
        anomalyScore: 0,
        features: pattern
      };
    }
  }

  getClassifications(limit?: number): TrafficClassification[] {
    return limit ? this.classifications.slice(0, limit) : [...this.classifications];
  }

  getStatistics(): TrafficStats {
    const byCategory: Record<string, number> = {};
    let totalConfidence = 0;
    let anomalies = 0;

    this.classifications.forEach(c => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      totalConfidence += c.confidence;
      if (c.isAnomaly) anomalies++;
    });

    return {
      total: this.classifications.length,
      byCategory,
      anomalies,
      avgConfidence: this.classifications.length > 0 ? totalConfidence / this.classifications.length : 0
    };
  }

  clearHistory() {
    this.classifications = [];
  }

  isReady(): boolean {
    return this.isModelReady;
  }
}

export const trafficClassifier = new NeuralTrafficClassifier();

export function generateRandomTraffic(): TrafficPattern {
  const categories = [0, 1, 2, 3, 4, 5, 6, 7];
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  // Use the same generation logic
  const classifier = new NeuralTrafficClassifier();
  return (classifier as any).generateSyntheticPattern(category);
}
