
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { generateQuestWithSubtasks } from '../services/geminiService';
import { Sparkles, Loader2, Plus, Zap } from 'lucide-react';
import { toast } from 'sonner';

const AIQuestGenerator = () => {
  const { userRoles, addHabit, character } = useGame();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const generateCustomQuest = async () => {
    if (!customPrompt.trim()) {
      toast.error('Please enter a custom quest idea');
      return;
    }

    setIsGenerating(true);
    try {
      const request = {
        roles: userRoles?.roles || ['General'],
        goals: [customPrompt],
        skillLevel: character.level > 10 ? 'Advanced' : character.level > 5 ? 'Intermediate' : 'Beginner',
        timeCommitment: '1-2 hours daily',
        fitnessTypes: userRoles?.fitnessTypes || []
      };

      console.log('Generating custom quest with request:', request);
      
      const aiQuests = await generateQuestWithSubtasks(request);
      
      if (aiQuests && aiQuests.length > 0) {
        aiQuests.forEach(quest => {
          // Convert subtasks to proper format
          const processedSubtasks = quest.subtasks.map((subtask, index) => ({
            id: `${Date.now()}-${index}`,
            title: subtask.title || `Step ${index + 1}`,
            description: subtask.description || subtask.title || '',
            estimatedPomodoros: subtask.estimatedPomodoros || 2,
            isCompleted: false,
            resources: [],
            followUpQueries: []
          }));

          const newHabit = {
            title: quest.title,
            category: quest.category,
            xpReward: quest.xpReward,
            frequency: quest.frequency.toLowerCase() as 'daily' | 'weekly' | 'milestone',
            difficulty: quest.difficulty.toLowerCase() as 'basic' | 'intermediate' | 'elite',
            description: quest.duration ? `${quest.duration} - AI Generated Quest` : 'AI Generated Quest',
            tier: character.level,
            subtasks: processedSubtasks,
            totalEstimatedPomodoros: quest.totalEstimatedPomodoros || processedSubtasks.reduce((sum, st) => sum + st.estimatedPomodoros, 0),
            currentSubtaskIndex: 0,
            followUps: []
          };

          console.log('Adding new habit with subtasks:', newHabit);
          addHabit(newHabit);
        });

        toast.success(`Generated ${aiQuests.length} custom quest${aiQuests.length > 1 ? 's' : ''} with detailed subtasks!`);
        setCustomPrompt('');
      } else {
        toast.error('Failed to generate custom quest. Please try again.');
      }
    } catch (error) {
      console.error('Error generating custom quest:', error);
      toast.error('Failed to generate custom quest. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRoleBasedQuests = async () => {
    if (!userRoles) {
      toast.error('Please complete onboarding first');
      return;
    }

    setIsGenerating(true);
    try {
      const request = {
        roles: userRoles.roles,
        goals: userRoles.roles.map(role => `Improve ${role} skills`),
        skillLevel: character.level > 10 ? 'Advanced' : character.level > 5 ? 'Intermediate' : 'Beginner',
        timeCommitment: '1-2 hours daily',
        fitnessTypes: userRoles.fitnessTypes
      };

      console.log('Generating role-based quests with request:', request);
      
      const aiQuests = await generateQuestWithSubtasks(request);
      
      if (aiQuests && aiQuests.length > 0) {
        aiQuests.forEach(quest => {
          // Convert subtasks to proper format
          const processedSubtasks = quest.subtasks.map((subtask, index) => ({
            id: `${Date.now()}-${index}-${Math.random()}`,
            title: subtask.title || `Step ${index + 1}`,
            description: subtask.description || subtask.title || '',
            estimatedPomodoros: subtask.estimatedPomodoros || 2,
            isCompleted: false,
            resources: [],
            followUpQueries: []
          }));

          const newHabit = {
            title: quest.title,
            category: quest.category,
            xpReward: quest.xpReward,
            frequency: quest.frequency.toLowerCase() as 'daily' | 'weekly' | 'milestone',
            difficulty: quest.difficulty.toLowerCase() as 'basic' | 'intermediate' | 'elite',
            description: quest.duration ? `${quest.duration} - AI Generated Quest` : 'AI Generated Quest',
            tier: character.level,
            subtasks: processedSubtasks,
            totalEstimatedPomodoros: quest.totalEstimatedPomodoros || processedSubtasks.reduce((sum, st) => sum + st.estimatedPomodoros, 0),
            currentSubtaskIndex: 0,
            followUps: []
          };

          console.log('Adding new habit with subtasks:', newHabit);
          addHabit(newHabit);
        });

        toast.success(`Generated ${aiQuests.length} personalized quest${aiQuests.length > 1 ? 's' : ''} with detailed subtasks!`);
      } else {
        toast.error('Failed to generate quests. Please try again.');
      }
    } catch (error) {
      console.error('Error generating role-based quests:', error);
      toast.error('Failed to generate quests. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-900/40 to-cyan-900/40 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="text-purple-400" size={24} />
          <h2 className="text-xl font-bold text-white">AI Quest Generator</h2>
        </div>
        
        <p className="text-gray-300 mb-6">
          Let AI create personalized quests with detailed subtasks based on your preferences and goals.
        </p>

        {/* Role-based Generation */}
        <div className="mb-6">
          <button
            onClick={generateRoleBasedQuests}
            disabled={isGenerating || !userRoles}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Sparkles size={20} />
            )}
            <span>
              {isGenerating ? 'Generating Quests...' : 'Generate Personalized Quests'}
            </span>
          </button>
          
          {userRoles && (
            <p className="text-sm text-gray-400 mt-2">
              Based on your roles: {userRoles.roles.join(', ')}
            </p>
          )}
        </div>

        {/* Custom Quest Generation */}
        <div className="border-t border-gray-600 pt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Custom Quest Generator</h3>
          <div className="space-y-4">
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe what you want to learn or achieve (e.g., 'Learn React.js from scratch', 'Build a fitness routine', 'Master public speaking')..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white h-24 resize-none"
            />
            
            <button
              onClick={generateCustomQuest}
              disabled={isGenerating || !customPrompt.trim()}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Plus size={20} />
              )}
              <span>
                {isGenerating ? 'Creating Custom Quest...' : 'Create Custom Quest'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900/80 to-blue-900/30 rounded-xl p-6 border border-blue-500/30">
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="text-yellow-400" size={20} />
          <h3 className="text-lg font-semibold text-white">AI Quest Features</h3>
        </div>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-center space-x-2">
            <span className="text-green-400">•</span>
            <span>Detailed subtasks with step-by-step guidance</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-blue-400">•</span>
            <span>Accurate pomodoro time estimation</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-purple-400">•</span>
            <span>AI-powered follow-up assistance</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-cyan-400">•</span>
            <span>Personalized difficulty based on your level</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AIQuestGenerator;
