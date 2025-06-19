
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, Target } from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  duration: string;
  xpReward: number;
  category: string;
}

interface QuestPomodoroLauncherProps {
  quest: Quest;
  onClose: () => void;
  onConfirm: (quest: Quest, pomodoroCount: number) => void;
}

const QuestPomodoroLauncher = ({ quest, onClose, onConfirm }: QuestPomodoroLauncherProps) => {
  const navigate = useNavigate();

  const parseDuration = (duration: string): number => {
    // Add null/undefined check and provide fallback
    if (!duration || typeof duration !== 'string') {
      return 30; // Default to 30 minutes if duration is invalid
    }
    
    const minuteMatch = duration.match(/(\d+)\s*(?:minutes?|mins?)/i);
    const hourMatch = duration.match(/(\d+)\s*(?:hours?|hrs?)/i);
    
    let totalMinutes = 0;
    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
    if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
    
    return totalMinutes || 30; // Default to 30 minutes if parsing fails
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
      <div className="bg-gradient-to-br from-gray-900/95 to-purple-900/50 rounded-2xl border border-purple-500/30 max-w-md w-full p-6">
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

        <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-lg p-4 mb-6 border border-purple-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="text-purple-400" size={16} />
            <span className="text-purple-300 font-medium">Quest Strategy</span>
          </div>
          <p className="text-gray-300 text-sm">
            Focus in {pomodoroCount} structured blocks with breaks. You can complete early or let the timer guide your pace.
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
            className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Play size={18} />
            <span>Begin Quest</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestPomodoroLauncher;
