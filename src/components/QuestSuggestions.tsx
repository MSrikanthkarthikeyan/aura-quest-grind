
import React from 'react';
import { useGame } from '../context/GameContext';
import { X, Plus, Zap, Crown } from 'lucide-react';

interface QuestSuggestionsProps {
  onClose: () => void;
}

const QuestSuggestions = ({ onClose }: QuestSuggestionsProps) => {
  const { getSuggestedQuests, addHabit } = useGame();
  const suggestedQuests = getSuggestedQuests();

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

  const handleAddQuest = (quest: any) => {
    addHabit({
      title: quest.title,
      category: quest.category,
      xpReward: quest.xpReward,
      frequency: quest.frequency,
      difficulty: quest.difficulty,
      description: quest.description,
      tier: quest.tier,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900/95 to-purple-900/50 rounded-2xl border border-purple-500/30 max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Suggested Quests
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {suggestedQuests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No new quest suggestions available.</p>
              <p className="text-gray-500 text-sm mt-2">You've unlocked all available quests for your current level and roles!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedQuests.map(quest => (
                <div
                  key={quest.id}
                  className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-xl p-5 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-bold text-white">{quest.title}</h3>
                        {quest.difficulty === 'elite' && (
                          <Crown size={16} className="text-yellow-400" />
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColors[quest.category as keyof typeof categoryColors]} text-white`}>
                        {quest.category}
                      </span>
                    </div>
                    <div className={`text-xs font-bold ${difficultyColors[quest.difficulty]}`}>
                      {quest.difficulty.toUpperCase()}
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4">{quest.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-cyan-400">
                        <Zap size={14} />
                        <span>{quest.xpReward} XP</span>
                      </div>
                      <div className="text-purple-400 text-xs">
                        {quest.frequency}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddQuest(quest)}
                      className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-cyan-600 px-3 py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestSuggestions;
