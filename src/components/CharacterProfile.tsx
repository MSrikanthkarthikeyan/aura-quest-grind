
import React from 'react';
import { useGame } from '../context/GameContext';
import { Zap, TrendingUp, Shield, Sword, Brain, Heart, Eye } from 'lucide-react';

const CharacterProfile = () => {
  const { character } = useGame();

  const statIcons = {
    intelligence: Brain,
    strength: Sword,
    dexterity: Eye,
    charisma: Heart,
    wisdom: Shield,
  };

  const getStatColor = (stat: string) => {
    const colors = {
      intelligence: 'text-blue-400',
      strength: 'text-red-400',
      dexterity: 'text-green-400',
      charisma: 'text-pink-400',
      wisdom: 'text-purple-400',
    };
    return colors[stat as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Hunter Profile
        </h1>
        <p className="text-gray-400">Your journey to greatness</p>
      </div>

      {/* Character Overview */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Avatar & Basic Info */}
        <div className="bg-gradient-to-br from-gray-900/90 to-purple-900/40 rounded-2xl p-8 border border-purple-500/30 text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full flex items-center justify-center text-6xl">
            🥷
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{character.name}</h2>
          <p className="text-xl text-purple-400 mb-4">{character.class}</p>
          
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{character.level}</p>
              <p className="text-sm text-gray-400">Level</p>
            </div>
            <div className="w-px h-8 bg-gray-600"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">{character.xp}</p>
              <p className="text-sm text-gray-400">Total XP</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next Level</span>
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

        {/* Stats */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <TrendingUp className="mr-3 text-purple-400" />
            Hunter Stats
          </h3>
          
          {Object.entries(character.stats).map(([stat, value]) => {
            const Icon = statIcons[stat as keyof typeof statIcons];
            return (
              <div key={stat} className="bg-gradient-to-r from-gray-900/80 to-gray-800/40 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className={`${getStatColor(stat)}`} size={24} />
                    <span className="font-medium text-white capitalize">{stat}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          stat === 'intelligence' ? 'bg-blue-500' :
                          stat === 'strength' ? 'bg-red-500' :
                          stat === 'dexterity' ? 'bg-green-500' :
                          stat === 'charisma' ? 'bg-pink-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${Math.min((value / 20) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="font-bold text-white text-lg w-8">{value}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Preview */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-8 border border-gray-700/50">
        <h3 className="text-2xl font-bold text-white mb-6">Recent Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 rounded-xl p-4 border border-yellow-500/30 text-center">
            <div className="text-3xl mb-2">🌟</div>
            <h4 className="font-bold text-white">Shadow Awakening</h4>
            <p className="text-sm text-yellow-400">First quest completed</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl p-4 border border-gray-600/50 text-center opacity-50">
            <div className="text-3xl mb-2">⚔️</div>
            <h4 className="font-bold text-gray-400">Grind Master</h4>
            <p className="text-sm text-gray-500">7-day streak</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl p-4 border border-gray-600/50 text-center opacity-50">
            <div className="text-3xl mb-2">🔥</div>
            <h4 className="font-bold text-gray-400">Focus Demon</h4>
            <p className="text-sm text-gray-500">10 focus sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterProfile;
