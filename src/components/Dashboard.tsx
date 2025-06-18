
import React from 'react';
import { useGame } from '../context/GameContext';
import { Zap, Target, Clock, TrendingUp, Settings, Crown, Calendar, Award } from 'lucide-react';

const Dashboard = () => {
  const { character, habits, userRoles } = useGame();
  
  const todayHabits = habits.filter(h => !h.completed);
  const completedToday = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;
  const maxStreak = Math.max(...habits.map(h => h.streak), 0);
  const eliteQuests = habits.filter(h => h.difficulty === 'elite').length;
  const totalXPEarned = habits.reduce((sum, h) => sum + (h.streak * h.xpReward), 0);

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'developer': 'Code Hunter',
      'student': 'Knowledge Seeker',
      'entrepreneur': 'Business Demon',
      'influencer': 'Digital Sovereign',
      'fitness': 'Physical Ascendant',
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getHunterTitle = () => {
    if (character.level >= 15) return 'Shadow Sovereign';
    if (character.level >= 10) return 'Elite Hunter';
    if (character.level >= 7) return 'Dark Knight';
    if (character.level >= 5) return 'Shadow Walker';
    if (character.level >= 3) return 'Apprentice Hunter';
    return 'Novice Seeker';
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Welcome Back, {character.name}
        </h1>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <p className="text-gray-400 text-lg">Level {character.level}</p>
          <span className="text-gray-500">•</span>
          <p className="text-yellow-400 text-lg font-semibold">{getHunterTitle()}</p>
        </div>
        {userRoles && (
          <div className="flex justify-center space-x-2 mt-3">
            {userRoles.roles.map(role => (
              <span
                key={role}
                className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-full text-sm font-medium"
              >
                {getRoleDisplayName(role)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Character Overview */}
      <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/40 rounded-2xl p-6 border border-purple-500/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Hunter Status</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Zap size={20} />
              <span className="font-bold">{character.xp} XP</span>
            </div>
            <div className="flex items-center space-x-2 text-yellow-400">
              <Award size={20} />
              <span className="font-bold">{totalXPEarned} Total XP</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Level Progress</span>
              <span>{character.xp}/{character.xpToNext} XP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(character.xp / character.xpToNext) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Quests Completed</p>
              <p className="text-3xl font-bold text-white">{completedToday}/{totalHabits}</p>
              <p className="text-xs text-green-300 mt-1">Today's Progress</p>
            </div>
            <Target className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Hunter Level</p>
              <p className="text-3xl font-bold text-white">{character.level}</p>
              <p className="text-xs text-purple-300 mt-1">{getHunterTitle()}</p>
            </div>
            <TrendingUp className="text-purple-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium">Max Streak</p>
              <p className="text-3xl font-bold text-white">{maxStreak}</p>
              <p className="text-xs text-orange-300 mt-1">Consecutive Days</p>
            </div>
            <div className="text-orange-400 text-3xl">🔥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/40 to-amber-900/40 rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-medium">Elite Quests</p>
              <p className="text-3xl font-bold text-white">{eliteQuests}</p>
              <p className="text-xs text-yellow-300 mt-1">High Difficulty</p>
            </div>
            <Crown className="text-yellow-400" size={32} />
          </div>
        </div>
      </div>

      {/* Today's Quests */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Active Quests</h3>
          <div className="flex items-center space-x-2 text-gray-400">
            <Calendar size={16} />
            <span className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="space-y-3">
          {todayHabits.slice(0, 5).map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800/70 transition-colors">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="font-medium text-white">{habit.title}</p>
                  {habit.difficulty === 'elite' && <Crown size={16} className="text-yellow-400" />}
                  {habit.difficulty === 'intermediate' && <span className="text-yellow-400 text-xs">★</span>}
                </div>
                <p className="text-sm text-gray-400">{habit.category} • {habit.xpReward} XP • {habit.frequency}</p>
                {habit.description && (
                  <p className="text-xs text-gray-500 mt-1">{habit.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-orange-400 text-sm flex items-center space-x-1">
                  <span>🔥</span>
                  <span>{habit.streak}</span>
                </span>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  habit.difficulty === 'elite' ? 'bg-red-900/50 text-red-300' :
                  habit.difficulty === 'intermediate' ? 'bg-yellow-900/50 text-yellow-300' :
                  'bg-green-900/50 text-green-300'
                }`}>
                  {habit.difficulty.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
          {todayHabits.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg mb-2">All quests completed for today! 🎉</p>
              <p className="text-gray-500 text-sm">Your dedication to the hunt is exemplary, Shadow Hunter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
