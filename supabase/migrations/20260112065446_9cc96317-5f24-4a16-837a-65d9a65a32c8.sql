-- Create routines table for scheduled wellness activities
CREATE TABLE public.routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  days_of_week INTEGER[] NOT NULL DEFAULT '{}',
  time_of_day TIME NOT NULL,
  reminder_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own routines" 
ON public.routines FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own routines" 
ON public.routines FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines" 
ON public.routines FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines" 
ON public.routines FOR DELETE 
USING (auth.uid() = user_id);

-- Create routine_logs table to track completions
CREATE TABLE public.routine_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.routine_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own routine logs" 
ON public.routine_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own routine logs" 
ON public.routine_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create focus_sessions table for Quantum Bubble tracking
CREATE TABLE public.focus_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  duration_minutes INTEGER NOT NULL,
  audio_type TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own focus sessions" 
ON public.focus_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own focus sessions" 
ON public.focus_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus sessions" 
ON public.focus_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- Update triggers
CREATE TRIGGER update_routines_updated_at
BEFORE UPDATE ON public.routines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();