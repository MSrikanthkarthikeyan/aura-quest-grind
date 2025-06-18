
import React from 'react';
import { useGame } from '../context/GameContext';
import { Crown, Zap, Brain, Sword, Shield, Target, Lock } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlockLevel: number;
  unlocked: boolean;
  maxRank: number;
  currentRank: number;
  category: 'focus' | 'discipline' | 'mastery';
}

const SkillTree = () => {
  const { character, habits } = useGame();
  
  const maxStreak = Math.max(...habits.map(h => h.streak), 0);
  const totalCompleted = habits.reduce((sum, h) => sum + h.streak, 0);
  
  const skills: Skill[] = [
    {
      id: 'shadow-focus',
      name: 'Shadow Focus',
      description: 'Increases XP from focus-based activities by 25%',
      icon: <Brain size={24} />,
      unlockLevel: 3,
      unlocked: character.level >= 3,
      maxRank: 3,
      currentRank: Math.min(Math.floor(maxStreak / 5), 3),
      category: 'focus',
    },
    {
      id: 'streak-guardian',
      name: 'Streak Guardian',
      description: 'Prevents streak loss on first missed day',
      icon: <Shield size={24} />,
      unlockLevel: 5,
      unlocked: character.level >= 5,
      maxRank: 1,
      currentRank: maxStreak >= 10 ? 1 : 0,
      category: 'discipline',
    },
    {
      id: 'xp-multiplier',
      name: 'Elite Hunter',
      description: 'Double XP from elite difficulty quests',
      icon: <Crown size={24} />,
      unlockLevel: 8,
      unlocked: character.level >= 8,
      maxRank: 1,
      currentRank: totalCompleted >= 50 ? 1 : 0,
      category: 'mastery',
    },
    {
      id: 'quick-learner',
      name: 'Quick Learner',
      description: 'Academic quests give 50% more Intelligence',
      icon: <Target size={24} />,
      unlockLevel: 4,
      unlocked: character.level >= 4,
      maxRank: 2,
      currentRank: Math.min(Math.floor(character.stats.intelligence / 15), 2),
      category: 'focus',
    },
    {
      id: 'iron-will',
      name: 'Iron Will',
      description: 'Reduces required rest time between focus sessions',
      icon: <Sword size={24} />,
      unlockLevel: 6,
      unlocked: character.level >= 6,
      maxRank: 3,
      currentRank: Math.min(Math.floor(character.stats.wisdom / 12), 3),
      category: 'discipline',
    },
  ];

  const categoryColors = {
    focus: 'from-blue-600 to-cyan-600',
    discipline: 'from-red-600 to-pink-600',
    mastery: 'from-yellow-600 to-amber-600',
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'focus': return <Brain size={20} />;
      case 'discipline': return <Shield size={20} />;
      case 'mastery': return <Crown size={20} />;
      default: return <Zap size={20} />;
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Shadow Arts Mastery
        </h1>
        <p className="text-gray-400">Unlock and upgrade your hunter abilities</p>
      </div>

      {/* Skill Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {(['focus', 'discipline', 'mastery'] as const).map(category => (
          <div key={category} className="space-y-4">
            <div className="text-center">
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r ${categoryColors[category]} text-white font-semibold`}>
                {getCategoryIcon(category)}
                <span className="capitalize">{category}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {skills.filter(skill => skill.category === category).map(skill => (
                <div 
                  key={skill.id}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                    skill.unlocked
                      ? `bg-gradient-to-br from-gray-900/80 to-gray-800/40 border-gray-600/50 hover:border-${category === 'focus' ? 'cyan' : category === 'discipline' ? 'red' : 'yellow'}-500/50`
                      : 'bg-gradient-to-br from-gray-900/40 to-gray-800/20 border-gray-700/30 opacity-60'
                  }`}
                >
                  {!skill.unlocked && (
                    <div className="absolute top-4 right-4">
                      <Lock size={20} className="text-gray-500" />
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      skill.unlocked 
                        ? `bg-gradient-to-r ${categoryColors[category]} text-white`
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {skill.icon}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg mb-1 ${
                        skill.unlocked ? 'text-white' : 'text-gray-500'
                      }`}>
                        {skill.name}
                      </h3>
                      
                      <p className={`text-sm mb-3 ${
                        skill.unlocked ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {skill.description}
                      </p>
                      
                      {skill.unlocked ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Rank</span>
                            <span className="text-cyan-400">{skill.currentRank}/{skill.maxRank}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${categoryColors[category]} transition-all duration-500`}
                              style={{ width: `${(skill.currentRank / skill.maxRank) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Unlock at Level {skill.unlockLevel}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Character Stats Summary */}
      <div className="bg-gradient-to-br from-gray-900/90 to-purple-900/40 rounded-2xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4">Hunter Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">{character.level}</div>
            <div className="text-sm text-gray-400">Level</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">{maxStreak}</div>
            <div className="text-sm text-gray-400">Max Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{totalCompleted}</div>
            <div className="text-sm text-gray-400">Total Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{skills.filter(s => s.unlocked && s.currentRank > 0).length}</div>
            <div className="text-sm text-gray-400">Active Skills</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTree;
