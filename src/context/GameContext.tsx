
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { questTemplates, getQuestsForRoles, QuestTemplate } from '../utils/questTemplates';
import { useAuth } from './AuthContext';
import { firebaseDataService } from '../services/firebaseDataService';
import { cacheService } from '../services/cacheService';
import { QuestSubtask, QuestFollowUp, EnhancedQuestTemplate } from '../types/quest';

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

interface EnhancedHabit extends Habit {
  subtasks?: QuestSubtask[];
  totalEstimatedPomodoros?: number;
  currentSubtaskIndex?: number;
  followUps?: QuestFollowUp[];
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
  getSuggestedQuests: () => EnhancedQuestTemplate[];
  startQuestSession: (questId: string, pomodoroCount: number) => void;
  completeQuestSession: () => void;
  getDailyActivity: (date: string) => DailyActivity;
  getStreakCount: () => number;
  recordDailyLogin: () => void;
  syncToFirebase: () => void;
  completeSubtask: (habitId: string, subtaskId: string) => void;
  addQuestFollowUp: (habitId: string, followUp: QuestFollowUp) => void;
  getQuestFollowUps: (habitId: string) => QuestFollowUp[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Enhanced state with caching
  const [character, setCharacter] = useState<Character>(() => {
    const cached = cacheService.get<Character>('character');
    if (cached) return cached;
    
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
    const cached = cacheService.get<UserRoles>('userRoles');
    if (cached) return cached;
    
    const saved = localStorage.getItem('userRoles');
    return saved ? JSON.parse(saved) : null;
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('hasCompletedOnboarding') === 'true';
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const cached = cacheService.get<Habit[]>('habits');
    if (cached) return cached;
    
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const cached = cacheService.get<Achievement[]>('achievements');
    if (cached) return cached;
    
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
    const cached = cacheService.get<DailyActivity[]>('dailyActivities');
    if (cached) return cached;
    
    const saved = localStorage.getItem('dailyActivities');
    return saved ? JSON.parse(saved) : [];
  });

  // Add sync control states with better debouncing
  const [isSyncEnabled, setIsSyncEnabled] = useState(true);
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSyncDataRef = useRef<string>('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Optimized debounced sync function
  const debouncedSync = useCallback((data: any) => {
    const dataString = JSON.stringify(data);
    if (dataString === lastSyncDataRef.current) {
      return; // No changes, skip sync
    }
    lastSyncDataRef.current = dataString;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      if (isSyncEnabled && user) {
        syncToFirebase();
      }
    }, 1000);
  }, [isSyncEnabled, user]);

  // Enhanced Firebase sync effect with caching
  useEffect(() => {
    if (user && isSyncEnabled) {
      console.log('Setting up Firebase sync for user:', user.uid);
      
      // Check if we have cached data first
      const hasCachedData = cacheService.hasCache('gameData');
      if (!hasCachedData) {
        setIsInitialLoading(true);
      }
      
      // Load data from Firebase when user logs in
      loadFromFirebase().finally(() => {
        setIsInitialLoading(false);
      });
      
      // Set up real-time listener with reduced frequency
      const unsubscribe = firebaseDataService.subscribeToGameData(user.uid, (data) => {
        if (data && isSyncEnabled) {
          console.log('Received Firebase update, applying changes...');
          
          // Cache the received data
          cacheService.set('gameData', data, 10 * 60 * 1000); // 10 minutes
          
          if (data.character) {
            setCharacter(data.character);
            cacheService.set('character', data.character);
          }
          if (data.habits) {
            setHabits(data.habits);
            cacheService.set('habits', data.habits);
          }
          if (data.achievements) {
            setAchievements(data.achievements);
            cacheService.set('achievements', data.achievements);
          }
          if (data.userRoles) {
            setUserRolesState(data.userRoles);
            setHasCompletedOnboarding(true);
            cacheService.set('userRoles', data.userRoles);
          }
          if (data.dailyActivities) {
            setDailyActivities(data.dailyActivities);
            cacheService.set('dailyActivities', data.dailyActivities);
          }
        }
      });

      return () => {
        console.log('Cleaning up Firebase sync');
        unsubscribe();
      };
    } else {
      setIsInitialLoading(false);
    }
  }, [user, isSyncEnabled]);

  const loadFromFirebase = async () => {
    if (!user) return;
    
    try {
      // Try cache first
      const cachedData = cacheService.get<any>('gameData');
      if (cachedData) {
        console.log('Using cached game data');
        if (cachedData.character) setCharacter(cachedData.character);
        if (cachedData.habits) setHabits(cachedData.habits);
        if (cachedData.achievements) setAchievements(cachedData.achievements);
        if (cachedData.userRoles) {
          setUserRolesState(cachedData.userRoles);
          setHasCompletedOnboarding(true);
        }
        if (cachedData.dailyActivities) setDailyActivities(cachedData.dailyActivities);
        
        // Still fetch fresh data in background
        firebaseDataService.loadGameData(user.uid).then(data => {
          if (data) {
            cacheService.set('gameData', data);
          }
        }).catch(console.error);
        
        return;
      }
      
      const data = await firebaseDataService.loadGameData(user.uid);
      if (data) {
        // Cache the loaded data
        cacheService.set('gameData', data);
        
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
    if (!user || !isSyncEnabled) return;

    try {
      console.log('Syncing to Firebase...');
      const gameData = {
        character,
        habits,
        achievements,
        userRoles,
        dailyActivities
      };
      
      await firebaseDataService.saveGameData(user.uid, gameData);
      
      // Update cache
      cacheService.set('gameData', gameData);
      console.log('Firebase sync completed');
    } catch (error) {
      console.error('Error syncing to Firebase:', error);
    }
  };

  // Optimized auto-sync with debouncing and caching
  useEffect(() => {
    if (user && isSyncEnabled && !isInitialLoading) {
      // Cache locally immediately
      cacheService.set('character', character);
      cacheService.set('habits', habits);
      cacheService.set('achievements', achievements);
      if (userRoles) cacheService.set('userRoles', userRoles);
      cacheService.set('dailyActivities', dailyActivities);
      
      // Debounced sync to Firebase
      debouncedSync({ character, habits, achievements, userRoles, dailyActivities });
    }
  }, [character, habits, achievements, userRoles, dailyActivities, user, isSyncEnabled, isInitialLoading, debouncedSync]);

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
    console.log('Setting user roles and completing onboarding:', roles);
    
    // Temporarily disable sync to prevent loops during onboarding
    setIsSyncEnabled(false);
    
    setUserRolesState(roles);
    setHasCompletedOnboarding(true);
    localStorage.setItem('hasCompletedOnboarding', 'true');
    localStorage.setItem('userRoles', JSON.stringify(roles));
    
    generateQuestsFromRoles(roles);
    
    // Re-enable sync after onboarding
    setTimeout(() => {
      console.log('Re-enabling Firebase sync after onboarding');
      setIsSyncEnabled(true);
    }, 2000);
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
          const enhancedHabit = habit as EnhancedHabit;
          let updatedHabit = { ...enhancedHabit };
          
          // If habit has subtasks, check if all are completed
          if (enhancedHabit.subtasks && enhancedHabit.subtasks.length > 0) {
            const allSubtasksCompleted = enhancedHabit.subtasks.every(st => st.isCompleted);
            if (!allSubtasksCompleted) {
              console.log('Not all subtasks completed for habit:', habitId);
              return habit; // Don't complete if subtasks remain
            }
          }
          
          const newStreak = habit.streak + 1;
          gainXP(habit.xpReward, getCategoryStatType(habit.category));
          
          // Check for achievements
          checkAchievements(newStreak);
          
          updatedHabit = {
            ...updatedHabit,
            completed: true,
            streak: newStreak,
            lastCompleted: new Date().toISOString(),
          };
          
          return updatedHabit;
        }
        return habit;
      })
    );
  };

  const completeSubtask = (habitId: string, subtaskId: string) => {
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id === habitId) {
          const enhancedHabit = habit as EnhancedHabit;
          if (!enhancedHabit.subtasks) return habit;
          
          const updatedSubtasks = enhancedHabit.subtasks.map(subtask =>
            subtask.id === subtaskId ? { ...subtask, isCompleted: true } : subtask
          );
          
          // Find next incomplete subtask
          const nextIncompleteIndex = updatedSubtasks.findIndex(st => !st.isCompleted);
          
          const updatedHabit: EnhancedHabit = {
            ...enhancedHabit,
            subtasks: updatedSubtasks,
            currentSubtaskIndex: nextIncompleteIndex === -1 ? updatedSubtasks.length - 1 : nextIncompleteIndex
          };
          
          // If all subtasks are completed, allow quest completion
          if (nextIncompleteIndex === -1) {
            console.log('All subtasks completed for habit:', habitId);
          }
          
          return updatedHabit;
        }
        return habit;
      })
    );
  };

  const addQuestFollowUp = (habitId: string, followUp: QuestFollowUp) => {
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id === habitId) {
          const enhancedHabit = habit as EnhancedHabit;
          const updatedFollowUps = [...(enhancedHabit.followUps || []), followUp];
          
          return {
            ...enhancedHabit,
            followUps: updatedFollowUps
          };
        }
        return habit;
      })
    );
  };

  const getQuestFollowUps = (habitId: string): QuestFollowUp[] => {
    const habit = habits.find(h => h.id === habitId) as EnhancedHabit;
    return habit?.followUps || [];
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

  const getSuggestedQuests = (): EnhancedQuestTemplate[] => {
    if (!userRoles) return [];
    
    const maxStreak = Math.max(...habits.map(h => h.streak), 0);
    const allAvailableQuests = getQuestsForRoles(
      userRoles.roles, 
      userRoles.fitnessTypes, 
      character.level, 
      maxStreak
    );
    
    const currentQuestIds = habits.map(h => h.id);
    const filteredQuests = allAvailableQuests.filter(quest => !currentQuestIds.includes(quest.id));
    
    // Convert QuestTemplate to EnhancedQuestTemplate
    return filteredQuests.map(quest => ({
      ...quest,
      subtasks: [],
      totalEstimatedPomodoros: 1
    }));
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

  // Optimized auto-sync with debouncing and caching
  useEffect(() => {
    if (user && isSyncEnabled && !isInitialLoading) {
      // Cache locally immediately
      cacheService.set('character', character);
      cacheService.set('habits', habits);
      cacheService.set('achievements', achievements);
      if (userRoles) cacheService.set('userRoles', userRoles);
      cacheService.set('dailyActivities', dailyActivities);
      
      // Debounced sync to Firebase
      debouncedSync({ character, habits, achievements, userRoles, dailyActivities });
    }
  }, [character, habits, achievements, userRoles, dailyActivities, user, isSyncEnabled, isInitialLoading, debouncedSync]);

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
      completeSubtask,
      addQuestFollowUp,
      getQuestFollowUps,
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
