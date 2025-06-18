
import React from 'react';
import { useGame } from '../context/GameContext';
import { Zap, Target, Clock, TrendingUp, Settings, Crown } from 'lucide-react';

const Dashboard = () => {
  const { character, habits, userRoles } = useGame();
  
  const todayHabits = habits.filter(h => !h.completed);
  const completedToday = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;
  const maxStreak = Math.max(...habits.map(h => h.streak), 0);
  const eliteQuests = habits.filter(h => h.difficulty === 'elite').length;

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

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Welcome Back, {character.name}
        </h1>
        <p className="text-gray-400 text-lg">Level {character.level} {character.class}</p>
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
          <div className="flex items-center space-x-2 text-cyan-400">
            <Zap size={20} />
            <span className="font-bold">{character.xp} XP</span>
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
            </div>
            <Target className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Current Level</p>
              <p className="text-3xl font-bold text-white">{character.level}</p>
            </div>
            <TrendingUp className="text-purple-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium">Max Streak</p>
              <p className="text-3xl font-bold text-white">{maxStreak}</p>
            </div>
            <div className="text-orange-400 text-3xl">🔥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/40 to-amber-900/40 rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-medium">Elite Quests</p>
              <p className="text-3xl font-bold text-white">{eliteQuests}</p>
            </div>
            <Crown className="text-yellow-400" size={32} />
          </div>
        </div>
      </div>

      {/* Today's Quests */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold mb-4 text-white">Active Quests</h3>
        <div className="space-y-3">
          {todayHabits.slice(0, 5).map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-white">{habit.title}</p>
                  {habit.difficulty === 'elite' && <Crown size={16} className="text-yellow-400" />}
                </div>
                <p className="text-sm text-gray-400">{habit.category} • {habit.xpReward} XP • {habit.frequency}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-400 text-sm">🔥 {habit.streak}</span>
              </div>
            </div>
          ))}
          {todayHabits.length === 0 && (
            <p className="text-gray-400 text-center py-4">All quests completed for today! 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
