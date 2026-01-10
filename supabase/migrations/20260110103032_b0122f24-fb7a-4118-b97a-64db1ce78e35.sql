-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  archetype TEXT,
  values TEXT[],
  tier TEXT DEFAULT 'Explorer',
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create commitments table for iceberg commitments
CREATE TABLE public.commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  behavior TEXT NOT NULL,
  feeling TEXT NOT NULL,
  belief TEXT NOT NULL,
  commitment TEXT NOT NULL,
  deadline DATE NOT NULL,
  reminder_enabled BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_reflection TEXT,
  days_practiced INTEGER DEFAULT 0,
  last_check_in DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on commitments
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;

-- Commitments RLS policies
CREATE POLICY "Users can view own commitments" ON public.commitments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own commitments" ON public.commitments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commitments" ON public.commitments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own commitments" ON public.commitments
  FOR DELETE USING (auth.uid() = user_id);

-- Create commitment_logs table for daily check-ins
CREATE TABLE public.commitment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id UUID REFERENCES public.commitments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  practiced BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(commitment_id, log_date)
);

-- Enable RLS on commitment_logs
ALTER TABLE public.commitment_logs ENABLE ROW LEVEL SECURITY;

-- Commitment logs RLS policies
CREATE POLICY "Users can view own commitment logs" ON public.commitment_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own commitment logs" ON public.commitment_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commitment logs" ON public.commitment_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Leader'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add timestamp triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commitments_updated_at
  BEFORE UPDATE ON public.commitments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();