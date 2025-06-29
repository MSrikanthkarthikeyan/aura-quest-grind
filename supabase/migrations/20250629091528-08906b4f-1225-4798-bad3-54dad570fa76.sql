
-- Create game_data table to store user's game progress
CREATE TABLE public.game_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  character JSONB,
  habits JSONB,
  achievements JSONB,
  user_roles JSONB,
  daily_activities JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_onboarding_profiles table to store onboarding data
CREATE TABLE public.user_onboarding_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interests TEXT[],
  goals TEXT,
  routine TEXT,
  quest_style TEXT,
  time_commitment TEXT,
  fitness_preferences TEXT[],
  skill_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generated_quests table to store AI-generated quests
CREATE TABLE public.generated_quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quests JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_activities table to track daily progress
CREATE TABLE public.daily_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  quests_completed INTEGER DEFAULT 0,
  pomodoros_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  has_login BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create quest_sessions table to track pomodoro sessions
CREATE TABLE public.quest_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quest_id TEXT NOT NULL,
  pomodoro_count INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.game_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for game_data
CREATE POLICY "Users can view their own game data" ON public.game_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game data" ON public.game_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game data" ON public.game_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game data" ON public.game_data
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_onboarding_profiles
CREATE POLICY "Users can view their own onboarding profile" ON public.user_onboarding_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding profile" ON public.user_onboarding_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding profile" ON public.user_onboarding_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own onboarding profile" ON public.user_onboarding_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for generated_quests
CREATE POLICY "Users can view their own generated quests" ON public.generated_quests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generated quests" ON public.generated_quests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated quests" ON public.generated_quests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated quests" ON public.generated_quests
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for daily_activities
CREATE POLICY "Users can view their own daily activities" ON public.daily_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily activities" ON public.daily_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily activities" ON public.daily_activities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily activities" ON public.daily_activities
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for quest_sessions
CREATE POLICY "Users can view their own quest sessions" ON public.quest_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quest sessions" ON public.quest_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quest sessions" ON public.quest_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quest sessions" ON public.quest_sessions
  FOR DELETE USING (auth.uid() = user_id);
