// Fuzzy Logic Decision Engine for Network Optimization

export interface MembershipFunction {
  low: number;
  medium: number;
  high: number;
}

export interface FuzzyInput {
  latency: number;
  traffic: number;
  cpuUsage: number;
  bandwidth: number;
  packetLoss: number;
}

export interface FuzzyRule {
  condition: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

export interface FuzzyOutput {
  rules: FuzzyRule[];
  overallRecommendation: string;
  fuzzyValues: {
    latency: MembershipFunction;
    traffic: MembershipFunction;
    cpuUsage: MembershipFunction;
    bandwidth: MembershipFunction;
    packetLoss: MembershipFunction;
  };
}

// Membership functions - convert crisp values to fuzzy degrees
function triangularMembership(value: number, low: number, peak: number, high: number): number {
  if (value <= low || value >= high) return 0;
  if (value === peak) return 1;
  if (value < peak) return (value - low) / (peak - low);
  return (high - value) / (high - peak);
}

function trapezoidalMembership(value: number, a: number, b: number, c: number, d: number): number {
  if (value <= a || value >= d) return 0;
  if (value >= b && value <= c) return 1;
  if (value < b) return (value - a) / (b - a);
  return (d - value) / (d - c);
}

// Fuzzify latency (ms)
function fuzzifyLatency(latency: number): MembershipFunction {
  return {
    low: trapezoidalMembership(latency, 0, 0, 20, 50),
    medium: triangularMembership(latency, 30, 75, 120),
    high: trapezoidalMembership(latency, 100, 150, 500, 500),
  };
}

// Fuzzify traffic (Mbps)
function fuzzifyTraffic(traffic: number): MembershipFunction {
  return {
    low: trapezoidalMembership(traffic, 0, 0, 30, 60),
    medium: triangularMembership(traffic, 40, 70, 100),
    high: trapezoidalMembership(traffic, 80, 120, 200, 200),
  };
}

// Fuzzify CPU usage (%)
function fuzzifyCpuUsage(cpu: number): MembershipFunction {
  return {
    low: trapezoidalMembership(cpu, 0, 0, 30, 50),
    medium: triangularMembership(cpu, 40, 60, 80),
    high: trapezoidalMembership(cpu, 70, 85, 100, 100),
  };
}

// Fuzzify bandwidth utilization (%)
function fuzzifyBandwidth(bandwidth: number): MembershipFunction {
  return {
    low: trapezoidalMembership(bandwidth, 0, 0, 25, 45),
    medium: triangularMembership(bandwidth, 35, 55, 75),
    high: trapezoidalMembership(bandwidth, 65, 85, 100, 100),
  };
}

// Fuzzify packet loss (%)
function fuzzifyPacketLoss(loss: number): MembershipFunction {
  return {
    low: trapezoidalMembership(loss, 0, 0, 0.5, 1.5),
    medium: triangularMembership(loss, 1, 3, 5),
    high: trapezoidalMembership(loss, 4, 7, 20, 20),
  };
}

// Fuzzy inference engine - apply rules
function applyFuzzyRules(fuzzyValues: FuzzyOutput['fuzzyValues']): FuzzyRule[] {
  const rules: FuzzyRule[] = [];

  // Rule 1: High latency and high traffic -> Prioritize traffic shaping
  const rule1Strength = Math.min(fuzzyValues.latency.high, fuzzyValues.traffic.high);
  if (rule1Strength > 0.3) {
    rules.push({
      condition: 'High latency with high traffic detected',
      recommendation: 'Implement traffic shaping and QoS policies. Consider load balancing.',
      priority: 'critical',
      confidence: Math.round(rule1Strength * 100),
    });
  }

  // Rule 2: High CPU and medium traffic -> Optimize processing
  const rule2Strength = Math.min(fuzzyValues.cpuUsage.high, fuzzyValues.traffic.medium);
  if (rule2Strength > 0.3) {
    rules.push({
      condition: 'High CPU usage with moderate traffic',
      recommendation: 'Optimize packet processing algorithms. Consider hardware acceleration.',
      priority: 'high',
      confidence: Math.round(rule2Strength * 100),
    });
  }

  // Rule 3: High packet loss -> Check physical layer
  if (fuzzyValues.packetLoss.high > 0.4) {
    rules.push({
      condition: 'High packet loss detected',
      recommendation: 'Inspect physical connections and network interfaces. Check for interference.',
      priority: 'critical',
      confidence: Math.round(fuzzyValues.packetLoss.high * 100),
    });
  }

  // Rule 4: Medium latency and low bandwidth utilization -> Possible routing issue
  const rule4Strength = Math.min(fuzzyValues.latency.medium, fuzzyValues.bandwidth.low);
  if (rule4Strength > 0.3) {
    rules.push({
      condition: 'Moderate latency with low bandwidth utilization',
      recommendation: 'Review routing tables. Optimize network path selection.',
      priority: 'medium',
      confidence: Math.round(rule4Strength * 100),
    });
  }

  // Rule 5: Low latency and low traffic -> Optimal condition
  const rule5Strength = Math.min(fuzzyValues.latency.low, fuzzyValues.traffic.low);
  if (rule5Strength > 0.5) {
    rules.push({
      condition: 'Low latency with low traffic',
      recommendation: 'Network operating optimally. Maintain current configuration.',
      priority: 'low',
      confidence: Math.round(rule5Strength * 100),
    });
  }

  // Rule 6: High bandwidth utilization -> Capacity planning
  if (fuzzyValues.bandwidth.high > 0.5) {
    rules.push({
      condition: 'High bandwidth utilization detected',
      recommendation: 'Consider capacity upgrade. Implement bandwidth monitoring and alerting.',
      priority: 'high',
      confidence: Math.round(fuzzyValues.bandwidth.high * 100),
    });
  }

  // Rule 7: Medium CPU with high traffic -> Scale horizontally
  const rule7Strength = Math.min(fuzzyValues.cpuUsage.medium, fuzzyValues.traffic.high);
  if (rule7Strength > 0.3) {
    rules.push({
      condition: 'Moderate CPU usage with high traffic load',
      recommendation: 'Consider horizontal scaling. Deploy additional network nodes.',
      priority: 'high',
      confidence: Math.round(rule7Strength * 100),
    });
  }

  // Rule 8: Low packet loss and medium latency -> Fine-tune buffers
  const rule8Strength = Math.min(fuzzyValues.packetLoss.low, fuzzyValues.latency.medium);
  if (rule8Strength > 0.4) {
    rules.push({
      condition: 'Low packet loss with moderate latency',
      recommendation: 'Optimize buffer sizes. Review TCP window scaling parameters.',
      priority: 'medium',
      confidence: Math.round(rule8Strength * 100),
    });
  }

  // Rule 9: High CPU and high latency -> Critical bottleneck
  const rule9Strength = Math.min(fuzzyValues.cpuUsage.high, fuzzyValues.latency.high);
  if (rule9Strength > 0.4) {
    rules.push({
      condition: 'High CPU usage with high latency',
      recommendation: 'Critical bottleneck detected. Immediate intervention required. Offload processing.',
      priority: 'critical',
      confidence: Math.round(rule9Strength * 100),
    });
  }

  // Rule 10: Medium packet loss with medium traffic -> Network congestion
  const rule10Strength = Math.min(fuzzyValues.packetLoss.medium, fuzzyValues.traffic.medium);
  if (rule10Strength > 0.3) {
    rules.push({
      condition: 'Moderate packet loss with moderate traffic',
      recommendation: 'Potential network congestion. Implement congestion control mechanisms.',
      priority: 'high',
      confidence: Math.round(rule10Strength * 100),
    });
  }

  return rules.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// Defuzzification - generate overall recommendation
function defuzzify(rules: FuzzyRule[]): string {
  if (rules.length === 0) {
    return 'All network parameters within acceptable ranges. Continue monitoring.';
  }

  const criticalRules = rules.filter(r => r.priority === 'critical');
  const highRules = rules.filter(r => r.priority === 'high');

  if (criticalRules.length > 0) {
    return `Critical issues detected. Priority actions: ${criticalRules.map(r => r.recommendation).join(' ')}`;
  }

  if (highRules.length > 0) {
    return `High priority optimizations recommended: ${highRules[0].recommendation}`;
  }

  return `Network performance is acceptable. Consider: ${rules[0].recommendation}`;
}

// Main fuzzy logic engine
export function analyzeFuzzyLogic(input: FuzzyInput): FuzzyOutput {
  const fuzzyValues = {
    latency: fuzzifyLatency(input.latency),
    traffic: fuzzifyTraffic(input.traffic),
    cpuUsage: fuzzifyCpuUsage(input.cpuUsage),
    bandwidth: fuzzifyBandwidth(input.bandwidth),
    packetLoss: fuzzifyPacketLoss(input.packetLoss),
  };

  const rules = applyFuzzyRules(fuzzyValues);
  const overallRecommendation = defuzzify(rules);

  return {
    rules,
    overallRecommendation,
    fuzzyValues,
  };
}

// Generate sample network data for demonstration
export function generateSampleNetworkData(): FuzzyInput {
  return {
    latency: Math.random() * 200,
    traffic: Math.random() * 150,
    cpuUsage: Math.random() * 100,
    bandwidth: Math.random() * 100,
    packetLoss: Math.random() * 10,
  };
}
