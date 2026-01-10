-- Architect Conversations table
CREATE TABLE public.architect_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT,
  topics TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.architect_conversations ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Users can view own conversations" 
ON public.architect_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" 
ON public.architect_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" 
ON public.architect_conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" 
ON public.architect_conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Wisdom Library (saved insights)
CREATE TABLE public.architect_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID REFERENCES public.architect_conversations(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  source_layer TEXT, -- bedrock, mirror, bridge, engine, weapon
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.architect_insights ENABLE ROW LEVEL SECURITY;

-- Policies for insights
CREATE POLICY "Users can view own insights" 
ON public.architect_insights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own insights" 
ON public.architect_insights 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" 
ON public.architect_insights 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights" 
ON public.architect_insights 
FOR DELETE 
USING (auth.uid() = user_id);

-- Aggregate learnings table (anonymized patterns for AI improvement)
CREATE TABLE public.architect_learnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  pattern TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  archetype TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (readable by all authenticated users for AI context)
ALTER TABLE public.architect_learnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read learnings" 
ON public.architect_learnings 
FOR SELECT 
TO authenticated
USING (true);

-- Only service role can insert/update (via edge function)
CREATE POLICY "Service role can manage learnings" 
ON public.architect_learnings 
FOR ALL
USING (auth.role() = 'service_role');

-- Triggers for updated_at
CREATE TRIGGER update_architect_conversations_updated_at
BEFORE UPDATE ON public.architect_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_architect_conversations_user_id ON public.architect_conversations(user_id);
CREATE INDEX idx_architect_insights_user_id ON public.architect_insights(user_id);
CREATE INDEX idx_architect_learnings_topic ON public.architect_learnings(topic);