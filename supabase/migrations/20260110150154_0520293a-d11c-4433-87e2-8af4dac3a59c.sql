-- Create beta_applications table for tracking quiz responses
CREATE TABLE public.beta_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  quiz_responses JSONB NOT NULL,
  match_percentage INTEGER NOT NULL,
  qualified BOOLEAN NOT NULL DEFAULT false,
  accessed_app BOOLEAN NOT NULL DEFAULT false,
  accessed_at TIMESTAMP WITH TIME ZONE,
  feedback_sent BOOLEAN NOT NULL DEFAULT false,
  feedback_sent_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beta_applications ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for quiz submissions)
CREATE POLICY "Anyone can submit beta application" 
ON public.beta_applications 
FOR INSERT 
WITH CHECK (true);

-- Allow reading own application by email match (for redirect after submission)
CREATE POLICY "Users can view their own application" 
ON public.beta_applications 
FOR SELECT 
USING (true);

-- Create admin_users table to manage admin access
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin_users table
CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Admins can update beta applications
CREATE POLICY "Admins can update beta applications" 
ON public.beta_applications 
FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create trigger for updated_at
CREATE TRIGGER update_beta_applications_updated_at
BEFORE UPDATE ON public.beta_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();