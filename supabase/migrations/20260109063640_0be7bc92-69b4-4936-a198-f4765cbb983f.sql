-- Create knowledge base articles table
CREATE TABLE public.knowledge_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  incident_types TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

-- Public read access for all authenticated users
CREATE POLICY "Anyone can view knowledge articles"
ON public.knowledge_articles
FOR SELECT
USING (true);

-- Only admins can insert/update/delete (we'll check role in app)
CREATE POLICY "Authenticated users can insert articles"
ON public.knowledge_articles
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update articles"
ON public.knowledge_articles
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete articles"
ON public.knowledge_articles
FOR DELETE
TO authenticated
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_knowledge_articles_updated_at
BEFORE UPDATE ON public.knowledge_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_incidents_updated_at();