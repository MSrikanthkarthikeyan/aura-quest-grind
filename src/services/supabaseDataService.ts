
import { supabase } from '../integrations/supabase/client';

interface GameData {
  character: any;
  habits: any[];
  achievements: any[];
  userRoles: any;
  dailyActivities: any[];
}

interface UserProfile {
  interests: string[];
  goals: string;
  routine: string;
  questStyle: string;
  timeCommitment: string;
  fitnessPreferences?: string[];
  skillLevel: string;
}

interface OnboardingProfile {
  name?: string;
  interests: string[];
  goal: string;
  dailyCommitment: string;
  preferredStyle: string;
  skillLevel?: string;
}

export const supabaseDataService = {
  // Save game data
  async saveGameData(gameData: Partial<GameData>) {
    try {
      console.log('Saving game data to Supabase');
      const { data, error } = await supabase
        .from('game_data')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          character: gameData.character,
          habits: gameData.habits,
          achievements: gameData.achievements,
          user_roles: gameData.userRoles,
          daily_activities: gameData.dailyActivities,
          updated_at: new Date().toISOString()
        } as any)
        .select();

      if (error) throw error;
      console.log('Game data saved successfully');
      return data;
    } catch (error) {
      console.error('Error saving game data:', error);
      throw error;
    }
  },

  // Load game data
  async loadGameData(): Promise<GameData | null> {
    try {
      console.log('Loading game data from Supabase');
      const { data, error } = await supabase
        .from('game_data')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No game data found');
          return null;
        }
        throw error;
      }

      console.log('Game data loaded successfully');
      return {
        character: (data as any).character,
        habits: (data as any).habits || [],
        achievements: (data as any).achievements || [],
        userRoles: (data as any).user_roles,
        dailyActivities: (data as any).daily_activities || []
      };
    } catch (error) {
      console.error('Error loading game data:', error);
      throw error;
    }
  },

  // Save user profile
  async saveUserProfile(profile: UserProfile) {
    try {
      console.log('Saving user profile to Supabase');
      const { data, error } = await supabase
        .from('user_onboarding_profiles')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          interests: profile.interests,
          goals: profile.goals,
          routine: profile.routine,
          quest_style: profile.questStyle,
          time_commitment: profile.timeCommitment,
          fitness_preferences: profile.fitnessPreferences,
          skill_level: profile.skillLevel,
          updated_at: new Date().toISOString()
        } as any)
        .select();

      if (error) throw error;
      console.log('User profile saved successfully');
      return data;
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  },

  // Save onboarding profile
  async saveOnboardingProfile(profile: OnboardingProfile) {
    try {
      console.log('Saving onboarding profile to Supabase');
      const { data, error } = await supabase
        .from('user_onboarding_profiles')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          interests: profile.interests,
          goals: profile.goal,
          routine: profile.dailyCommitment,
          quest_style: profile.preferredStyle,
          time_commitment: profile.dailyCommitment,
          skill_level: profile.skillLevel,
          updated_at: new Date().toISOString()
        } as any)
        .select();

      if (error) throw error;
      console.log('Onboarding profile saved successfully');
      return data;
    } catch (error) {
      console.error('Error saving onboarding profile:', error);
      throw error;
    }
  },

  // Save generated quests
  async saveGeneratedQuests(quests: any[]) {
    try {
      console.log('Saving generated quests to Supabase');
      const { data, error } = await supabase
        .from('generated_quests')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          quests: quests,
          updated_at: new Date().toISOString()
        } as any)
        .select();

      if (error) throw error;
      console.log('Generated quests saved successfully');
      return data;
    } catch (error) {
      console.error('Error saving generated quests:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      console.log('Getting user profile from Supabase');
      const { data, error } = await supabase
        .from('user_onboarding_profiles')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No user profile found');
          return null;
        }
        throw error;
      }

      console.log('User profile retrieved successfully');
      return {
        interests: (data as any).interests || [],
        goals: (data as any).goals || '',
        routine: (data as any).routine || '',
        questStyle: (data as any).quest_style || '',
        timeCommitment: (data as any).time_commitment || '',
        fitnessPreferences: (data as any).fitness_preferences || [],
        skillLevel: (data as any).skill_level || ''
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  // Subscribe to real-time updates
  subscribeToGameData(callback: (data: GameData | null) => void) {
    console.log('Setting up real-time subscription');
    
    const channel = supabase
      .channel('game-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_data'
        },
        async (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.new) {
            const gameData: GameData = {
              character: (payload.new as any).character,
              habits: (payload.new as any).habits || [],
              achievements: (payload.new as any).achievements || [],
              userRoles: (payload.new as any).user_roles,
              dailyActivities: (payload.new as any).daily_activities || []
            };
            callback(gameData);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  },

  // Save daily activity
  async saveDailyActivity(activity: any) {
    try {
      console.log('Saving daily activity to Supabase');
      const { data, error } = await supabase
        .from('daily_activities')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          date: activity.date,
          quests_completed: activity.questsCompleted,
          pomodoros_completed: activity.pomodorosCompleted,
          xp_earned: activity.xpEarned,
          has_login: activity.hasLogin
        } as any)
        .select();

      if (error) throw error;
      console.log('Daily activity saved successfully');
      return data;
    } catch (error) {
      console.error('Error saving daily activity:', error);
      throw error;
    }
  },

  // Save quest session
  async saveQuestSession(questSession: any) {
    try {
      console.log('Saving quest session to Supabase');
      const { data, error } = await supabase
        .from('quest_sessions')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          quest_id: questSession.questId,
          pomodoro_count: questSession.pomodoroCount,
          started_at: questSession.startedAt || new Date().toISOString()
        } as any)
        .select();

      if (error) throw error;
      console.log('Quest session saved successfully');
      return data;
    } catch (error) {
      console.error('Error saving quest session:', error);
      throw error;
    }
  },

  // Get streak data
  async getStreakData(startDate: string, endDate: string) {
    try {
      console.log('Getting streak data from Supabase');
      const { data, error } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      console.log('Streak data retrieved successfully');
      return data;
    } catch (error) {
      console.error('Error getting streak data:', error);
      throw error;
    }
  }
};
