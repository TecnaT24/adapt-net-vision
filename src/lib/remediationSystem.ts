import { securitySystem, SecurityThreat, ThreatType } from './securitySystem';
import { alertSystem } from './alertSystem';

export type RemediationActionType = 
  | 'block_ip'
  | 'restart_service'
  | 'clear_cache'
  | 'adjust_bandwidth'
  | 'update_firewall'
  | 'isolate_node'
  | 'rollback_config'
  | 'kill_process'
  | 'flush_dns'
  | 'reset_connection';

export type RemediationStatus = 'pending' | 'executing' | 'success' | 'failed' | 'rolled_back';
export type RemediationMode = 'automatic' | 'manual';

export interface RemediationAction {
  id: string;
  type: RemediationActionType;
  status: RemediationStatus;
  mode: RemediationMode;
  trigger: {
    type: 'threat' | 'anomaly' | 'prediction' | 'manual';
    id?: string;
    description: string;
  };
  target: {
    ip?: string;
    service?: string;
    node?: string;
    resource?: string;
  };
  description: string;
  executedAt: Date;
  completedAt?: Date;
  duration?: number;
  success: boolean;
  error?: string;
  rollbackable: boolean;
  rolledBack?: boolean;
  metadata: {
    beforeState?: any;
    afterState?: any;
    changes?: string[];
    [key: string]: any;
  };
}

export interface RemediationPolicy {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  condition: {
    triggerType: 'threat' | 'anomaly' | 'prediction';
    threatTypes?: ThreatType[];
    anomalyThreshold?: number;
    predictionConfidence?: number;
  };
  action: RemediationActionType;
  autoExecute: boolean;
  requiresApproval: boolean;
  cooldownMinutes: number;
  maxRetries: number;
}

class AutomatedRemediationSystem {
  private actions: Map<string, RemediationAction> = new Map();
  private policies: Map<string, RemediationPolicy> = new Map();
  private listeners: Array<() => void> = [];
  private executionQueue: string[] = [];
  private isProcessing = false;
  private lastExecutionTime: Map<string, Date> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
    this.startMonitoring();
  }

  private initializeDefaultPolicies() {
    const defaultPolicies: RemediationPolicy[] = [
      {
        id: 'policy_1',
        name: 'Auto-Block Critical Threats',
        enabled: true,
        priority: 1,
        condition: {
          triggerType: 'threat',
          threatTypes: ['ddos', 'sql_injection', 'malware', 'data_exfiltration']
        },
        action: 'block_ip',
        autoExecute: true,
        requiresApproval: false,
        cooldownMinutes: 5,
        maxRetries: 3
      },
      {
        id: 'policy_2',
        name: 'Restart Failed Services',
        enabled: true,
        priority: 2,
        condition: {
          triggerType: 'anomaly',
          anomalyThreshold: 0.85
        },
        action: 'restart_service',
        autoExecute: true,
        requiresApproval: false,
        cooldownMinutes: 15,
        maxRetries: 2
      },
      {
        id: 'policy_3',
        name: 'Clear Cache on High Load',
        enabled: true,
        priority: 3,
        condition: {
          triggerType: 'prediction',
          predictionConfidence: 0.80
        },
        action: 'clear_cache',
        autoExecute: true,
        requiresApproval: false,
        cooldownMinutes: 30,
        maxRetries: 1
      },
      {
        id: 'policy_4',
        name: 'Adjust Bandwidth for Port Scans',
        enabled: true,
        priority: 4,
        condition: {
          triggerType: 'threat',
          threatTypes: ['port_scan', 'brute_force']
        },
        action: 'adjust_bandwidth',
        autoExecute: false,
        requiresApproval: true,
        cooldownMinutes: 10,
        maxRetries: 2
      }
    ];

    defaultPolicies.forEach(policy => this.policies.set(policy.id, policy));
  }

  private startMonitoring() {
    // Monitor security threats
    securitySystem.subscribe(() => {
      const activeThreats = securitySystem.getThreats({ status: 'active' });
      activeThreats.forEach(threat => {
        this.evaluateThreatForRemediation(threat);
      });
    });

    // Process queue
    setInterval(() => this.processQueue(), 2000);
  }

  private evaluateThreatForRemediation(threat: SecurityThreat) {
    const applicablePolicies = Array.from(this.policies.values())
      .filter(p => p.enabled)
      .filter(p => p.condition.triggerType === 'threat')
      .filter(p => !p.condition.threatTypes || p.condition.threatTypes.includes(threat.type))
      .sort((a, b) => a.priority - b.priority);

    applicablePolicies.forEach(policy => {
      if (this.shouldExecutePolicy(policy)) {
        this.createRemediationAction({
          type: policy.action,
          mode: policy.autoExecute ? 'automatic' : 'manual',
          trigger: {
            type: 'threat',
            id: threat.id,
            description: `${threat.type} from ${threat.sourceIp}`
          },
          target: {
            ip: threat.sourceIp,
            service: this.getServiceFromThreat(threat)
          },
          policy
        });
      }
    });
  }

  private shouldExecutePolicy(policy: RemediationPolicy): boolean {
    const lastExecution = this.lastExecutionTime.get(policy.id);
    if (!lastExecution) return true;

    const cooldownMs = policy.cooldownMinutes * 60 * 1000;
    const timeSinceLastExecution = Date.now() - lastExecution.getTime();
    return timeSinceLastExecution >= cooldownMs;
  }

  private getServiceFromThreat(threat: SecurityThreat): string {
    if (threat.targetPort === 80 || threat.targetPort === 443) return 'web_server';
    if (threat.targetPort === 22) return 'ssh_server';
    if (threat.targetPort === 3306) return 'database_server';
    if (threat.targetPort === 6379) return 'redis_cache';
    return 'unknown_service';
  }

  private createRemediationAction(params: {
    type: RemediationActionType;
    mode: RemediationMode;
    trigger: RemediationAction['trigger'];
    target: RemediationAction['target'];
    policy: RemediationPolicy;
  }) {
    const action: RemediationAction = {
      id: `remediation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: params.type,
      status: params.mode === 'automatic' ? 'pending' : 'pending',
      mode: params.mode,
      trigger: params.trigger,
      target: params.target,
      description: this.getActionDescription(params.type, params.target),
      executedAt: new Date(),
      success: false,
      rollbackable: this.isRollbackable(params.type),
      metadata: {}
    };

    this.actions.set(action.id, action);

    // Auto-execute if policy allows
    if (params.mode === 'automatic') {
      this.executionQueue.push(action.id);
    }

    this.notifyListeners();
    return action;
  }

  private getActionDescription(type: RemediationActionType, target: RemediationAction['target']): string {
    const descriptions: Record<RemediationActionType, string> = {
      block_ip: `Block IP address ${target.ip}`,
      restart_service: `Restart ${target.service || 'service'}`,
      clear_cache: `Clear cache for ${target.resource || 'system'}`,
      adjust_bandwidth: `Adjust bandwidth limits for ${target.ip || 'network'}`,
      update_firewall: `Update firewall rules`,
      isolate_node: `Isolate node ${target.node}`,
      rollback_config: `Rollback configuration changes`,
      kill_process: `Terminate suspicious process`,
      flush_dns: `Flush DNS cache`,
      reset_connection: `Reset network connection for ${target.ip || 'node'}`
    };
    return descriptions[type];
  }

  private isRollbackable(type: RemediationActionType): boolean {
    const rollbackableTypes: RemediationActionType[] = [
      'block_ip', 'adjust_bandwidth', 'update_firewall', 'isolate_node', 'rollback_config'
    ];
    return rollbackableTypes.includes(type);
  }

  private async processQueue() {
    if (this.isProcessing || this.executionQueue.length === 0) return;

    this.isProcessing = true;
    const actionId = this.executionQueue.shift()!;
    
    try {
      await this.executeAction(actionId);
    } catch (error) {
      console.error('Error processing remediation action:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async executeAction(actionId: string): Promise<boolean> {
    const action = this.actions.get(actionId);
    if (!action) return false;

    action.status = 'executing';
    this.notifyListeners();

    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));

    try {
      // Execute the remediation action
      const result = await this.performRemediationAction(action);
      
      action.status = result.success ? 'success' : 'failed';
      action.success = result.success;
      action.completedAt = new Date();
      action.duration = action.completedAt.getTime() - action.executedAt.getTime();
      action.error = result.error;
      action.metadata = {
        ...action.metadata,
        ...result.metadata
      };

      // Update last execution time
      const relatedPolicies = Array.from(this.policies.values())
        .filter(p => p.action === action.type);
      relatedPolicies.forEach(policy => {
        this.lastExecutionTime.set(policy.id, new Date());
      });

      // Log to alert system
      if (!result.success) {
        alertSystem.checkThresholds(
          {
            severity: 'high',
            type: 'remediation_failed',
            confidence: 0.9
          },
          'expert'
        );
      }

      this.notifyListeners();
      return result.success;
    } catch (error) {
      action.status = 'failed';
      action.success = false;
      action.completedAt = new Date();
      action.duration = action.completedAt.getTime() - action.executedAt.getTime();
      action.error = String(error);
      this.notifyListeners();
      return false;
    }
  }

  private async performRemediationAction(action: RemediationAction): Promise<{
    success: boolean;
    error?: string;
    metadata?: any;
  }> {
    // Simulate different remediation actions
    const successRate = 0.85; // 85% success rate
    const success = Math.random() < successRate;

    const metadata: any = {
      beforeState: {},
      afterState: {},
      changes: []
    };

    switch (action.type) {
      case 'block_ip':
        if (action.target.ip) {
          // Add firewall rule via security system
          securitySystem.addFirewallRule({
            name: `Auto-block: ${action.target.ip}`,
            type: 'block',
            source: action.target.ip,
            protocol: 'all',
            enabled: true,
            priority: 1
          });
          metadata.changes.push(`Blocked IP ${action.target.ip} in firewall`);
        }
        break;

      case 'restart_service':
        metadata.changes.push(`Service ${action.target.service} restarted`);
        metadata.beforeState = { status: 'failed', uptime: 0 };
        metadata.afterState = { status: 'running', uptime: Date.now() };
        break;

      case 'clear_cache':
        metadata.changes.push(`Cache cleared for ${action.target.resource || 'system'}`);
        metadata.beforeState = { cacheSize: '2.4GB', entries: 15000 };
        metadata.afterState = { cacheSize: '0MB', entries: 0 };
        break;

      case 'adjust_bandwidth':
        metadata.changes.push(`Bandwidth adjusted for ${action.target.ip || 'network'}`);
        metadata.beforeState = { limit: 'unlimited' };
        metadata.afterState = { limit: '100Mbps' };
        break;

      case 'update_firewall':
        metadata.changes.push('Firewall rules updated');
        break;

      case 'isolate_node':
        metadata.changes.push(`Node ${action.target.node} isolated from network`);
        break;

      case 'rollback_config':
        metadata.changes.push('Configuration rolled back to previous state');
        break;

      case 'kill_process':
        metadata.changes.push('Suspicious process terminated');
        break;

      case 'flush_dns':
        metadata.changes.push('DNS cache flushed');
        break;

      case 'reset_connection':
        metadata.changes.push(`Connection reset for ${action.target.ip || 'node'}`);
        break;
    }

    return {
      success,
      error: success ? undefined : 'Remediation action failed due to network constraints',
      metadata
    };
  }

  async rollbackAction(actionId: string): Promise<boolean> {
    const action = this.actions.get(actionId);
    if (!action || !action.rollbackable || action.rolledBack) return false;

    // Perform rollback
    action.rolledBack = true;
    action.status = 'rolled_back';
    action.metadata.rollbackAt = new Date();

    this.notifyListeners();
    return true;
  }

  // Manual execution
  manualExecute(params: {
    type: RemediationActionType;
    target: RemediationAction['target'];
    description: string;
  }): RemediationAction {
    const action: RemediationAction = {
      id: `remediation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: params.type,
      status: 'pending',
      mode: 'manual',
      trigger: {
        type: 'manual',
        description: params.description
      },
      target: params.target,
      description: this.getActionDescription(params.type, params.target),
      executedAt: new Date(),
      success: false,
      rollbackable: this.isRollbackable(params.type),
      metadata: {}
    };

    this.actions.set(action.id, action);
    this.executionQueue.push(action.id);
    this.notifyListeners();
    return action;
  }

  // Policy management
  addPolicy(policy: Omit<RemediationPolicy, 'id'>): RemediationPolicy {
    const newPolicy: RemediationPolicy = {
      ...policy,
      id: `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    this.policies.set(newPolicy.id, newPolicy);
    this.notifyListeners();
    return newPolicy;
  }

  updatePolicy(id: string, updates: Partial<RemediationPolicy>): boolean {
    const policy = this.policies.get(id);
    if (!policy) return false;
    Object.assign(policy, updates);
    this.notifyListeners();
    return true;
  }

  removePolicy(id: string): boolean {
    const deleted = this.policies.delete(id);
    if (deleted) this.notifyListeners();
    return deleted;
  }

  getPolicies(): RemediationPolicy[] {
    return Array.from(this.policies.values()).sort((a, b) => a.priority - b.priority);
  }

  // Data retrieval
  getActions(filter?: { status?: RemediationStatus; mode?: RemediationMode }): RemediationAction[] {
    let actions = Array.from(this.actions.values()).sort((a, b) => 
      b.executedAt.getTime() - a.executedAt.getTime()
    );

    if (filter?.status) {
      actions = actions.filter(a => a.status === filter.status);
    }
    if (filter?.mode) {
      actions = actions.filter(a => a.mode === filter.mode);
    }

    return actions;
  }

  getStatistics() {
    const actions = Array.from(this.actions.values());
    const policies = Array.from(this.policies.values());

    return {
      actions: {
        total: actions.length,
        successful: actions.filter(a => a.success).length,
        failed: actions.filter(a => a.status === 'failed').length,
        pending: actions.filter(a => a.status === 'pending').length,
        executing: actions.filter(a => a.status === 'executing').length,
        automatic: actions.filter(a => a.mode === 'automatic').length,
        manual: actions.filter(a => a.mode === 'manual').length
      },
      policies: {
        total: policies.length,
        enabled: policies.filter(p => p.enabled).length,
        autoExecute: policies.filter(p => p.autoExecute).length
      },
      byType: actions.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageExecutionTime: actions.filter(a => a.duration).length > 0
        ? Math.round(actions.filter(a => a.duration).reduce((sum, a) => sum + (a.duration || 0), 0) / actions.filter(a => a.duration).length)
        : 0
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

  clearHistory() {
    this.actions.clear();
    this.notifyListeners();
  }
}

export const remediationSystem = new AutomatedRemediationSystem();
