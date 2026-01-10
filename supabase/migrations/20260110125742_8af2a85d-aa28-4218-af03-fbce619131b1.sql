-- Add email field to profiles for sending digest emails
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS weekly_digest_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_digest_sent_at timestamp with time zone;