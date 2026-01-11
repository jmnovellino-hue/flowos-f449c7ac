-- Fix beta_analytics_injection: Add constraints for event_type and event_data size
-- This prevents arbitrary event types and massive JSONB payloads

-- Add constraint to limit event_type to valid values only
ALTER TABLE public.beta_analytics 
ADD CONSTRAINT valid_event_types 
CHECK (event_type IN ('page_view', 'quiz_started', 'quiz_question_answered', 'quiz_completed', 'qualified', 'not_qualified', 'info_submitted', 'launch_page_viewed', 'app_accessed', 'specs_downloaded', 'specs_viewed'));

-- Add constraint to limit event_data JSONB size (max 10KB)
ALTER TABLE public.beta_analytics 
ADD CONSTRAINT event_data_size_limit 
CHECK (event_data IS NULL OR pg_column_size(event_data) < 10000);

-- Fix beta_apps_email_policy: Change SELECT policy to admin-only
-- Drop the email-based SELECT policy (allows enumeration attacks)
DROP POLICY IF EXISTS "Users can view their own application" ON public.beta_applications;

-- Create admin-only SELECT policy
CREATE POLICY "Admins can view all applications" 
ON public.beta_applications 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create admin-only UPDATE policy (for updating notes, feedback_sent, etc.)
DROP POLICY IF EXISTS "admin_update" ON public.beta_applications;
CREATE POLICY "Admins can update applications" 
ON public.beta_applications 
FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create rate limit tracking table for contact form
CREATE TABLE IF NOT EXISTS public.contact_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_contact_rate_limits_identifier ON public.contact_rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_contact_rate_limits_window ON public.contact_rate_limits(window_start);

-- Enable RLS on rate limits table
ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limits (used by edge function)
-- No user-facing policies needed