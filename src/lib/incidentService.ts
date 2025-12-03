import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type IncidentType = Database['public']['Enums']['incident_type'];
type IncidentSeverity = Database['public']['Enums']['incident_severity'];
type IncidentStatus = Database['public']['Enums']['incident_status'];

export interface Incident {
  id: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  source: string;
  device_id?: string;
  device_name?: string;
  ip_address?: string;
  details: Record<string, any>;
  metrics?: Record<string, any>;
  recommendations?: string[];
  confidence?: number;
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  updated_at: string;
}

export interface IncidentFilters {
  type?: IncidentType;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  source?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

class IncidentService {
  // Log a new incident from any source
  async logIncident(incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>): Promise<Incident | null> {
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        incident_type: incident.incident_type,
        severity: incident.severity,
        status: incident.status || 'active',
        title: incident.title,
        description: incident.description,
        source: incident.source,
        device_id: incident.device_id,
        device_name: incident.device_name,
        ip_address: incident.ip_address,
        details: incident.details,
        metrics: incident.metrics,
        recommendations: incident.recommendations,
        confidence: incident.confidence,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to log incident:', error);
      return null;
    }
    return data as Incident;
  }

  // Log security threat
  async logSecurityThreat(threat: {
    type: string;
    severity: string;
    source: string;
    target: string;
    description: string;
    confidence: number;
    details?: Record<string, any>;
  }): Promise<Incident | null> {
    return this.logIncident({
      incident_type: 'security_threat',
      severity: this.mapSeverity(threat.severity),
      status: 'active',
      title: `${threat.type} Detected`,
      description: threat.description,
      source: 'Security System',
      ip_address: threat.source,
      device_name: threat.target,
      details: { ...threat.details, attackType: threat.type },
      confidence: threat.confidence,
    });
  }

  // Log anomaly
  async logAnomaly(anomaly: {
    type: string;
    severity: string;
    deviceId: string;
    deviceName: string;
    description: string;
    confidence: number;
    metrics?: Record<string, any>;
    method?: string;
  }): Promise<Incident | null> {
    return this.logIncident({
      incident_type: 'anomaly',
      severity: this.mapSeverity(anomaly.severity),
      status: 'active',
      title: `Anomaly: ${anomaly.type}`,
      description: anomaly.description,
      source: anomaly.method || 'Anomaly Detection',
      device_id: anomaly.deviceId,
      device_name: anomaly.deviceName,
      details: { anomalyType: anomaly.type },
      metrics: anomaly.metrics,
      confidence: anomaly.confidence,
    });
  }

  // Log predictive fault
  async logPredictiveFault(fault: {
    deviceId: string;
    failureType: string;
    predictedTime: Date;
    confidence: number;
    severity: string;
    affectedMetrics: string[];
    recommendations: string[];
  }): Promise<Incident | null> {
    return this.logIncident({
      incident_type: 'predictive_fault',
      severity: this.mapSeverity(fault.severity),
      status: 'active',
      title: `Predicted: ${fault.failureType}`,
      description: `Predicted failure in ${fault.deviceId} at ${fault.predictedTime.toISOString()}`,
      source: 'Predictive Fault Detection',
      device_id: fault.deviceId,
      details: {
        failureType: fault.failureType,
        predictedTime: fault.predictedTime.toISOString(),
        affectedMetrics: fault.affectedMetrics,
      },
      recommendations: fault.recommendations,
      confidence: fault.confidence,
    });
  }

  // Log alert
  async logAlert(alert: {
    message: string;
    severity: string;
    source: string;
    details?: Record<string, any>;
  }): Promise<Incident | null> {
    return this.logIncident({
      incident_type: 'alert',
      severity: this.mapSeverity(alert.severity),
      status: 'active',
      title: alert.message,
      description: alert.message,
      source: alert.source,
      details: alert.details || {},
    });
  }

  // Log remediation action
  async logRemediationAction(action: {
    actionType: string;
    targetDevice: string;
    status: 'success' | 'failed' | 'pending';
    triggeredBy: string;
    details?: Record<string, any>;
  }): Promise<Incident | null> {
    return this.logIncident({
      incident_type: 'remediation_action',
      severity: action.status === 'failed' ? 'high' : 'info',
      status: action.status === 'success' ? 'resolved' : 'active',
      title: `Remediation: ${action.actionType}`,
      description: `${action.actionType} executed on ${action.targetDevice}`,
      source: 'Automated Remediation',
      device_name: action.targetDevice,
      details: {
        actionType: action.actionType,
        triggeredBy: action.triggeredBy,
        executionStatus: action.status,
        ...action.details,
      },
    });
  }

  // Get incidents with filters
  async getIncidents(filters?: IncidentFilters): Promise<Incident[]> {
    let query = supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('incident_type', filters.type);
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.source) {
      query = query.eq('source', filters.source);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch incidents:', error);
      return [];
    }

    return (data || []) as Incident[];
  }

  // Update incident status
  async updateIncidentStatus(id: string, status: IncidentStatus): Promise<boolean> {
    const updates: Record<string, any> = { status };
    
    if (status === 'acknowledged') {
      updates.acknowledged_at = new Date().toISOString();
    } else if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Failed to update incident:', error);
      return false;
    }
    return true;
  }

  // Get statistics
  async getStatistics(): Promise<{
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    last24Hours: number;
    last7Days: number;
  }> {
    const { data, error } = await supabase
      .from('incidents')
      .select('*');

    if (error || !data) {
      return {
        total: 0,
        byType: {},
        bySeverity: {},
        byStatus: {},
        last24Hours: 0,
        last7Days: 0,
      };
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let last24Hours = 0;
    let last7Days = 0;

    data.forEach((incident) => {
      byType[incident.incident_type] = (byType[incident.incident_type] || 0) + 1;
      bySeverity[incident.severity] = (bySeverity[incident.severity] || 0) + 1;
      byStatus[incident.status] = (byStatus[incident.status] || 0) + 1;

      const createdAt = new Date(incident.created_at);
      if (createdAt >= oneDayAgo) last24Hours++;
      if (createdAt >= sevenDaysAgo) last7Days++;
    });

    return {
      total: data.length,
      byType,
      bySeverity,
      byStatus,
      last24Hours,
      last7Days,
    };
  }

  // Export to CSV
  exportToCSV(incidents: Incident[]): string {
    const headers = [
      'ID', 'Type', 'Severity', 'Status', 'Title', 'Description', 
      'Source', 'Device', 'IP Address', 'Confidence', 'Created At', 'Resolved At'
    ];

    const rows = incidents.map(inc => [
      inc.id,
      inc.incident_type,
      inc.severity,
      inc.status,
      `"${inc.title.replace(/"/g, '""')}"`,
      `"${inc.description.replace(/"/g, '""')}"`,
      inc.source,
      inc.device_name || '',
      inc.ip_address || '',
      inc.confidence?.toString() || '',
      inc.created_at,
      inc.resolved_at || '',
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  private mapSeverity(severity: string): IncidentSeverity {
    const map: Record<string, IncidentSeverity> = {
      'critical': 'critical',
      'high': 'high',
      'medium': 'medium',
      'low': 'low',
      'info': 'info',
    };
    return map[severity.toLowerCase()] || 'medium';
  }
}

export const incidentService = new IncidentService();
