-- Create table for calendar events and their categorizations
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  google_event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  attendees JSONB DEFAULT '[]',
  impact_rating INTEGER CHECK (impact_rating >= -3 AND impact_rating <= 3),
  pre_meeting_insight TEXT,
  post_meeting_reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, google_event_id)
);

-- Create table to store Google OAuth tokens
CREATE TABLE public.google_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user badges (earned achievements)
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_tier TEXT DEFAULT 'bronze',
  xp_earned INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shared_count INTEGER DEFAULT 0,
  last_shared_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_events
CREATE POLICY "Users can view their own calendar events" 
ON public.calendar_events FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events" 
ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events" 
ON public.calendar_events FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events" 
ON public.calendar_events FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for google_tokens
CREATE POLICY "Users can view their own tokens" 
ON public.google_tokens FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" 
ON public.google_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" 
ON public.google_tokens FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" 
ON public.google_tokens FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user_badges
CREATE POLICY "Users can view their own badges" 
ON public.user_badges FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" 
ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own badges" 
ON public.user_badges FOR UPDATE USING (auth.uid() = user_id);

-- Public read for badge sharing
CREATE POLICY "Anyone can view badges for sharing" 
ON public.user_badges FOR SELECT USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_google_tokens_updated_at
  BEFORE UPDATE ON public.google_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();