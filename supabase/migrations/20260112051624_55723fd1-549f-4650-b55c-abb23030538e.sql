-- Create incident_comments table for incident activity tracking
CREATE TABLE public.incident_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.incident_comments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view comments (non-internal or if IT staff)
CREATE POLICY "Users can view incident comments"
ON public.incident_comments
FOR SELECT
USING (true);

-- Allow authenticated users to insert their own comments
CREATE POLICY "Authenticated users can add comments"
ON public.incident_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments"
ON public.incident_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_comments;