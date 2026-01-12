-- Add delete policy for incident comments
CREATE POLICY "Users can delete their own comments"
ON public.incident_comments
FOR DELETE
USING (auth.uid() = user_id);