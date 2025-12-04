import { alertSystem } from './alertSystem';
import { incidentService } from './incidentService';

export type ThreatType =
  | 'ddos' 
  | 'sql_injection' 
  | 'xss' 
  | 'port_scan' 
  | 'brute_force' 
  | 'malware' 
  | 'data_exfiltration'
  | 'unauthorized_access';

export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ThreatStatus = 'active' | 'blocked' | 'monitored' | 'neutralized';

export interface FirewallRule {
  id: string;
  name: string;
  type: 'allow' | 'block';
  source: string; // IP or CIDR
  destination?: string;
  port?: number;
  protocol?: 'tcp' | 'udp' | 'icmp' | 'all';
  enabled: boolean;
  priority: number;
  createdAt: Date;
}

export interface SecurityThreat {
  id: string;
  type: ThreatType;
  severity: ThreatSeverity;
  status: ThreatStatus;
  sourceIp: string;
  targetIp: string;
  targetPort?: number;
  description: string;
  detectedAt: Date;
  neutralizedAt?: Date;
  attackPattern: string;
  confidence: number;
  metadata: {
    requestCount?: number;
    payload?: string;
    protocol?: string;
    [key: string]: any;
  };
}

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'threat_detected' | 'threat_blocked' | 'rule_triggered' | 'system_alert';
  severity: ThreatSeverity;
  message: string;
  details: any;
}

const ATTACK_PATTERNS = {
  sql_injection: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b.*\b(FROM|INTO|TABLE|DATABASE)\b)/gi,
    /(union.*select|select.*from.*where)/gi,
    /('|")\s*(OR|AND)\s*('|")\s*=\s*('|")/gi
  ],
  xss: [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi
  ],
  ddos: [
    { pattern: 'high_request_rate', threshold: 1000 }, // requests per minute
    { pattern: 'syn_flood', threshold: 500 }
  ],
  port_scan: [
    { pattern: 'sequential_ports', threshold: 10 }, // different ports in short time
    { pattern: 'multiple_closed_ports', threshold: 5 }
  ],
  brute_force: [
    { pattern: 'failed_login_attempts', threshold: 5 }, // in 5 minutes
    { pattern: 'password_spray', threshold: 10 }
  ]
};

class SecuritySystemManager {
  private threats: Map<string, SecurityThreat> = new Map();
  private firewallRules: Map<string, FirewallRule> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private listeners: Array<() => void> = [];
  private monitoringActive = false;
  private requestTracking: Map<string, number[]> = new Map(); // IP -> timestamps
  private portAccessTracking: Map<string, Set<number>> = new Map(); // IP -> ports accessed

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    const defaultRules: FirewallRule[] = [
      {
        id: 'rule_1',
        name: 'Block Known Malicious IPs',
        type: 'block',
        source: '192.168.100.0/24', // Example malicious range
        protocol: 'all',
        enabled: true,
        priority: 1,
        createdAt: new Date()
      },
      {
        id: 'rule_2',
        name: 'Block Suspicious Ports',
        type: 'block',
        source: '0.0.0.0/0',
        port: 23, // Telnet
        protocol: 'tcp',
        enabled: true,
        priority: 2,
        createdAt: new Date()
      },
      {
        id: 'rule_3',
        name: 'Allow HTTP/HTTPS',
        type: 'allow',
        source: '0.0.0.0/0',
        port: 443,
        protocol: 'tcp',
        enabled: true,
        priority: 10,
        createdAt: new Date()
      }
    ];

    defaultRules.forEach(rule => this.firewallRules.set(rule.id, rule));
  }

  startMonitoring() {
    this.monitoringActive = true;
    this.simulateTrafficMonitoring();
  }

  stopMonitoring() {
    this.monitoringActive = false;
  }

  isMonitoring() {
    return this.monitoringActive;
  }

  private simulateTrafficMonitoring() {
    if (!this.monitoringActive) return;

    // Simulate random security events
    if (Math.random() < 0.3) {
      this.generateRandomThreat();
    }

    setTimeout(() => this.simulateTrafficMonitoring(), 5000);
  }

  private generateRandomThreat() {
    const threatTypes: ThreatType[] = ['ddos', 'sql_injection', 'xss', 'port_scan', 'brute_force', 'malware'];
    const type = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    
    const sourceIp = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    const targetIp = `10.0.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    
    this.detectThreat({
      type,
      sourceIp,
      targetIp,
      targetPort: Math.floor(Math.random() * 65535),
      payload: this.generateMaliciousPayload(type)
    });
  }

  private generateMaliciousPayload(type: ThreatType): string {
    const payloads: Record<ThreatType, string[]> = {
      sql_injection: ["' OR '1'='1", "UNION SELECT * FROM users", "DROP TABLE users;"],
      xss: ["<script>alert('XSS')</script>", "<iframe src='evil.com'></iframe>"],
      ddos: ["SYN flood packet stream", "UDP amplification attack"],
      port_scan: ["Sequential port probe", "SYN scan detected"],
      brute_force: ["Multiple failed login attempts", "Password spray attack"],
      malware: ["Suspicious executable detected", "Ransomware signature match"],
      data_exfiltration: ["Large data transfer detected", "Unauthorized database dump"],
      unauthorized_access: ["Invalid credentials", "Privilege escalation attempt"]
    };
    
    const options = payloads[type];
    return options[Math.floor(Math.random() * options.length)];
  }

  detectThreat(params: {
    type: ThreatType;
    sourceIp: string;
    targetIp: string;
    targetPort?: number;
    payload?: string;
  }): SecurityThreat | null {
    const { type, sourceIp, targetIp, targetPort, payload } = params;

    // Check firewall rules first
    if (this.isBlockedByFirewall(sourceIp, targetPort)) {
      this.logSecurityEvent({
        type: 'rule_triggered',
        severity: 'medium',
        message: `Traffic blocked by firewall rule: ${sourceIp}`,
        details: { sourceIp, targetIp, targetPort }
      });
      return null;
    }

    // Analyze threat
    const confidence = this.calculateThreatConfidence(type, payload || '');
    const severity = this.determineSeverity(type, confidence);

    const threat: SecurityThreat = {
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      status: 'active',
      sourceIp,
      targetIp,
      targetPort,
      description: this.getThreatDescription(type),
      detectedAt: new Date(),
      attackPattern: payload || 'Unknown pattern',
      confidence,
      metadata: {
        requestCount: this.getRequestCount(sourceIp),
        payload,
        protocol: 'tcp'
      }
    };

    this.threats.set(threat.id, threat);

    // Log event
    this.logSecurityEvent({
      type: 'threat_detected',
      severity: threat.severity,
      message: `${type.replace('_', ' ').toUpperCase()} detected from ${sourceIp}`,
      details: threat
    });

    // Trigger alert
    alertSystem.checkThresholds(
      {
        severity: threat.severity,
        type: threat.type,
        confidence: threat.confidence
      },
      'expert'
    );

    // Auto-neutralize critical threats
    if (severity === 'critical' || severity === 'high') {
      this.neutralizeThreat(threat.id);
    }

    // Log to incident database
    incidentService.logSecurityThreat({
      type: threat.type.replace('_', ' ').toUpperCase(),
      severity: threat.severity,
      source: threat.sourceIp,
      target: threat.targetIp,
      description: threat.description,
      confidence: threat.confidence * 100,
      details: {
        threatId: threat.id,
        targetPort: threat.targetPort,
        attackPattern: threat.attackPattern,
        status: threat.status,
        recommendations: this.getRecommendations(type)
      }
    }).catch(console.error);

    this.notifyListeners();
    return threat;
  }

  private getRecommendations(type: ThreatType): string[] {
    const recommendations: Record<ThreatType, string[]> = {
      ddos: ['Rate limit incoming traffic', 'Enable DDoS protection', 'Contact ISP for upstream filtering'],
      sql_injection: ['Sanitize all user inputs', 'Use parameterized queries', 'Review database permissions'],
      xss: ['Implement Content Security Policy', 'Sanitize output encoding', 'Use HttpOnly cookies'],
      port_scan: ['Close unnecessary ports', 'Implement port knocking', 'Review firewall rules'],
      brute_force: ['Implement account lockout', 'Enable MFA', 'Use CAPTCHA'],
      malware: ['Isolate affected systems', 'Run full antivirus scan', 'Update security signatures'],
      data_exfiltration: ['Block suspicious outbound connections', 'Review data access logs', 'Encrypt sensitive data'],
      unauthorized_access: ['Rotate credentials', 'Review access controls', 'Enable audit logging']
    };
    return recommendations[type] || ['Review security logs', 'Monitor system behavior'];
  }

  private calculateThreatConfidence(type: ThreatType, payload: string): number {
    let confidence = 0.5;

    if (type === 'sql_injection' && ATTACK_PATTERNS.sql_injection.some(pattern => pattern.test(payload))) {
      confidence = 0.95;
    } else if (type === 'xss' && ATTACK_PATTERNS.xss.some(pattern => pattern.test(payload))) {
      confidence = 0.92;
    } else if (type === 'ddos') {
      confidence = 0.88;
    } else if (type === 'brute_force') {
      confidence = 0.85;
    } else {
      confidence = 0.6 + Math.random() * 0.3;
    }

    return Math.min(confidence, 0.99);
  }

  private determineSeverity(type: ThreatType, confidence: number): ThreatSeverity {
    if (confidence > 0.9) {
      return type === 'ddos' || type === 'data_exfiltration' || type === 'malware' ? 'critical' : 'high';
    } else if (confidence > 0.7) {
      return 'high';
    } else if (confidence > 0.5) {
      return 'medium';
    }
    return 'low';
  }

  private getThreatDescription(type: ThreatType): string {
    const descriptions: Record<ThreatType, string> = {
      ddos: 'Distributed Denial of Service attack detected - High volume traffic pattern',
      sql_injection: 'SQL Injection attempt detected - Malicious database query patterns',
      xss: 'Cross-Site Scripting attack detected - Malicious script injection attempt',
      port_scan: 'Port scanning activity detected - Potential reconnaissance attempt',
      brute_force: 'Brute force attack detected - Multiple authentication attempts',
      malware: 'Malware detected - Suspicious executable or signature match',
      data_exfiltration: 'Data exfiltration attempt - Unauthorized data transfer detected',
      unauthorized_access: 'Unauthorized access attempt - Invalid authentication or privilege escalation'
    };
    return descriptions[type];
  }

  neutralizeThreat(threatId: string): boolean {
    const threat = this.threats.get(threatId);
    if (!threat) return false;

    // Add firewall rule to block source
    const blockRule: FirewallRule = {
      id: `auto_block_${Date.now()}`,
      name: `Auto-block: ${threat.type} from ${threat.sourceIp}`,
      type: 'block',
      source: threat.sourceIp,
      protocol: 'all',
      enabled: true,
      priority: 1,
      createdAt: new Date()
    };

    this.firewallRules.set(blockRule.id, blockRule);

    // Update threat status
    threat.status = 'neutralized';
    threat.neutralizedAt = new Date();

    this.logSecurityEvent({
      type: 'threat_blocked',
      severity: threat.severity,
      message: `Threat neutralized: ${threat.type} from ${threat.sourceIp}`,
      details: { threat, blockRule }
    });

    this.notifyListeners();
    return true;
  }

  private isBlockedByFirewall(sourceIp: string, port?: number): boolean {
    const rules = Array.from(this.firewallRules.values())
      .filter(r => r.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of rules) {
      if (this.matchesRule(sourceIp, port, rule)) {
        return rule.type === 'block';
      }
    }

    return false;
  }

  private matchesRule(sourceIp: string, port: number | undefined, rule: FirewallRule): boolean {
    // Simple IP matching (in production, would use proper CIDR matching)
    if (rule.source !== '0.0.0.0/0' && !sourceIp.startsWith(rule.source.split('/')[0].substring(0, 7))) {
      return false;
    }

    if (rule.port && port && rule.port !== port) {
      return false;
    }

    return true;
  }

  private getRequestCount(sourceIp: string): number {
    return this.requestTracking.get(sourceIp)?.length || 0;
  }

  private logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event
    };

    this.securityEvents.unshift(securityEvent);
    
    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(0, 1000);
    }
  }

  // Firewall management
  addFirewallRule(rule: Omit<FirewallRule, 'id' | 'createdAt'>): FirewallRule {
    const newRule: FirewallRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    
    this.firewallRules.set(newRule.id, newRule);
    this.notifyListeners();
    return newRule;
  }

  updateFirewallRule(id: string, updates: Partial<FirewallRule>): boolean {
    const rule = this.firewallRules.get(id);
    if (!rule) return false;

    Object.assign(rule, updates);
    this.notifyListeners();
    return true;
  }

  removeFirewallRule(id: string): boolean {
    const deleted = this.firewallRules.delete(id);
    if (deleted) this.notifyListeners();
    return deleted;
  }

  getFirewallRules(): FirewallRule[] {
    return Array.from(this.firewallRules.values()).sort((a, b) => a.priority - b.priority);
  }

  // Data retrieval
  getThreats(filter?: { status?: ThreatStatus; severity?: ThreatSeverity }): SecurityThreat[] {
    let threats = Array.from(this.threats.values()).sort((a, b) => 
      b.detectedAt.getTime() - a.detectedAt.getTime()
    );

    if (filter?.status) {
      threats = threats.filter(t => t.status === filter.status);
    }
    if (filter?.severity) {
      threats = threats.filter(t => t.severity === filter.severity);
    }

    return threats;
  }

  getSecurityEvents(limit = 100): SecurityEvent[] {
    return this.securityEvents.slice(0, limit);
  }

  getStatistics() {
    const threats = Array.from(this.threats.values());
    
    return {
      total: threats.length,
      active: threats.filter(t => t.status === 'active').length,
      neutralized: threats.filter(t => t.status === 'neutralized').length,
      blocked: threats.filter(t => t.status === 'blocked').length,
      bySeverity: {
        critical: threats.filter(t => t.severity === 'critical').length,
        high: threats.filter(t => t.severity === 'high').length,
        medium: threats.filter(t => t.severity === 'medium').length,
        low: threats.filter(t => t.severity === 'low').length
      },
      byType: threats.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      firewallRules: {
        total: this.firewallRules.size,
        enabled: Array.from(this.firewallRules.values()).filter(r => r.enabled).length,
        blocked: Array.from(this.firewallRules.values()).filter(r => r.type === 'block').length
      }
    };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  clearThreats() {
    this.threats.clear();
    this.notifyListeners();
  }

  clearEvents() {
    this.securityEvents = [];
    this.notifyListeners();
  }
}

export const securitySystem = new SecuritySystemManager();
