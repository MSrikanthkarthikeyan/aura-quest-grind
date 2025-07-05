
-- Create subtasks table to store quest subtasks
CREATE TABLE public.quest_subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_time INTEGER DEFAULT 25, -- in minutes
  estimated_pomodoros INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create follow-ups table to store AI assistance
CREATE TABLE public.quest_follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id TEXT NOT NULL,
  subtask_id UUID REFERENCES public.quest_subtasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  response TEXT,
  resources TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quest_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_follow_ups ENABLE ROW LEVEL SECURITY;

-- RLS policies for quest_subtasks
CREATE POLICY "Users can view their own quest subtasks" ON public.quest_subtasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quest subtasks" ON public.quest_subtasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quest subtasks" ON public.quest_subtasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quest subtasks" ON public.quest_subtasks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for quest_follow_ups
CREATE POLICY "Users can view their own quest follow ups" ON public.quest_follow_ups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quest follow ups" ON public.quest_follow_ups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quest follow ups" ON public.quest_follow_ups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quest follow ups" ON public.quest_follow_ups
  FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_quest_subtasks_quest_id ON public.quest_subtasks(quest_id);
CREATE INDEX idx_quest_subtasks_user_id ON public.quest_subtasks(user_id);
CREATE INDEX idx_quest_follow_ups_subtask_id ON public.quest_follow_ups(subtask_id);
CREATE INDEX idx_quest_follow_ups_user_id ON public.quest_follow_ups(user_id);

-- Update the generated_quests table to include a status column
ALTER TABLE public.generated_quests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
