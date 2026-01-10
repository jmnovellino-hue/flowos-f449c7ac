-- Create table for saved audio scripts
CREATE TABLE public.audio_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  script TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('meditation', 'performance')),
  config JSONB,
  audio_url TEXT,
  duration_seconds INTEGER,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audio_scripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own scripts"
  ON public.audio_scripts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scripts"
  ON public.audio_scripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scripts"
  ON public.audio_scripts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scripts"
  ON public.audio_scripts FOR DELETE
  USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE TRIGGER update_audio_scripts_updated_at
  BEFORE UPDATE ON public.audio_scripts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for generated audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', true);

-- Storage policies for audio files
CREATE POLICY "Users can upload own audio files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own audio files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own audio files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view audio files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio-files');