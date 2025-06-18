
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Plus, Target, Zap, Flame } from 'lucide-react';

const HabitTracker = () => {
  const { habits, addHabit, completeHabit } = useGame();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    category: 'Personal',
    xpReward: 25,
  });

  const categories = ['Academics', 'Tech', 'Business', 'Fitness', 'Personal'];
  const categoryColors = {
    'Academics': 'from-blue-600 to-indigo-600',
    'Tech': 'from-green-600 to-emerald-600',
    'Business': 'from-yellow-600 to-orange-600',
    'Fitness': 'from-red-600 to-pink-600',
    'Personal': 'from-purple-600 to-violet-600',
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabit.title.trim()) {
      addHabit(newHabit);
      setNewHabit({ title: '', category: 'Personal', xpReward: 25 });
      setShowAddForm(false);
    }
  };

  const handleCompleteHabit = (habitId: string) => {
    completeHabit(habitId);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Quest Log
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
        >
          <Plus size={20} />
          <span>New Quest</span>
        </button>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-gray-900/90 to-purple-900/40 rounded-2xl p-6 border border-purple-500/30">
          <h3 className="text-xl font-bold mb-4">Create New Quest</h3>
          <form onSubmit={handleAddHabit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quest Name</label>
              <input
                type="text"
                value={newHabit.title}
                onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Enter your quest..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newHabit.category}
                  onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">XP Reward</label>
                <input
                  type="number"
                  value={newHabit.xpReward}
                  onChange={(e) => setNewHabit({ ...newHabit, xpReward: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                  min="10"
                  max="100"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Create Quest
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map(habit => (
          <div 
            key={habit.id} 
            className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              habit.completed 
                ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30 hover:shadow-green-500/25' 
                : 'bg-gradient-to-br from-gray-900/80 to-gray-800/40 border-gray-700/50 hover:shadow-purple-500/25'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-white mb-1">{habit.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColors[habit.category as keyof typeof categoryColors]} text-white`}>
                    {habit.category}
                  </span>
                </div>
                {habit.completed && (
                  <div className="text-green-400 text-2xl">✓</div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-cyan-400">
                    <Zap size={16} />
                    <span>{habit.xpReward} XP</span>
                  </div>
                  <div className="flex items-center space-x-1 text-orange-400">
                    <Flame size={16} />
                    <span>{habit.streak}</span>
                  </div>
                </div>
              </div>

              {!habit.completed && (
                <button
                  onClick={() => handleCompleteHabit(habit.id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Target size={18} />
                  <span>Complete Quest</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitTracker;
