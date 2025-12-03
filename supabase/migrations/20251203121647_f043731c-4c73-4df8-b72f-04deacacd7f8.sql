-- Drop trigger first, then fix function
DROP TRIGGER IF EXISTS update_incidents_updated_at_trigger ON public.incidents;
DROP FUNCTION IF EXISTS public.update_incidents_updated_at();

CREATE OR REPLACE FUNCTION public.update_incidents_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_incidents_updated_at_trigger
BEFORE UPDATE ON public.incidents
FOR EACH ROW
EXECUTE FUNCTION public.update_incidents_updated_at();