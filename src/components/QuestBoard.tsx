import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Plus, Target, Zap, Flame, Crown, Settings, Lightbulb, Sparkles, Calendar } from 'lucide-react';
import QuestSuggestions from './QuestSuggestions';
import AIQuestGenerator from './AIQuestGenerator';
import QuestPomodoroLauncher from './QuestPomodoroLauncher';
import CalendarHeatmap from './CalendarHeatmap';

const QuestBoard = () => {
  const { habits, completeHabit, character, addHabit, startQuestSession } = useGame();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showPomodoroLauncher, setShowPomodoroLauncher] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCalendar, setShowCalendar] = useState(false);
  
  const newHabit = {
    title: '',
    category: 'Personal',
    xpReward: 25,
    frequency: 'daily' as const,
    difficulty: 'basic' as const,
    description: '',
    tier: 1,
  };

  const categories = ['all', 'Tech', 'Academics', 'Business', 'Content', 'Fitness', 'Personal'];
  const categoryColors = {
    'Tech': 'from-green-600 to-emerald-600',
    'Academics': 'from-blue-600 to-indigo-600',
    'Business': 'from-yellow-600 to-orange-600',
    'Content': 'from-pink-600 to-rose-600',
    'Fitness': 'from-red-600 to-pink-600',
    'Personal': 'from-purple-600 to-violet-600',
  };

  const difficultyColors = {
    'basic': 'text-green-400',
    'intermediate': 'text-yellow-400',
    'elite': 'text-red-400',
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabit.title.trim()) {
      addHabit(newHabit);
      setNewHabit({ 
        title: '', 
        category: 'Personal', 
        xpReward: 25, 
        frequency: 'daily',
        difficulty: 'basic',
        description: '',
        tier: 1,
      });
      setShowAddForm(false);
    }
  };

  const handleQuestClick = (habit: any) => {
    setSelectedQuest(habit);
    setShowPomodoroLauncher(true);
  };

  const handlePomodoroConfirm = (quest: any, pomodoroCount: number) => {
    startQuestSession(quest.id, pomodoroCount);
    setShowPomodoroLauncher(false);
  };

  const filteredHabits = selectedCategory === 'all' 
    ? habits 
    : habits.filter(habit => habit.category === selectedCategory);

  const completedToday = habits.filter(h => h.completed).length;
  const totalQuests = habits.length;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Quest Board
          </h1>
          <p className="text-gray-400 mt-2">
            Progress: {completedToday}/{totalQuests} quests completed today
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
          >
            <Calendar size={18} />
            <span>History</span>
          </button>
          <button
            onClick={() => setShowAIGenerator(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            <Sparkles size={18} />
            <span>AI Quests</span>
          </button>
          <button
            onClick={() => setShowSuggestions(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
          >
            <Lightbulb size={18} />
            <span>Suggestions</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            <Plus size={20} />
            <span>Custom Quest</span>
          </button>
        </div>
      </div>

      {/* Calendar Heatmap */}
      {showCalendar && (
        <CalendarHeatmap />
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category === 'all' ? 'All Quests' : category}
          </button>
        ))}
      </div>

      {/* AI Quest Generator Modal */}
      {showAIGenerator && (
        <AIQuestGenerator onClose={() => setShowAIGenerator(false)} />
      )}

      {/* Quest Pomodoro Launcher Modal */}
      {showPomodoroLauncher && selectedQuest && (
        <QuestPomodoroLauncher
          quest={selectedQuest}
          onClose={() => setShowPomodoroLauncher(false)}
          onConfirm={handlePomodoroConfirm}
        />
      )}

      {/* Quest Suggestions Modal */}
      {showSuggestions && (
        <QuestSuggestions onClose={() => setShowSuggestions(false)} />
      )}

      {/* Add Custom Quest Form */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-gray-900/90 to-purple-900/40 rounded-2xl p-6 border border-purple-500/30">
          <h3 className="text-xl font-bold mb-4">Forge Custom Quest</h3>
          <form onSubmit={handleAddHabit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quest Name</label>
              <input
                type="text"
                value={newHabit.title}
                onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Enter your custom quest..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={newHabit.description}
                onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none h-20"
                placeholder="Describe your quest objective..."
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
                  {categories.filter(cat => cat !== 'all').map(cat => (
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
                Forge Quest
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

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHabits.map(habit => (
          <div 
            key={habit.id} 
            className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              habit.completed 
                ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30 hover:shadow-green-500/25' 
                : 'bg-gradient-to-br from-gray-900/80 to-gray-800/40 border-gray-700/50 hover:shadow-purple-500/25'
            }`}
          >
            {/* Difficulty Badge */}
            <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-bold ${difficultyColors[habit.difficulty]} bg-black/50`}>
              {habit.difficulty === 'elite' && <Crown size={12} className="inline mr-1" />}
              {habit.difficulty.toUpperCase()}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-white mb-1">{habit.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColors[habit.category as keyof typeof categoryColors]} text-white`}>
                    {habit.category}
                  </span>
                  {habit.description && (
                    <p className="text-gray-400 text-sm mt-2">{habit.description}</p>
                  )}
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
                  <div className="text-purple-400 text-xs">
                    {habit.frequency}
                  </div>
                </div>
              </div>

              {!habit.completed && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleQuestClick(habit)}
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Target size={18} />
                    <span>Start Quest</span>
                  </button>
                  <button
                    onClick={() => completeHabit(habit.id)}
                    className="w-full bg-gray-700/50 py-2 rounded-lg font-medium text-sm hover:bg-gray-600/50 transition-all duration-300"
                  >
                    Mark Complete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {filteredHabits.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">No quests available for this category.</p>
            <p className="text-gray-500 text-sm mt-2">Try adding a custom quest or check suggestions!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestBoard;
