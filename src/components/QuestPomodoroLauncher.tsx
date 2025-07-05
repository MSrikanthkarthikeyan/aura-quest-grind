
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, Target, Loader2, List } from 'lucide-react';
import { generateAIQuests } from '../services/geminiService';
import { supabaseDataService } from '../services/supabaseDataService';
import { QuestSubtask } from '../types/quest';

interface Quest {
  id: string;
  title: string;
  duration: string;
  xpReward: number;
  category: string;
  description?: string;
}

interface QuestPomodoroLauncherProps {
  quest: Quest;
  onClose: () => void;
  onConfirm: (quest: Quest, pomodoroCount: number) => void;
}

const QuestPomodoroLauncher = ({ quest, onClose, onConfirm }: QuestPomodoroLauncherProps) => {
  const navigate = useNavigate();
  const [subtasks, setSubtasks] = useState<QuestSubtask[]>([]);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [subtasksGenerated, setSubtasksGenerated] = useState(false);

  // Load existing subtasks or generate new ones
  useEffect(() => {
    const loadOrGenerateSubtasks = async () => {
      try {
        // First, try to load existing subtasks
        const existingSubtasks = await supabaseDataService.getQuestSubtasks(quest.id);
        
        if (existingSubtasks.length > 0) {
          setSubtasks(existingSubtasks);
          setSubtasksGenerated(true);
          return;
        }

        // If no subtasks exist, generate them
        setIsGeneratingSubtasks(true);
        
        const subtaskPrompt = `Break down this quest/habit into 3-5 actionable subtasks:

Quest: ${quest.title}
Category: ${quest.category}
Description: ${quest.description || 'A productive habit to build'}

Create specific, measurable subtasks that would help someone complete this quest effectively. Each subtask should be focused and achievable.

Format as JSON array:
[
  {
    "title": "Subtask title",
    "description": "Brief description of what to do",
    "estimatedPomodoros": 1-3
  }
]`;

        // Use the dedicated subtask generation service
        const { generateQuestSubtasks } = await import('../services/questSubtaskService');
        const generatedSubtasks = await generateQuestSubtasks(
          quest.title,
          quest.category,
          quest.description
        );
        
        console.log('Generated subtasks:', generatedSubtasks);

        // Transform to our subtask format
        const formattedSubtasks = generatedSubtasks.map((subtask, index) => ({
          questId: quest.id,
          title: subtask.title,
          description: subtask.description,
          estimatedTime: (subtask.estimatedPomodoros || 1) * 25,
          estimatedPomodoros: subtask.estimatedPomodoros || 1,
          isCompleted: false,
          orderIndex: index
        }));

        // Save subtasks to database
        await supabaseDataService.saveQuestSubtasks(quest.id, formattedSubtasks);
        
        // Load the saved subtasks (with IDs)
        const savedSubtasks = await supabaseDataService.getQuestSubtasks(quest.id);
        setSubtasks(savedSubtasks);
        setSubtasksGenerated(true);
        
      } catch (error) {
        console.error('Error loading/generating subtasks:', error);
        setSubtasksGenerated(true); // Continue anyway
      } finally {
        setIsGeneratingSubtasks(false);
      }
    };

    loadOrGenerateSubtasks();
  }, [quest.id, quest.title, quest.category, quest.description]);

  const parseDuration = (duration: string): number => {
    if (!duration || typeof duration !== 'string') {
      return 30;
    }
    
    const minuteMatch = duration.match(/(\d+)\s*(?:minutes?|mins?)/i);
    const hourMatch = duration.match(/(\d+)\s*(?:hours?|hrs?)/i);
    
    let totalMinutes = 0;
    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
    if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
    
    return totalMinutes || 30;
  };

  const durationMinutes = parseDuration(quest.duration);
  const pomodoroCount = Math.max(1, Math.ceil(durationMinutes / 25));
  const totalTime = pomodoroCount * 25;

  const handleStartQuest = () => {
    onConfirm(quest, pomodoroCount);
    navigate(`/pomodoro?quest=${quest.id}&pomodoros=${pomodoroCount}`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900/95 to-purple-900/50 rounded-2xl border border-purple-500/30 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <Target className="mx-auto mb-3 text-purple-400" size={32} />
          <h2 className="text-2xl font-bold text-white mb-2">Begin Quest</h2>
          <h3 className="text-lg text-purple-300 mb-1">{quest.title}</h3>
          <p className="text-gray-400 text-sm">{quest.category} • {quest.xpReward} XP</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300">Estimated Duration:</span>
            <span className="text-white font-semibold">{quest.duration || '30 minutes'}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300">Pomodoro Blocks:</span>
            <span className="text-cyan-400 font-bold">{pomodoroCount} x 25min</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Total Focus Time:</span>
            <span className="text-green-400 font-bold">{totalTime} minutes</span>
          </div>
        </div>

        {/* Subtasks Preview */}
        {isGeneratingSubtasks ? (
          <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-lg p-4 mb-6 border border-purple-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Loader2 className="text-purple-400 animate-spin" size={16} />
              <span className="text-purple-300 font-medium">Generating Quest Subtasks...</span>
            </div>
            <p className="text-gray-300 text-sm">
              Creating personalized subtasks to guide you through this quest.
            </p>
          </div>
        ) : subtasks.length > 0 ? (
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 mb-6 border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-3">
              <List className="text-blue-400" size={16} />
              <span className="text-blue-300 font-medium">Quest Breakdown ({subtasks.length} tasks)</span>
            </div>
            <div className="space-y-2">
              {subtasks.slice(0, 3).map((subtask, index) => (
                <div key={subtask.id} className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-xs text-blue-300 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{subtask.title}</p>
                    <p className="text-gray-400 text-xs">{subtask.description}</p>
                  </div>
                  <span className="text-xs text-gray-400">{subtask.estimatedPomodoros}p</span>
                </div>
              ))}
              {subtasks.length > 3 && (
                <p className="text-gray-400 text-xs text-center mt-2">
                  +{subtasks.length - 3} more tasks...
                </p>
              )}
            </div>
          </div>
        ) : null}

        <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-lg p-4 mb-6 border border-purple-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="text-purple-400" size={16} />
            <span className="text-purple-300 font-medium">Quest Strategy</span>
          </div>
          <p className="text-gray-300 text-sm">
            Focus in {pomodoroCount} structured blocks with breaks. {subtasks.length > 0 ? 'Follow the subtasks to stay organized and get AI help when needed.' : 'You can complete early or let the timer guide your pace.'}
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleStartQuest}
            disabled={isGeneratingSubtasks}
            className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isGeneratingSubtasks ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Preparing...</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span>Begin Quest</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestPomodoroLauncher;
