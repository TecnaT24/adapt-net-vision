// Expert System for Network Troubleshooting and Root Cause Analysis

export interface Fact {
  id: string;
  description: string;
  value: boolean | number | string;
  confidence: number; // 0-1
}

export interface Rule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  conclusion: Conclusion;
  priority: number;
}

export interface RuleCondition {
  factId: string;
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains' | 'notEquals';
  value: boolean | number | string;
}

export interface Conclusion {
  diagnosis: string;
  rootCause: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  troubleshootingSteps: string[];
  preventiveMeasures: string[];
  confidence: number;
}

export interface DiagnosisResult {
  matchedRules: Array<Rule & { matchConfidence: number }>;
  primaryDiagnosis: Conclusion | null;
  alternativeDiagnoses: Conclusion[];
  factsSummary: Fact[];
}

// Knowledge Base - Network Troubleshooting Rules
export const knowledgeBase: Rule[] = [
  {
    id: 'R1',
    name: 'High Latency with Packet Loss',
    conditions: [
      { factId: 'latency', operator: 'greaterThan', value: 100 },
      { factId: 'packetLoss', operator: 'greaterThan', value: 3 },
    ],
    conclusion: {
      diagnosis: 'Network Congestion or Physical Link Issues',
      rootCause: 'Combination of high latency and packet loss indicates network congestion, faulty cables, or overloaded network equipment.',
      severity: 'critical',
      troubleshootingSteps: [
        '1. Check physical connections and cable integrity',
        '2. Inspect network switches and router interfaces for errors',
        '3. Verify no bandwidth-intensive applications are saturating the link',
        '4. Review Quality of Service (QoS) policies',
        '5. Use traceroute to identify where latency increases',
        '6. Monitor interface statistics for CRC errors and collisions',
      ],
      preventiveMeasures: [
        'Implement traffic shaping and QoS policies',
        'Upgrade network infrastructure if consistently overloaded',
        'Schedule regular cable and connector inspections',
        'Deploy network monitoring with alerting',
      ],
      confidence: 0.95,
    },
    priority: 10,
  },
  {
    id: 'R2',
    name: 'High CPU with Normal Traffic',
    conditions: [
      { factId: 'cpuUsage', operator: 'greaterThan', value: 85 },
      { factId: 'traffic', operator: 'lessThan', value: 60 },
    ],
    conclusion: {
      diagnosis: 'Inefficient Packet Processing or CPU-Intensive Operations',
      rootCause: 'High CPU usage without corresponding high traffic suggests inefficient routing algorithms, excessive logging, or security scanning overhead.',
      severity: 'high',
      troubleshootingSteps: [
        '1. Identify top CPU-consuming processes using system monitoring tools',
        '2. Review routing table size and complexity',
        '3. Check if deep packet inspection or IDS/IPS is enabled',
        '4. Disable unnecessary logging or reduce log verbosity',
        '5. Verify firmware/software is up to date',
        '6. Consider hardware acceleration for packet processing',
      ],
      preventiveMeasures: [
        'Optimize routing protocols and reduce routing table size',
        'Offload CPU-intensive tasks to dedicated hardware',
        'Implement selective logging strategies',
        'Regular performance audits of network devices',
      ],
      confidence: 0.88,
    },
    priority: 8,
  },
  {
    id: 'R3',
    name: 'High Bandwidth Utilization',
    conditions: [
      { factId: 'bandwidth', operator: 'greaterThan', value: 80 },
    ],
    conclusion: {
      diagnosis: 'Bandwidth Saturation',
      rootCause: 'Link is operating near or at capacity, which can lead to congestion, increased latency, and packet loss.',
      severity: 'high',
      troubleshootingSteps: [
        '1. Identify top bandwidth consumers using NetFlow or sFlow',
        '2. Check for unauthorized or unexpected traffic',
        '3. Verify backup or bulk transfer jobs are not running during peak hours',
        '4. Review application traffic patterns',
        '5. Implement bandwidth throttling for non-critical applications',
        '6. Consider link upgrade or load balancing',
      ],
      preventiveMeasures: [
        'Establish bandwidth reservation policies',
        'Schedule large data transfers during off-peak hours',
        'Implement traffic prioritization',
        'Plan capacity upgrades based on growth trends',
      ],
      confidence: 0.92,
    },
    priority: 9,
  },
  {
    id: 'R4',
    name: 'Intermittent Connectivity',
    conditions: [
      { factId: 'packetLoss', operator: 'greaterThan', value: 1 },
      { factId: 'packetLoss', operator: 'lessThan', value: 5 },
      { factId: 'jitter', operator: 'greaterThan', value: 10 },
    ],
    conclusion: {
      diagnosis: 'Intermittent Network Issues',
      rootCause: 'Sporadic packet loss with jitter suggests unstable connections, possibly due to wireless interference, failing hardware, or flapping links.',
      severity: 'medium',
      troubleshootingSteps: [
        '1. Monitor for interface flapping in system logs',
        '2. Check wireless signal strength and interference (if applicable)',
        '3. Inspect for loose connections or damaged cables',
        '4. Review environmental factors (temperature, humidity)',
        '5. Test with different cables or ports to isolate hardware issues',
        '6. Check for spanning tree convergence issues',
      ],
      preventiveMeasures: [
        'Implement redundant links with automatic failover',
        'Use enterprise-grade equipment with better reliability',
        'Regular maintenance and hardware health checks',
        'Deploy environmental monitoring in critical areas',
      ],
      confidence: 0.80,
    },
    priority: 7,
  },
  {
    id: 'R5',
    name: 'Authentication Failures',
    conditions: [
      { factId: 'authFailures', operator: 'greaterThan', value: 10 },
    ],
    conclusion: {
      diagnosis: 'Authentication or Security Issues',
      rootCause: 'Repeated authentication failures may indicate brute-force attacks, misconfigured credentials, or RADIUS/TACACS+ server issues.',
      severity: 'critical',
      troubleshootingSteps: [
        '1. Review authentication logs for patterns',
        '2. Verify authentication server connectivity',
        '3. Check for account lockouts or expired passwords',
        '4. Inspect for potential security breaches or brute-force attempts',
        '5. Validate network time synchronization (NTP)',
        '6. Test with known-good credentials',
      ],
      preventiveMeasures: [
        'Implement account lockout policies',
        'Deploy multi-factor authentication',
        'Use intrusion prevention systems',
        'Regular security audits and password rotations',
      ],
      confidence: 0.93,
    },
    priority: 10,
  },
  {
    id: 'R6',
    name: 'DNS Resolution Failures',
    conditions: [
      { factId: 'dnsFailures', operator: 'greaterThan', value: 5 },
    ],
    conclusion: {
      diagnosis: 'DNS Service Disruption',
      rootCause: 'DNS resolution failures prevent applications from resolving domain names, causing connectivity issues that appear as application failures.',
      severity: 'high',
      troubleshootingSteps: [
        '1. Verify DNS server reachability',
        '2. Check DNS server response times',
        '3. Test with alternative DNS servers (e.g., 8.8.8.8)',
        '4. Review DNS server logs for errors',
        '5. Verify DNS zone files and records',
        '6. Check for DNS cache poisoning or attacks',
      ],
      preventiveMeasures: [
        'Deploy redundant DNS servers',
        'Implement DNS monitoring and alerting',
        'Use DNSSEC for enhanced security',
        'Regular DNS infrastructure health checks',
      ],
      confidence: 0.90,
    },
    priority: 9,
  },
  {
    id: 'R7',
    name: 'Memory Exhaustion',
    conditions: [
      { factId: 'memoryUsage', operator: 'greaterThan', value: 90 },
    ],
    conclusion: {
      diagnosis: 'Memory Resource Exhaustion',
      rootCause: 'High memory usage can cause system instability, dropped connections, and degraded performance as the system struggles to process traffic.',
      severity: 'critical',
      troubleshootingSteps: [
        '1. Identify memory-consuming processes',
        '2. Check for memory leaks in network software',
        '3. Review routing table and ARP cache size',
        '4. Clear unnecessary cache entries',
        '5. Restart affected services if safe to do so',
        '6. Consider memory upgrade if consistently high',
      ],
      preventiveMeasures: [
        'Regular memory usage monitoring',
        'Implement automatic cache cleanup policies',
        'Keep firmware and software updated',
        'Size equipment appropriately for workload',
      ],
      confidence: 0.94,
    },
    priority: 10,
  },
  {
    id: 'R8',
    name: 'Optimal Performance',
    conditions: [
      { factId: 'latency', operator: 'lessThan', value: 30 },
      { factId: 'packetLoss', operator: 'lessThan', value: 0.5 },
      { factId: 'cpuUsage', operator: 'lessThan', value: 50 },
      { factId: 'bandwidth', operator: 'lessThan', value: 60 },
    ],
    conclusion: {
      diagnosis: 'Network Operating Optimally',
      rootCause: 'All network parameters are within healthy ranges. No issues detected.',
      severity: 'low',
      troubleshootingSteps: [
        '1. Continue routine monitoring',
        '2. Review historical trends for capacity planning',
        '3. Document current baseline performance',
      ],
      preventiveMeasures: [
        'Maintain current monitoring practices',
        'Conduct periodic reviews of network health',
        'Stay proactive with capacity planning',
      ],
      confidence: 0.85,
    },
    priority: 1,
  },
  {
    id: 'R9',
    name: 'Asymmetric Routing',
    conditions: [
      { factId: 'latency', operator: 'greaterThan', value: 60 },
      { factId: 'jitter', operator: 'greaterThan', value: 15 },
      { factId: 'packetLoss', operator: 'lessThan', value: 2 },
    ],
    conclusion: {
      diagnosis: 'Potential Asymmetric Routing or Path Issues',
      rootCause: 'High latency with jitter but low packet loss suggests packets are taking suboptimal paths or experiencing variable routing.',
      severity: 'medium',
      troubleshootingSteps: [
        '1. Perform traceroute in both directions',
        '2. Check routing tables on all hops',
        '3. Verify BGP path selection if applicable',
        '4. Review routing protocol metrics and preferences',
        '5. Check for route flapping',
        '6. Validate link costs and path selection criteria',
      ],
      preventiveMeasures: [
        'Implement consistent routing policies',
        'Use BFD for faster routing convergence',
        'Document and standardize routing architecture',
        'Regular routing table audits',
      ],
      confidence: 0.78,
    },
    priority: 6,
  },
  {
    id: 'R10',
    name: 'Security Threat Detection',
    conditions: [
      { factId: 'trafficAnomaly', operator: 'equals', value: true },
      { factId: 'unusualPorts', operator: 'equals', value: true },
    ],
    conclusion: {
      diagnosis: 'Potential Security Threat or Anomalous Traffic',
      rootCause: 'Unusual traffic patterns and port activity may indicate malware, DDoS attacks, or unauthorized network access.',
      severity: 'critical',
      troubleshootingSteps: [
        '1. Isolate affected systems immediately',
        '2. Capture and analyze suspicious traffic',
        '3. Review firewall and IDS/IPS logs',
        '4. Check for indicators of compromise (IOCs)',
        '5. Verify all security patches are applied',
        '6. Conduct security scan on affected devices',
        '7. Engage incident response team if available',
      ],
      preventiveMeasures: [
        'Deploy intrusion detection and prevention systems',
        'Implement network segmentation',
        'Regular security assessments and penetration testing',
        'Keep all systems patched and updated',
        'Employee security awareness training',
      ],
      confidence: 0.87,
    },
    priority: 10,
  },
];

// Inference Engine
export class InferenceEngine {
  private facts: Map<string, Fact>;
  private rules: Rule[];

  constructor(rules: Rule[] = knowledgeBase) {
    this.facts = new Map();
    this.rules = rules.sort((a, b) => b.priority - a.priority);
  }

  addFact(fact: Fact): void {
    this.facts.set(fact.id, fact);
  }

  addFacts(facts: Fact[]): void {
    facts.forEach(fact => this.addFact(fact));
  }

  private evaluateCondition(condition: RuleCondition): boolean {
    const fact = this.facts.get(condition.factId);
    if (!fact) return false;

    switch (condition.operator) {
      case 'equals':
        return fact.value === condition.value;
      case 'notEquals':
        return fact.value !== condition.value;
      case 'greaterThan':
        return typeof fact.value === 'number' && typeof condition.value === 'number'
          ? fact.value > condition.value
          : false;
      case 'lessThan':
        return typeof fact.value === 'number' && typeof condition.value === 'number'
          ? fact.value < condition.value
          : false;
      case 'contains':
        return typeof fact.value === 'string' && typeof condition.value === 'string'
          ? fact.value.includes(condition.value)
          : false;
      default:
        return false;
    }
  }

  private evaluateRule(rule: Rule): { matches: boolean; confidence: number } {
    const conditionResults = rule.conditions.map(cond => ({
      result: this.evaluateCondition(cond),
      fact: this.facts.get(cond.factId),
    }));

    const allMatch = conditionResults.every(cr => cr.result);
    
    // Calculate confidence based on fact confidences
    const avgFactConfidence = conditionResults.reduce(
      (sum, cr) => sum + (cr.fact?.confidence || 0),
      0
    ) / conditionResults.length;

    const matchConfidence = allMatch 
      ? (avgFactConfidence * rule.conclusion.confidence)
      : 0;

    return { matches: allMatch, confidence: matchConfidence };
  }

  infer(): DiagnosisResult {
    const matchedRules: Array<Rule & { matchConfidence: number }> = [];

    for (const rule of this.rules) {
      const evaluation = this.evaluateRule(rule);
      if (evaluation.matches) {
        matchedRules.push({
          ...rule,
          matchConfidence: evaluation.confidence,
        });
      }
    }

    // Sort by confidence
    matchedRules.sort((a, b) => b.matchConfidence - a.matchConfidence);

    return {
      matchedRules,
      primaryDiagnosis: matchedRules.length > 0 ? matchedRules[0].conclusion : null,
      alternativeDiagnoses: matchedRules.slice(1, 4).map(r => r.conclusion),
      factsSummary: Array.from(this.facts.values()),
    };
  }

  reset(): void {
    this.facts.clear();
  }
}

// Generate sample network data for testing
export function generateNetworkFacts(): Fact[] {
  return [
    {
      id: 'latency',
      description: 'Current network latency',
      value: Math.random() * 200,
      confidence: 0.95,
    },
    {
      id: 'packetLoss',
      description: 'Packet loss percentage',
      value: Math.random() * 10,
      confidence: 0.90,
    },
    {
      id: 'cpuUsage',
      description: 'CPU utilization percentage',
      value: Math.random() * 100,
      confidence: 0.98,
    },
    {
      id: 'bandwidth',
      description: 'Bandwidth utilization percentage',
      value: Math.random() * 100,
      confidence: 0.92,
    },
    {
      id: 'memoryUsage',
      description: 'Memory utilization percentage',
      value: Math.random() * 100,
      confidence: 0.97,
    },
    {
      id: 'jitter',
      description: 'Network jitter in milliseconds',
      value: Math.random() * 30,
      confidence: 0.88,
    },
    {
      id: 'authFailures',
      description: 'Authentication failure count',
      value: Math.floor(Math.random() * 20),
      confidence: 1.0,
    },
    {
      id: 'dnsFailures',
      description: 'DNS resolution failure count',
      value: Math.floor(Math.random() * 15),
      confidence: 1.0,
    },
    {
      id: 'trafficAnomaly',
      description: 'Unusual traffic pattern detected',
      value: Math.random() > 0.7,
      confidence: 0.82,
    },
    {
      id: 'unusualPorts',
      description: 'Unusual port activity detected',
      value: Math.random() > 0.8,
      confidence: 0.85,
    },
    {
      id: 'traffic',
      description: 'Current traffic in Mbps',
      value: Math.random() * 150,
      confidence: 0.94,
    },
  ];
}
