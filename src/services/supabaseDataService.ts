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

interface QuestSubtask {
  id: string;
  questId: string;
  title: string;
  description?: string;
  estimatedTime: number;
  estimatedPomodoros: number;
  isCompleted: boolean;
  orderIndex: number;
}

interface QuestFollowUp {
  id: string;
  questId: string;
  subtaskId?: string;
  query: string;
  response?: string;
  resources?: string[];
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
  },

  // Subtask management
  async saveQuestSubtasks(questId: string, subtasks: Omit<QuestSubtask, 'id'>[]) {
    try {
      console.log('Saving quest subtasks to Supabase');
      const user = await supabase.auth.getUser();
      
      const subtasksToInsert = subtasks.map(subtask => ({
        quest_id: questId,
        user_id: user.data.user?.id,
        title: subtask.title,
        description: subtask.description,
        estimated_time: subtask.estimatedTime,
        estimated_pomodoros: subtask.estimatedPomodoros,
        is_completed: subtask.isCompleted,
        order_index: subtask.orderIndex
      }));

      const { data, error } = await supabase
        .from('quest_subtasks')
        .upsert(subtasksToInsert)
        .select();

      if (error) throw error;
      console.log('Quest subtasks saved successfully');
      return data;
    } catch (error) {
      console.error('Error saving quest subtasks:', error);
      throw error;
    }
  },

  async getQuestSubtasks(questId: string): Promise<QuestSubtask[]> {
    try {
      console.log('Getting quest subtasks from Supabase');
      const { data, error } = await supabase
        .from('quest_subtasks')
        .select('*')
        .eq('quest_id', questId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        questId: item.quest_id,
        title: item.title,
        description: item.description,
        estimatedTime: item.estimated_time,
        estimatedPomodoros: item.estimated_pomodoros,
        isCompleted: item.is_completed,
        orderIndex: item.order_index
      }));
    } catch (error) {
      console.error('Error getting quest subtasks:', error);
      throw error;
    }
  },

  async updateSubtaskCompletion(subtaskId: string, isCompleted: boolean) {
    try {
      console.log('Updating subtask completion status');
      const { data, error } = await supabase
        .from('quest_subtasks')
        .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
        .eq('id', subtaskId)
        .select();

      if (error) throw error;
      console.log('Subtask completion updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating subtask completion:', error);
      throw error;
    }
  },

  // Follow-up management
  async saveQuestFollowUp(followUp: Omit<QuestFollowUp, 'id'>) {
    try {
      console.log('Saving quest follow-up to Supabase');
      const user = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('quest_follow_ups')
        .insert({
          quest_id: followUp.questId,
          subtask_id: followUp.subtaskId,
          user_id: user.data.user?.id,
          query: followUp.query,
          response: followUp.response,
          resources: followUp.resources
        })
        .select();

      if (error) throw error;
      console.log('Quest follow-up saved successfully');
      return data;
    } catch (error) {
      console.error('Error saving quest follow-up:', error);
      throw error;
    }
  },

  async getQuestFollowUps(questId: string): Promise<QuestFollowUp[]> {
    try {
      console.log('Getting quest follow-ups from Supabase');
      const { data, error } = await supabase
        .from('quest_follow_ups')
        .select('*')
        .eq('quest_id', questId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        questId: item.quest_id,
        subtaskId: item.subtask_id,
        query: item.query,
        response: item.response,
        resources: item.resources
      }));
    } catch (error) {
      console.error('Error getting quest follow-ups:', error);
      throw error;
    }
  },

  async updateFollowUpResponse(followUpId: string, response: string, resources?: string[]) {
    try {
      console.log('Updating follow-up response');
      const { data, error } = await supabase
        .from('quest_follow_ups')
        .update({ response, resources })
        .eq('id', followUpId)
        .select();

      if (error) throw error;
      console.log('Follow-up response updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating follow-up response:', error);
      throw error;
    }
  },

  // Enhanced quest management
  async getGeneratedQuests() {
    try {
      console.log('Getting generated quests from Supabase');
      const { data, error } = await supabase
        .from('generated_quests')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No generated quests found');
          return null;
        }
        throw error;
      }

      console.log('Generated quests retrieved successfully');
      return data;
    } catch (error) {
      console.error('Error getting generated quests:', error);
      throw error;
    }
  },

  // Real-time subscriptions for subtasks
  subscribeToSubtasks(questId: string, callback: (subtasks: QuestSubtask[]) => void) {
    console.log('Setting up real-time subscription for subtasks');
    
    const channel = supabase
      .channel(`subtasks-${questId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quest_subtasks',
          filter: `quest_id=eq.${questId}`
        },
        async () => {
          console.log('Subtasks updated, fetching latest data');
          try {
            const updatedSubtasks = await this.getQuestSubtasks(questId);
            callback(updatedSubtasks);
          } catch (error) {
            console.error('Error fetching updated subtasks:', error);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subtasks subscription');
      supabase.removeChannel(channel);
    };
  }
};
