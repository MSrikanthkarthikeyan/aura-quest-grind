
import React from 'react';
import { CheckCircle, Circle, Target, Clock } from 'lucide-react';
import { QuestSubtask } from '../types/quest';

interface SubtaskJourneyProps {
  subtasks: QuestSubtask[];
  currentSubtaskIndex?: number;
  onCompleteSubtask?: (subtaskId: string) => void;
  showCompletionButtons?: boolean;
}

const SubtaskJourney: React.FC<SubtaskJourneyProps> = ({
  subtasks,
  currentSubtaskIndex = 0,
  onCompleteSubtask,
  showCompletionButtons = false
}) => {
  const currentSubtask = subtasks[currentSubtaskIndex];

  return (
    <div className="space-y-6">
      {/* Current Subtask Focus */}
      {currentSubtask && !currentSubtask.isCompleted && (
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-blue-300">Current Focus</h3>
            <div className="flex items-center space-x-2 text-sm text-blue-400">
              <Clock size={16} />
              <span>{currentSubtask.estimatedPomodoros} Pomodoros</span>
            </div>
          </div>
          
          <h4 className="text-lg font-semibold text-white mb-2">{currentSubtask.title}</h4>
          <p className="text-gray-300 mb-4">{currentSubtask.description}</p>
          
          {showCompletionButtons && onCompleteSubtask && (
            <button
              onClick={() => onCompleteSubtask(currentSubtask.id)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center space-x-2"
            >
              <CheckCircle size={18} />
              <span>Mark Complete</span>
            </button>
          )}
        </div>
      )}

      {/* Journey Progress */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center space-x-2">
          <Target size={20} />
          <span>Quest Journey</span>
        </h3>
        
        <div className="space-y-3">
          {subtasks.map((subtask, index) => {
            const isCompleted = subtask.isCompleted;
            const isCurrent = index === currentSubtaskIndex;
            const isPending = index > currentSubtaskIndex;

            return (
              <div
                key={subtask.id}
                className={`relative flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${
                  isCurrent
                    ? 'bg-blue-500/20 border border-blue-500/40'
                    : isCompleted
                    ? 'bg-green-500/20 border border-green-500/40'
                    : 'bg-gray-800/50 border border-gray-700/30'
                }`}
              >
                {/* Step indicator */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle size={16} />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold ${
                      isCompleted ? 'text-green-300' : isCurrent ? 'text-blue-300' : 'text-gray-400'
                    }`}>
                      {subtask.title}
                    </h4>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>{subtask.estimatedPomodoros}p</span>
                    </div>
                  </div>
                  <p className={`text-sm mt-1 ${
                    isCompleted ? 'text-green-400' : isCurrent ? 'text-blue-400' : 'text-gray-500'
                  }`}>
                    {subtask.description}
                  </p>
                </div>

                {/* Status indicator */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : isCurrent ? (
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  ) : (
                    <Circle className="text-gray-600" size={20} />
                  )}
                </div>

                {/* Action button for incomplete subtasks */}
                {showCompletionButtons && onCompleteSubtask && !isCompleted && (
                  <button
                    onClick={() => onCompleteSubtask(subtask.id)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Complete
                  </button>
                )}

                {/* Connecting line */}
                {index < subtasks.length - 1 && (
                  <div className={`absolute left-7 top-12 w-0.5 h-6 ${
                    index < currentSubtaskIndex ? 'bg-green-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-4 border border-purple-500/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-purple-300">Overall Progress</span>
          <span className="text-white font-semibold">
            {subtasks.filter(s => s.isCompleted).length}/{subtasks.length} Complete
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(subtasks.filter(s => s.isCompleted).length / subtasks.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SubtaskJourney;
