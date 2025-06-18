
import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

interface GameContextType {
  character: Character;
  habits: Habit[];
  achievements: Achievement[];
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completed'>) => void;
  completeHabit: (habitId: string) => void;
  gainXP: (amount: number, statType?: string) => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [character, setCharacter] = useState<Character>({
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
  });

  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      title: 'Morning Reading Quest',
      category: 'Academics',
      xpReward: 25,
      streak: 3,
      completed: false,
    },
    {
      id: '2',
      title: 'Code Training Dungeon',
      category: 'Tech',
      xpReward: 35,
      streak: 1,
      completed: false,
    },
    {
      id: '3',
      title: 'Strength Training Raid',
      category: 'Fitness',
      xpReward: 30,
      streak: 5,
      completed: true,
    },
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Shadow Awakening',
      description: 'Complete your first habit',
      unlocked: true,
      icon: '🌟',
    },
    {
      id: '2',
      title: 'Grind Master',
      description: 'Maintain a 7-day streak',
      unlocked: false,
      icon: '⚔️',
    },
  ]);

  const addHabit = (habitData: Omit<Habit, 'id' | 'streak' | 'completed'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      streak: 0,
      completed: false,
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const completeHabit = (habitId: string) => {
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id === habitId && !habit.completed) {
          gainXP(habit.xpReward, getCategoryStatType(habit.category));
          return {
            ...habit,
            completed: true,
            streak: habit.streak + 1,
            lastCompleted: new Date().toISOString(),
          };
        }
        return habit;
      })
    );
  };

  const getCategoryStatType = (category: string): string => {
    const statMap: { [key: string]: string } = {
      'Academics': 'intelligence',
      'Tech': 'intelligence',
      'Business': 'charisma',
      'Fitness': 'strength',
      'Personal': 'wisdom',
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

  return (
    <GameContext.Provider value={{
      character,
      habits,
      achievements,
      addHabit,
      completeHabit,
      gainXP,
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
