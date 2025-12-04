import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, Calendar, RefreshCw, AlertTriangle, Shield, Activity, Cpu } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface IncidentData {
  id: string;
  incident_type: string;
  severity: string;
  status: string;
  created_at: string;
  source: string;
}

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#06b6d4',
  info: '#8b5cf6',
  security_threat: '#ef4444',
  anomaly: '#06b6d4',
  predictive_fault: '#8b5cf6',
  alert: '#f97316',
  remediation_action: '#22c55e',
  active: '#ef4444',
  acknowledged: '#eab308',
  resolved: '#22c55e',
  false_positive: '#6b7280'
};

const IncidentAnalytics: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchIncidents = async () => {
    setLoading(true);
    
    let startDate = new Date();
    switch (timeRange) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    const { data, error } = await supabase
      .from('incidents')
      .select('id, incident_type, severity, status, created_at, source')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (!error && data) {
      setIncidents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIncidents();
  }, [timeRange]);

  // Process data for time series chart
  const getTimeSeriesData = () => {
    const grouped: Record<string, Record<string, number>> = {};
    
    incidents.forEach(inc => {
      const date = new Date(inc.created_at);
      let key: string;
      
      if (timeRange === '24h') {
        key = `${date.getHours()}:00`;
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      if (!grouped[key]) {
        grouped[key] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
      }
      grouped[key].total++;
      grouped[key][inc.severity] = (grouped[key][inc.severity] || 0) + 1;
    });

    return Object.entries(grouped).map(([name, values]) => ({
      name,
      ...values
    }));
  };

  // Process data for type distribution
  const getTypeDistribution = () => {
    const counts: Record<string, number> = {};
    incidents.forEach(inc => {
      counts[inc.incident_type] = (counts[inc.incident_type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
      fill: COLORS[name as keyof typeof COLORS] || '#8884d8'
    }));
  };

  // Process data for severity distribution
  const getSeverityDistribution = () => {
    const counts: Record<string, number> = {};
    incidents.forEach(inc => {
      counts[inc.severity] = (counts[inc.severity] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: COLORS[name as keyof typeof COLORS] || '#8884d8'
    }));
  };

  // Process data for status distribution
  const getStatusDistribution = () => {
    const counts: Record<string, number> = {};
    incidents.forEach(inc => {
      counts[inc.status] = (counts[inc.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
      fill: COLORS[name as keyof typeof COLORS] || '#8884d8'
    }));
  };

  // Process data for source distribution
  const getSourceDistribution = () => {
    const counts: Record<string, number> = {};
    incidents.forEach(inc => {
      counts[inc.source] = (counts[inc.source] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  };

  // Calculate statistics
  const stats = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    active: incidents.filter(i => i.status === 'active').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    avgPerDay: timeRange === '24h' 
      ? incidents.length 
      : (incidents.length / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90)).toFixed(1)
  };

  const timeSeriesData = getTimeSeriesData();
  const typeData = getTypeDistribution();
  const severityData = getSeverityDistribution();
  const statusData = getStatusDistribution();
  const sourceData = getSourceDistribution();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Incident Analytics
            </h1>
            <p className="text-muted-foreground mt-2">
              Visualize incident patterns and trends over time
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px] bg-background/50">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchIncidents} variant="outline" className="gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <AlertTriangle className="w-4 h-4" />
                Total Incidents
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Shield className="w-4 h-4 text-destructive" />
                Critical
              </div>
              <div className="text-3xl font-bold text-destructive">{stats.critical}</div>
            </CardContent>
          </Card>
          <Card className="bg-warning/10 border-warning/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Activity className="w-4 h-4 text-warning" />
                Active
              </div>
              <div className="text-3xl font-bold text-warning">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="bg-success/10 border-success/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Cpu className="w-4 h-4 text-success" />
                Resolved
              </div>
              <div className="text-3xl font-bold text-success">{stats.resolved}</div>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                Avg/Day
              </div>
              <div className="text-3xl font-bold text-primary">{stats.avgPerDay}</div>
            </CardContent>
          </Card>
        </div>

        {/* Incident Trend Chart */}
        <Card className="mb-6 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Incident Trend Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : timeSeriesData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No incident data available for the selected time range
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#colorTotal)" name="Total" />
                  <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} name="Critical" />
                  <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} dot={false} name="High" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Type Distribution */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart className="w-5 h-5 text-primary" />
                By Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {typeData.length === 0 ? (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Severity Distribution */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-primary" />
                By Severity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {severityData.length === 0 ? (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={severityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status and Source Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-primary" />
                By Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length === 0 ? (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Source Distribution */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cpu className="w-5 h-5 text-primary" />
                By Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sourceData.length === 0 ? (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={sourceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} angle={-20} textAnchor="end" height={60} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default IncidentAnalytics;