-- Create beta_analytics table for conversion tracking
CREATE TABLE public.beta_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beta_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public insert for tracking events
CREATE POLICY "Anyone can insert analytics events" 
ON public.beta_analytics 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view analytics" 
ON public.beta_analytics 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create index for faster queries
CREATE INDEX idx_beta_analytics_event_type ON public.beta_analytics(event_type);
CREATE INDEX idx_beta_analytics_created_at ON public.beta_analytics(created_at);