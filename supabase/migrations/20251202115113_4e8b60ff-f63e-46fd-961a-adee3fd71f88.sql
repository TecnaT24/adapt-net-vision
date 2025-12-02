-- Create enum types for incident classification
CREATE TYPE incident_type AS ENUM (
  'security_threat',
  'anomaly',
  'predictive_fault',
  'alert',
  'remediation_action'
);

CREATE TYPE incident_severity AS ENUM (
  'critical',
  'high',
  'medium',
  'low',
  'info'
);

CREATE TYPE incident_status AS ENUM (
  'active',
  'acknowledged',
  'resolved',
  'false_positive'
);

-- Main incidents table
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type incident_type NOT NULL,
  severity incident_severity NOT NULL,
  status incident_status NOT NULL DEFAULT 'active',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT NOT NULL,
  device_id TEXT,
  device_name TEXT,
  ip_address TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  recommendations TEXT[],
  confidence NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_incidents_type ON public.incidents(incident_type);
CREATE INDEX idx_incidents_severity ON public.incidents(severity);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX idx_incidents_device_id ON public.incidents(device_id);
CREATE INDEX idx_incidents_source ON public.incidents(source);

-- Enable Row Level Security
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read incidents (for demo/research purposes)
CREATE POLICY "Allow public read access to incidents"
ON public.incidents
FOR SELECT
USING (true);

-- Allow anyone to insert incidents (for demo/research purposes)
CREATE POLICY "Allow public insert access to incidents"
ON public.incidents
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update incidents (for demo/research purposes)
CREATE POLICY "Allow public update access to incidents"
ON public.incidents
FOR UPDATE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_incidents_updated_at_trigger
BEFORE UPDATE ON public.incidents
FOR EACH ROW
EXECUTE FUNCTION public.update_incidents_updated_at();