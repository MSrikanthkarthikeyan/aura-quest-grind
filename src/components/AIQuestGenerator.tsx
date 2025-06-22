import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { generateAIQuests, AIQuestRequest, AIQuestResponse } from '../services/geminiService';
import { Sparkles, Loader2, RefreshCw, Plus, X } from 'lucide-react';

interface AIQuestGeneratorProps {
  onClose: () => void;
}

const AIQuestGenerator = ({ onClose }: AIQuestGeneratorProps) => {
  const { userRoles, character, addHabit } = useGame();
  const [loading, setLoading] = useState(false);
  const [generatedQuests, setGeneratedQuests] = useState<AIQuestResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuests, setSelectedQuests] = useState<Set<number>>(new Set());

  const [questParams, setQuestParams] = useState<AIQuestRequest>({
    roles: userRoles?.roles || [],
    goals: [],
    skillLevel: 'Intermediate',
    timeCommitment: '1-2 hours daily',
    fitnessTypes: userRoles?.fitnessTypes || [],
  });

  const handleGenerateQuests = async (e?: React.MouseEvent) => {
    console.log('=== AI QUEST BUTTON CLICKED ===');
    console.log('Event:', e);
    console.log('Button disabled?', loading || questParams.goals.length === 0);
    console.log('Loading state:', loading);
    console.log('Goals count:', questParams.goals.length);
    console.log('Quest params:', questParams);
    
    // Prevent default if it's a form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (questParams.goals.length === 0) {
      console.log('ERROR: No goals provided');
      setError('Please add at least one goal');
      return;
    }

    console.log('Starting quest generation process...');
    setLoading(true);
    setError(null);
    setGeneratedQuests([]);

    try {
      console.log('Calling generateAIQuests with params:', questParams);
      const quests = await generateAIQuests(questParams);
      console.log('SUCCESS: Generated quests:', quests);
      setGeneratedQuests(quests);
      // Auto-select all generated quests
      setSelectedQuests(new Set(Array.from({ length: quests.length }, (_, i) => i)));
      console.log('Quest generation completed successfully');
    } catch (err) {
      console.error('ERROR generating quests:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
      setError(err instanceof Error ? err.message : 'Failed to generate quests');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const mapFrequency = (frequency: string): 'daily' | 'weekly' | 'milestone' => {
    const freq = frequency.toLowerCase();
    if (freq === 'daily') return 'daily';
    if (freq === 'weekly') return 'weekly';
    return 'milestone'; // For 'once' or 'custom'
  };

  const mapDifficulty = (difficulty: string): 'basic' | 'intermediate' | 'elite' => {
    const diff = difficulty.toLowerCase();
    if (diff === 'easy') return 'basic';
    if (diff === 'hard') return 'elite';
    return 'intermediate'; // For 'moderate' or default
  };

  const handleAddSelectedQuests = () => {
    console.log('Adding selected quests:', selectedQuests);
    
    generatedQuests.forEach((quest, index) => {
      if (selectedQuests.has(index)) {
        const habitData = {
          title: quest.title,
          category: quest.category,
          xpReward: quest.xpReward,
          frequency: mapFrequency(quest.frequency),
          difficulty: mapDifficulty(quest.difficulty),
          description: `${quest.duration} - ${quest.subtasks.map(st => st.title).join(' • ')}`,
          tier: quest.difficulty === 'Hard' ? 3 : quest.difficulty === 'Moderate' ? 2 : 1,
        };
        
        console.log('Adding habit:', habitData);
        addHabit(habitData);
      }
    });
    
    console.log('All selected quests added, closing modal');
    onClose();
  };

  const toggleQuestSelection = (index: number) => {
    const newSelected = new Set(selectedQuests);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuests(newSelected);
    console.log('Quest selection toggled:', index, 'New selection:', newSelected);
  };

  const addGoal = (goal: string) => {
    if (goal.trim() && !questParams.goals.includes(goal.trim())) {
      const newGoals = [...questParams.goals, goal.trim()];
      setQuestParams(prev => ({
        ...prev,
        goals: newGoals
      }));
      console.log('Goal added:', goal.trim(), 'Total goals:', newGoals.length);
    }
  };

  const removeGoal = (goalToRemove: string) => {
    const newGoals = questParams.goals.filter(goal => goal !== goalToRemove);
    setQuestParams(prev => ({
      ...prev,
      goals: newGoals
    }));
    console.log('Goal removed:', goalToRemove, 'Remaining goals:', newGoals.length);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('Key pressed:', e.key);
    if (e.key === 'Enter') {
      const value = e.currentTarget.value.trim();
      console.log('Adding goal from Enter key:', value);
      if (value) {
        addGoal(value);
        e.currentTarget.value = '';
      }
    }
  };

  const categoryColors = {
    'Tech': 'from-green-600 to-emerald-600',
    'Academics': 'from-blue-600 to-indigo-600',
    'Business': 'from-yellow-600 to-orange-600',
    'Content': 'from-pink-600 to-rose-600',
    'Fitness': 'from-red-600 to-pink-600',
    'Personal': 'from-purple-600 to-violet-600',
  };

  console.log('=== COMPONENT RENDER ===');
  console.log('Current state - Loading:', loading, 'Goals:', questParams.goals.length, 'Error:', error);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900/95 to-purple-900/50 rounded-2xl border border-purple-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <Sparkles className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AI Quest Generator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Quest Parameters */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">Your Goals</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {questParams.goals.map(goal => (
                  <span key={goal} className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                    <span>{goal}</span>
                    <button 
                      onClick={() => removeGoal(goal)} 
                      className="hover:text-white"
                      type="button"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add a goal (e.g., 'Build portfolio', 'Get fit', 'Learn new skill')"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                onKeyPress={handleKeyPress}
              />
              <p className="text-xs text-gray-500 mt-1">Press Enter to add goal • Goals: {questParams.goals.length}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Skill Level</label>
                <select
                  value={questParams.skillLevel}
                  onChange={(e) => {
                    console.log('Skill level changed to:', e.target.value);
                    setQuestParams(prev => ({ ...prev, skillLevel: e.target.value as any }));
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time Commitment</label>
                <select
                  value={questParams.timeCommitment}
                  onChange={(e) => {
                    console.log('Time commitment changed to:', e.target.value);
                    setQuestParams(prev => ({ ...prev, timeCommitment: e.target.value }));
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="30 minutes daily">30 minutes daily</option>
                  <option value="1-2 hours daily">1-2 hours daily</option>
                  <option value="3-4 hours daily">3-4 hours daily</option>
                  <option value="Weekend warrior">Weekend warrior</option>
                  <option value="Flexible schedule">Flexible schedule</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateQuests}
              disabled={loading || questParams.goals.length === 0}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                loading || questParams.goals.length === 0
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-lg hover:shadow-purple-500/25 cursor-pointer'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Generating Quests...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Generate AI Quests</span>
                </>
              )}
            </button>
            
            {/* Debug Info */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>Debug: Goals={questParams.goals.length}, Loading={loading ? 'true' : 'false'}, Button Disabled={loading || questParams.goals.length === 0 ? 'true' : 'false'}</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
              <button
                onClick={handleGenerateQuests}
                className="mt-2 flex items-center space-x-2 text-red-300 hover:text-red-200"
                type="button"
              >
                <RefreshCw size={16} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Generated Quests */}
          {generatedQuests.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Generated Quests</h3>
                <button
                  onClick={handleAddSelectedQuests}
                  disabled={selectedQuests.size === 0}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <Plus size={16} />
                  <span>Add Selected ({selectedQuests.size})</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {generatedQuests.map((quest, index) => (
                  <div
                    key={index}
                    className={`rounded-xl p-5 border transition-all duration-300 cursor-pointer ${
                      selectedQuests.has(index)
                        ? 'bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border-purple-500/50'
                        : 'bg-gradient-to-br from-gray-800/60 to-gray-900/40 border-gray-700/50 hover:border-purple-500/30'
                    }`}
                    onClick={() => toggleQuestSelection(index)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-bold text-white">{quest.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColors[quest.category as keyof typeof categoryColors]} text-white`}>
                            {quest.category}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{quest.duration} • {quest.difficulty}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedQuests.has(index) 
                          ? 'bg-purple-500 border-purple-500' 
                          : 'border-gray-500'
                      }`}>
                        {selectedQuests.has(index) && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium">SUBTASKS:</p>
                      {quest.subtasks.map((subtask, i) => (
                        <div key={i} className="flex items-center space-x-2 text-sm text-gray-300">
                          <div className="w-1 h-1 bg-purple-400 rounded-full" />
                          <span>{subtask.title}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-4 text-sm">
                      <span className="text-cyan-400">{quest.xpReward} XP</span>
                      <span className="text-purple-400">{quest.frequency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQuestGenerator;
