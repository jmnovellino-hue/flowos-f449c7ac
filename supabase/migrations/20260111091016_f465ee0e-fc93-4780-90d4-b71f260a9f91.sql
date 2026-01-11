-- Fix the overly permissive RLS policy on beta_applications
-- Drop the existing policy that allows anyone to read all applications
DROP POLICY IF EXISTS "Users can view their own application" ON public.beta_applications;

-- Create a new policy that restricts access by email
-- Users can only view their own application by matching their JWT email
CREATE POLICY "Users can view their own application" 
ON public.beta_applications 
FOR SELECT 
USING (email = auth.jwt()->>'email');