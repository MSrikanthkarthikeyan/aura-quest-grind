import React, { createContext, useContext, useState, useEffect } from 'react';
import { questTemplates, getQuestsForRoles, QuestTemplate } from '../utils/questTemplates';
import { useAuth } from './AuthContext';
import { firebaseDataService } from '../services/firebaseDataService';

interface Character {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  class: string;
  stats: {
    intelligence: number;
    strength: number;
    dexterity: number;
    charisma: number;
    wisdom: number;
  };
}

interface Habit {
  id: string;
  title: string;
  category: string;
  xpReward: number;
  streak: number;
  completed: boolean;
  lastCompleted?: string;
  frequency: 'daily' | 'weekly' | 'milestone';
  difficulty: 'basic' | 'intermediate' | 'elite';
  description: string;
  tier: number;
  isCustom?: boolean;
}

interface UserRoles {
  roles: string[];
  fitnessTypes: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

interface DailyActivity {
  date: string;
  questsCompleted: number;
  pomodorosCompleted: number;
  xpEarned: number;
  hasLogin: boolean;
}

interface GameContextType {
  character: Character;
  habits: Habit[];
  achievements: Achievement[];
  userRoles: UserRoles | null;
  hasCompletedOnboarding: boolean;
  currentQuestSession: { questId: string; pomodoroCount: number } | null;
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completed'>) => void;
  completeHabit: (habitId: string) => void;
  gainXP: (amount: number, statType?: string) => void;
  setUserRoles: (roles: UserRoles) => void;
  generateQuestsFromRoles: () => void;
  toggleHabit: (habitId: string, enabled: boolean) => void;
  removeHabit: (habitId: string) => void;
  getSuggestedQuests: () => QuestTemplate[];
  startQuestSession: (questId: string, pomodoroCount: number) => void;
  completeQuestSession: () => void;
  getDailyActivity: (date: string) => DailyActivity;
  getStreakCount: () => number;
  recordDailyLogin: () => void;
  syncToFirebase: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [character, setCharacter] = useState<Character>(() => {
    const saved = localStorage.getItem('character');
    return saved ? JSON.parse(saved) : {
      name: 'Shadow Hunter',
      level: 1,
      xp: 0,
      xpToNext: 100,
      class: 'Assassin',
      stats: {
        intelligence: 10,
        strength: 10,
        dexterity: 12,
        charisma: 8,
        wisdom: 10,
      },
    };
  });

  const [userRoles, setUserRolesState] = useState<UserRoles | null>(() => {
    const saved = localStorage.getItem('userRoles');
    return saved ? JSON.parse(saved) : null;
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('hasCompletedOnboarding') === 'true';
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('achievements');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'Shadow Awakening',
        description: 'Complete your first quest',
        unlocked: false,
        icon: '🌟',
      },
      {
        id: '2',
        title: 'Grind Master',
        description: 'Maintain a 7-day streak',
        unlocked: false,
        icon: '⚔️',
      },
      {
        id: '3',
        title: 'Elite Hunter',
        description: 'Reach level 10',
        unlocked: false,
        icon: '👑',
      },
    ];
  });

  const [currentQuestSession, setCurrentQuestSession] = useState<{ questId: string; pomodoroCount: number } | null>(null);
  
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>(() => {
    const saved = localStorage.getItem('dailyActivities');
    return saved ? JSON.parse(saved) : [];
  });

  // Firebase sync effect
  useEffect(() => {
    if (user) {
      // Load data from Firebase when user logs in
      loadFromFirebase();
      
      // Set up real-time listener
      const unsubscribe = firebaseDataService.subscribeToGameData(user.uid, (data) => {
        if (data) {
          if (data.character) setCharacter(data.character);
          if (data.habits) setHabits(data.habits);
          if (data.achievements) setAchievements(data.achievements);
          if (data.userRoles) {
            setUserRolesState(data.userRoles);
            setHasCompletedOnboarding(true);
          }
          if (data.dailyActivities) setDailyActivities(data.dailyActivities);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const loadFromFirebase = async () => {
    if (!user) return;
    
    try {
      const data = await firebaseDataService.loadGameData(user.uid);
      if (data) {
        if (data.character) setCharacter(data.character);
        if (data.habits) setHabits(data.habits);
        if (data.achievements) setAchievements(data.achievements);
        if (data.userRoles) {
          setUserRolesState(data.userRoles);
          setHasCompletedOnboarding(true);
        }
        if (data.dailyActivities) setDailyActivities(data.dailyActivities);
      }
    } catch (error) {
      console.error('Error loading data from Firebase:', error);
    }
  };

  const syncToFirebase = async () => {
    if (!user) return;

    try {
      await firebaseDataService.saveGameData(user.uid, {
        character,
        habits,
        achievements,
        userRoles,
        dailyActivities
      });
    } catch (error) {
      console.error('Error syncing to Firebase:', error);
    }
  };

  // Auto-sync when data changes
  useEffect(() => {
    if (user) {
      syncToFirebase();
    }
  }, [character, habits, achievements, userRoles, dailyActivities, user]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('character', JSON.stringify(character));
  }, [character]);

  useEffect(() => {
    if (userRoles) {
      localStorage.setItem('userRoles', JSON.stringify(userRoles));
    }
  }, [userRoles]);

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('dailyActivities', JSON.stringify(dailyActivities));
  }, [dailyActivities]);

  // Record login on app start
  useEffect(() => {
    recordDailyLogin();
  }, []);

  const recordDailyLogin = () => {
    const today = new Date().toISOString().split('T')[0];
    setDailyActivities(prev => {
      const existing = prev.find(a => a.date === today);
      if (existing && existing.hasLogin) return prev;
      
      if (existing) {
        return prev.map(a => a.date === today ? { ...a, hasLogin: true } : a);
      } else {
        return [...prev, {
          date: today,
          questsCompleted: 0,
          pomodorosCompleted: 0,
          xpEarned: 0,
          hasLogin: true
        }];
      }
    });
  };

  const getDailyActivity = (date: string): DailyActivity => {
    const activity = dailyActivities.find(a => a.date === date);
    return activity || {
      date,
      questsCompleted: 0,
      pomodorosCompleted: 0,
      xpEarned: 0,
      hasLogin: false
    };
  };

  const getStreakCount = (): number => {
    const sortedDates = dailyActivities
      .filter(a => a.hasLogin)
      .map(a => a.date)
      .sort()
      .reverse();
    
    if (sortedDates.length === 0) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    if (sortedDates[0] !== today) return 0;
    
    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i - 1]);
      const next = new Date(sortedDates[i]);
      const diffTime = Math.abs(current.getTime() - next.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const setUserRoles = (roles: UserRoles) => {
    setUserRolesState(roles);
    setHasCompletedOnboarding(true);
    localStorage.setItem('hasCompletedOnboarding', 'true');
    generateQuestsFromRoles(roles);
  };

  const generateQuestsFromRoles = (roles?: UserRoles) => {
    const targetRoles = roles || userRoles;
    if (!targetRoles) return;

    const maxStreak = Math.max(...habits.map(h => h.streak), 0);
    const availableQuests = getQuestsForRoles(
      targetRoles.roles, 
      targetRoles.fitnessTypes, 
      character.level, 
      maxStreak
    );

    // Convert quest templates to habits, avoiding duplicates
    const existingQuestIds = habits.map(h => h.id);
    const newHabits = availableQuests
      .filter(quest => !existingQuestIds.includes(quest.id))
      .map(quest => ({
        id: quest.id,
        title: quest.title,
        category: quest.category,
        xpReward: quest.xpReward,
        streak: 0,
        completed: false,
        frequency: quest.frequency,
        difficulty: quest.difficulty,
        description: quest.description,
        tier: quest.tier,
        isCustom: false,
      }));

    setHabits(prev => [...prev, ...newHabits]);
  };

  const addHabit = (habitData: Omit<Habit, 'id' | 'streak' | 'completed'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      streak: 0,
      completed: false,
      isCustom: true,
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const toggleHabit = (habitId: string, enabled: boolean) => {
    if (!enabled) {
      setHabits(prev => prev.filter(h => h.id !== habitId));
    }
  };

  const removeHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const completeHabit = (habitId: string) => {
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id === habitId && !habit.completed) {
          const newStreak = habit.streak + 1;
          gainXP(habit.xpReward, getCategoryStatType(habit.category));
          
          // Check for achievements
          checkAchievements(newStreak);
          
          return {
            ...habit,
            completed: true,
            streak: newStreak,
            lastCompleted: new Date().toISOString(),
          };
        }
        return habit;
      })
    );
  };

  const checkAchievements = (streak: number) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === '1' && !achievement.unlocked) {
        return { ...achievement, unlocked: true };
      }
      if (achievement.id === '2' && streak >= 7 && !achievement.unlocked) {
        return { ...achievement, unlocked: true };
      }
      if (achievement.id === '3' && character.level >= 10 && !achievement.unlocked) {
        return { ...achievement, unlocked: true };
      }
      return achievement;
    }));
  };

  const getSuggestedQuests = (): QuestTemplate[] => {
    if (!userRoles) return [];
    
    const maxStreak = Math.max(...habits.map(h => h.streak), 0);
    const allAvailableQuests = getQuestsForRoles(
      userRoles.roles, 
      userRoles.fitnessTypes, 
      character.level, 
      maxStreak
    );
    
    const currentQuestIds = habits.map(h => h.id);
    return allAvailableQuests.filter(quest => !currentQuestIds.includes(quest.id));
  };

  const getCategoryStatType = (category: string): string => {
    const statMap: { [key: string]: string } = {
      'Academics': 'intelligence',
      'Tech': 'intelligence',
      'Business': 'charisma',
      'Fitness': 'strength',
      'Personal': 'wisdom',
      'Content': 'charisma',
    };
    return statMap[category] || 'wisdom';
  };

  const gainXP = (amount: number, statType?: string) => {
    setCharacter(prev => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newXPToNext = prev.xpToNext;
      let newStats = { ...prev.stats };

      // Level up logic
      while (newXP >= newXPToNext) {
        newXP -= newXPToNext;
        newLevel++;
        newXPToNext = Math.floor(newXPToNext * 1.2);
        
        // Stat increase on level up
        if (statType && statType in newStats) {
          newStats[statType as keyof typeof newStats] += 1;
        }
        
        // Check level-based achievements
        if (newLevel >= 10) {
          checkAchievements(0);
        }
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        xpToNext: newXPToNext,
        stats: newStats,
      };
    });
  };

  const startQuestSession = (questId: string, pomodoroCount: number) => {
    setCurrentQuestSession({ questId, pomodoroCount });
    
    // Save quest session to Firebase
    if (user) {
      firebaseDataService.saveQuestSession(user.uid, {
        questId,
        pomodoroCount,
        startedAt: new Date().toISOString()
      });
    }
  };

  const completeQuestSession = () => {
    if (currentQuestSession) {
      completeHabit(currentQuestSession.questId);
      
      // Record daily activity
      const today = new Date().toISOString().split('T')[0];
      setDailyActivities(prev => {
        const existing = prev.find(a => a.date === today);
        const habit = habits.find(h => h.id === currentQuestSession.questId);
        const xpEarned = habit?.xpReward || 0;
        
        if (existing) {
          return prev.map(a => a.date === today ? {
            ...a,
            questsCompleted: a.questsCompleted + 1,
            pomodorosCompleted: a.pomodorosCompleted + currentQuestSession.pomodoroCount,
            xpEarned: a.xpEarned + xpEarned
          } : a);
        } else {
          return [...prev, {
            date: today,
            questsCompleted: 1,
            pomodorosCompleted: currentQuestSession.pomodoroCount,
            xpEarned,
            hasLogin: true
          }];
        }
      });
      
      setCurrentQuestSession(null);
    }
  };

  return (
    <GameContext.Provider value={{
      character,
      habits,
      achievements,
      userRoles,
      hasCompletedOnboarding,
      currentQuestSession,
      addHabit,
      completeHabit,
      gainXP,
      setUserRoles,
      generateQuestsFromRoles,
      toggleHabit,
      removeHabit,
      getSuggestedQuests,
      startQuestSession,
      completeQuestSession,
      getDailyActivity,
      getStreakCount,
      recordDailyLogin,
      syncToFirebase,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
