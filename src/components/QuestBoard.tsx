
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Crown, Zap, Calendar, Clock, CheckCircle, Play, MessageCircle, ListTodo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuestSubtask } from '../types/quest';
import QuestFollowUpTab from './QuestFollowUpTab';

const QuestBoard = () => {
  const { habits, completeHabit, startQuestSession, completeSubtask, addQuestFollowUp, getQuestFollowUps } = useGame();
  const navigate = useNavigate();
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'subtasks' | 'followup'>('subtasks');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'text-green-400 border-green-400';
      case 'intermediate': return 'text-yellow-400 border-yellow-400';
      case 'elite': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Tech': 'from-purple-600/20 to-indigo-600/20 border-purple-500/30',
      'Academics': 'from-blue-600/20 to-cyan-600/20 border-blue-500/30',
      'Business': 'from-green-600/20 to-emerald-600/20 border-green-500/30',
      'Fitness': 'from-red-600/20 to-orange-600/20 border-red-500/30',
      'Personal': 'from-yellow-600/20 to-amber-600/20 border-yellow-500/30',
      'Content': 'from-pink-600/20 to-rose-600/20 border-pink-500/30',
    };
    return colors[category] || 'from-gray-600/20 to-slate-600/20 border-gray-500/30';
  };

  const handleStartQuest = (questId: string, totalPomodoros: number) => {
    startQuestSession(questId, totalPomodoros);
    navigate(`/pomodoro?quest=${questId}&pomodoros=${totalPomodoros}`);
  };

  const handleCompleteSubtask = (questId: string, subtaskId: string) => {
    completeSubtask(questId, subtaskId);
  };

  const getNextIncompleteSubtask = (subtasks: QuestSubtask[] = []) => {
    return subtasks.find(st => !st.isCompleted);
  };

  const getCompletedSubtasks = (subtasks: QuestSubtask[] = []) => {
    return subtasks.filter(st => st.isCompleted).length;
  };

  const getSubtaskProgress = (subtasks: QuestSubtask[] = []) => {
    if (subtasks.length === 0) return 0;
    return (getCompletedSubtasks(subtasks) / subtasks.length) * 100;
  };

  const canCompleteQuest = (quest: any) => {
    const enhancedQuest = quest as any;
    if (!enhancedQuest.subtasks || enhancedQuest.subtasks.length === 0) {
      return true; // Old quests without subtasks can be completed normally
    }
    return enhancedQuest.subtasks.every((st: QuestSubtask) => st.isCompleted);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Shadow Quest Board
        </h1>
        <p className="text-gray-400">Choose your path to greatness</p>
      </div>

      <div className="grid gap-6">
        {habits.map((quest) => {
          const enhancedQuest = quest as any;
          const subtasks = enhancedQuest.subtasks || [];
          const totalPomodoros = enhancedQuest.totalEstimatedPomodoros || quest.xpReward / 10;
          const followUps = getQuestFollowUps(quest.id);
          const subtaskProgress = getSubtaskProgress(subtasks);
          const nextSubtask = getNextIncompleteSubtask(subtasks);
          
          return (
            <div key={quest.id} className={`bg-gradient-to-br ${getCategoryColor(quest.category)} backdrop-blur-sm rounded-xl border p-6`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Crown className="text-yellow-400" size={20} />
                    <h3 className="text-xl font-bold text-white">{quest.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getDifficultyColor(quest.difficulty)}`}>
                      {quest.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{quest.description}</p>
                  
                  {/* Quest Stats */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Zap className="text-yellow-400" size={16} />
                      <span className="text-yellow-400">{quest.xpReward} XP</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="text-purple-400" size={16} />
                      <span className="text-purple-400">{totalPomodoros} Pomodoros</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="text-cyan-400" size={16} />
                      <span className="text-cyan-400">{quest.frequency}</span>
                    </div>
                    {subtasks.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <ListTodo className="text-green-400" size={16} />
                        <span className="text-green-400">{getCompletedSubtasks(subtasks)}/{subtasks.length} Tasks</span>
                      </div>
                    )}
                  </div>

                  {/* Subtask Progress Bar */}
                  {subtasks.length > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${subtaskProgress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Progress: {Math.round(subtaskProgress)}% complete
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleStartQuest(quest.id, totalPomodoros)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                  >
                    <Play size={16} />
                    <span>Start Quest</span>
                  </button>
                  
                  {canCompleteQuest(enhancedQuest) && (
                    <button
                      onClick={() => completeHabit(quest.id)}
                      disabled={quest.completed}
                      className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={16} />
                      <span>{quest.completed ? 'Completed' : 'Complete'}</span>
                    </button>
                  )}

                  {subtasks.length > 0 && (
                    <button
                      onClick={() => setExpandedQuest(expandedQuest === quest.id ? null : quest.id)}
                      className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
                    >
                      <MessageCircle size={16} />
                      <span>View Details</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Quest Details */}
              {expandedQuest === quest.id && subtasks.length > 0 && (
                <div className="mt-6 border-t border-gray-600 pt-6">
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => setActiveTab('subtasks')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        activeTab === 'subtasks'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Subtasks ({subtasks.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('followup')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        activeTab === 'followup'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      AI Assistant ({followUps.length})
                    </button>
                  </div>

                  {activeTab === 'subtasks' && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-white mb-3">Quest Journey</h4>
                      {nextSubtask && (
                        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg p-4 border border-blue-500/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-blue-300 font-medium">Current Task</span>
                          </div>
                          <h5 className="text-white font-semibold">{nextSubtask.title}</h5>
                          <p className="text-gray-300 text-sm mt-1">{nextSubtask.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-blue-400">
                              {nextSubtask.estimatedPomodoros} Pomodoros estimated
                            </span>
                            <button
                              onClick={() => handleCompleteSubtask(quest.id, nextSubtask.id)}
                              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              Mark Complete
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {subtasks.map((subtask, index) => (
                          <div
                            key={subtask.id}
                            className={`p-3 rounded-lg border ${
                              subtask.isCompleted
                                ? 'bg-green-900/20 border-green-500/30'
                                : subtask.id === nextSubtask?.id
                                ? 'bg-blue-900/20 border-blue-500/30'
                                : 'bg-gray-800/50 border-gray-600/30'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                subtask.isCompleted
                                  ? 'bg-green-500 text-white'
                                  : subtask.id === nextSubtask?.id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-600 text-gray-300'
                              }`}>
                                {subtask.isCompleted ? '✓' : index + 1}
                              </div>
                              <div className="flex-1">
                                <h6 className={`font-medium ${
                                  subtask.isCompleted ? 'text-green-300 line-through' : 'text-white'
                                }`}>
                                  {subtask.title}
                                </h6>
                                <p className={`text-sm ${
                                  subtask.isCompleted ? 'text-green-400/70' : 'text-gray-400'
                                }`}>
                                  {subtask.description}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {subtask.estimatedPomodoros}p
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'followup' && (
                    <QuestFollowUpTab
                      questTitle={quest.title}
                      category={quest.category}
                      subtasks={subtasks}
                      followUps={followUps}
                      onAddFollowUp={(followUp) => addQuestFollowUp(quest.id, followUp)}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {habits.length === 0 && (
        <div className="text-center py-12">
          <Crown className="mx-auto mb-4 text-gray-500" size={48} />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Active Quests</h3>
          <p className="text-gray-500">Complete the onboarding to generate your first quests!</p>
        </div>
      )}
    </div>
  );
};

export default QuestBoard;
