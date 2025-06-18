
import React from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Star, Target, Zap, Clock, Shield } from 'lucide-react';

const Achievements = () => {
  const { achievements } = useGame();

  const allAchievements = [
    {
      id: '1',
      title: 'Shadow Awakening',
      description: 'Complete your first habit',
      unlocked: true,
      icon: '🌟',
      category: 'Beginner',
      rarity: 'Common',
    },
    {
      id: '2',
      title: 'Grind Master',
      description: 'Maintain a 7-day streak',
      unlocked: false,
      icon: '⚔️',
      category: 'Consistency',
      rarity: 'Rare',
    },
    {
      id: '3',
      title: 'Focus Demon',
      description: 'Complete 10 Pomodoro sessions',
      unlocked: false,
      icon: '🔥',
      category: 'Focus',
      rarity: 'Epic',
    },
    {
      id: '4',
      title: 'Level 10 Hunter',
      description: 'Reach level 10',
      unlocked: false,
      icon: '👑',
      category: 'Progression',
      rarity: 'Legendary',
    },
    {
      id: '5',
      title: 'Knowledge Seeker',
      description: 'Complete 50 academic habits',
      unlocked: false,
      icon: '📚',
      category: 'Learning',
      rarity: 'Rare',
    },
    {
      id: '6',
      title: 'Code Warrior',
      description: 'Complete 30 tech habits',
      unlocked: false,
      icon: '💻',
      category: 'Technology',
      rarity: 'Epic',
    },
  ];

  const getRarityColor = (rarity: string) => {
    const colors = {
      'Common': 'from-gray-600 to-gray-500',
      'Rare': 'from-blue-600 to-cyan-500',
      'Epic': 'from-purple-600 to-pink-500',
      'Legendary': 'from-yellow-500 to-orange-500',
    };
    return colors[rarity as keyof typeof colors] || 'from-gray-600 to-gray-500';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Beginner': Star,
      'Consistency': Target,
      'Focus': Zap,
      'Progression': Trophy,
      'Learning': Shield,
      'Technology': Clock,
    };
    return icons[category as keyof typeof icons] || Star;
  };

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Hall of Fame
        </h1>
        <p className="text-gray-400">Your legendary accomplishments</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 rounded-xl p-6 border border-yellow-500/30 text-center">
          <Trophy className="mx-auto mb-3 text-yellow-400" size={32} />
          <h3 className="text-2xl font-bold text-white">
            {allAchievements.filter(a => a.unlocked).length}
          </h3>
          <p className="text-yellow-400">Unlocked</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-6 border border-purple-500/30 text-center">
          <Star className="mx-auto mb-3 text-purple-400" size={32} />
          <h3 className="text-2xl font-bold text-white">
            {allAchievements.filter(a => a.rarity === 'Legendary').length}
          </h3>
          <p className="text-purple-400">Legendary</p>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-xl p-6 border border-cyan-500/30 text-center">
          <Target className="mx-auto mb-3 text-cyan-400" size={32} />
          <h3 className="text-2xl font-bold text-white">
            {Math.floor((allAchievements.filter(a => a.unlocked).length / allAchievements.length) * 100)}%
          </h3>
          <p className="text-cyan-400">Progress</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-6 border border-green-500/30 text-center">
          <Zap className="mx-auto mb-3 text-green-400" size={32} />
          <h3 className="text-2xl font-bold text-white">1250</h3>
          <p className="text-green-400">Achievement XP</p>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allAchievements.map(achievement => {
          const CategoryIcon = getCategoryIcon(achievement.category);
          return (
            <div 
              key={achievement.id} 
              className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                achievement.unlocked 
                  ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)}/20 border-current hover:scale-105 hover:shadow-xl`
                  : 'bg-gradient-to-br from-gray-900/40 to-gray-800/40 border-gray-700/50 opacity-60'
              }`}
            >
              {achievement.unlocked && (
                <div className="absolute top-0 right-0 p-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex flex-col items-end space-y-1">
                    <CategoryIcon size={20} className="text-gray-400" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`}>
                      {achievement.rarity}
                    </span>
                  </div>
                </div>

                <h3 className={`font-bold text-lg mb-2 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                  {achievement.title}
                </h3>
                <p className={`text-sm mb-3 ${achievement.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                  {achievement.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{achievement.category}</span>
                  {achievement.unlocked ? (
                    <span className="text-green-400 text-sm font-medium">Unlocked ✓</span>
                  ) : (
                    <span className="text-gray-500 text-sm">Locked 🔒</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
