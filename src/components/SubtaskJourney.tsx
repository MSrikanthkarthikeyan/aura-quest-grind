
import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Target, Clock, MessageSquare, Send, Loader2 } from 'lucide-react';
import { QuestSubtask } from '../types/quest';
import { supabaseDataService } from '../services/supabaseDataService';
import { questFollowUpService } from '../services/questFollowUpService';

interface SubtaskJourneyProps {
  questId: string;
  subtasks: QuestSubtask[];
  currentSubtaskIndex: number;
  onSubtaskComplete: (subtaskId: string) => void;
}

const SubtaskJourney: React.FC<SubtaskJourneyProps> = ({
  questId,
  subtasks,
  currentSubtaskIndex,
  onSubtaskComplete
}) => {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [newQuery, setNewQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);

  const currentSubtask = subtasks[currentSubtaskIndex];

  // Load follow-ups for this quest
  useEffect(() => {
    const loadFollowUps = async () => {
      try {
        const questFollowUps = await questFollowUpService.getQuestFollowUps(questId);
        setFollowUps(questFollowUps);
      } catch (error) {
        console.error('Error loading follow-ups:', error);
      }
    };

    loadFollowUps();
  }, [questId]);

  const handleSubtaskComplete = async (subtaskId: string) => {
    try {
      await supabaseDataService.updateSubtaskCompletion(subtaskId, true);
      onSubtaskComplete(subtaskId);
    } catch (error) {
      console.error('Error completing subtask:', error);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await questFollowUpService.submitFollowUpQuery({
        questId,
        subtaskId: currentSubtask?.id,
        query: newQuery
      });

      setFollowUps(prev => [...prev, {
        id: response.id,
        query: newQuery,
        response: response.response,
        resources: response.resources,
        subtaskId: currentSubtask?.id
      }]);

      setNewQuery('');
      setShowFollowUp(false);
    } catch (error) {
      console.error('Error submitting follow-up:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subtask Focus */}
      {currentSubtask && (
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
          
          <div className="flex space-x-3">
            <button
              onClick={() => handleSubtaskComplete(currentSubtask.id)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center space-x-2"
            >
              <CheckCircle size={18} />
              <span>Mark Complete</span>
            </button>
            <button
              onClick={() => setShowFollowUp(!showFollowUp)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-2"
            >
              <MessageSquare size={18} />
              <span>Need Help?</span>
            </button>
          </div>

          {/* Follow-up form */}
          {showFollowUp && (
            <form onSubmit={handleFollowUpSubmit} className="mt-4 space-y-3">
              <textarea
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                placeholder="Ask for help with this subtask..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white placeholder-gray-400 h-20 resize-none"
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !newQuery.trim()}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  <span>{isSubmitting ? 'Getting Help...' : 'Ask AI'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFollowUp(false)}
                  className="bg-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
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

      {/* Follow-ups section */}
      {followUps.length > 0 && (
        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-lg font-bold text-purple-300 mb-4">AI Assistance</h3>
          <div className="space-y-4">
            {followUps.map((followUp) => (
              <div key={followUp.id} className="bg-gray-800/50 rounded-lg p-4">
                <div className="mb-2">
                  <p className="text-sm text-gray-400 mb-1">Your question:</p>
                  <p className="text-white">{followUp.query}</p>
                </div>
                {followUp.response && (
                  <div className="mb-2">
                    <p className="text-sm text-purple-400 mb-1">AI Response:</p>
                    <p className="text-gray-300">{followUp.response}</p>
                  </div>
                )}
                {followUp.resources && followUp.resources.length > 0 && (
                  <div>
                    <p className="text-sm text-cyan-400 mb-1">Helpful Resources:</p>
                    <ul className="list-disc list-inside text-gray-300 text-sm">
                      {followUp.resources.map((resource, idx) => (
                        <li key={idx}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
