
-- Create table for business analyses (FOFA + marketing plan)
CREATE TABLE public.analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_idea TEXT NOT NULL,
  fofa_content TEXT NOT NULL,
  marketing_plan TEXT NOT NULL,
  full_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Public read/insert since there's no auth yet
CREATE POLICY "Anyone can view analyses"
  ON public.analyses FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert analyses"
  ON public.analyses FOR INSERT
  WITH CHECK (true);
