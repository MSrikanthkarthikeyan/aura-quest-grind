
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Square, Timer, CheckCircle, Target, ArrowRight, ListTodo } from 'lucide-react';
import { QuestSubtask } from '../types/quest';
import SubtaskJourney from './SubtaskJourney';

const PomodoroTimer = () => {
  const { gainXP, currentQuestSession, completeQuestSession, habits, completeSubtask } = useGame();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const questId = searchParams.get('quest');
  const initialPomodoros = parseInt(searchParams.get('pomodoros') || '1');
  
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalPomodoros] = useState(initialPomodoros);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [showJourney, setShowJourney] = useState(false);

  const currentQuest = questId ? habits.find(h => h.id === questId) : null;
  const enhancedQuest = currentQuest as any;
  const subtasks = enhancedQuest?.subtasks || [];
  const currentSubtask = subtasks.find((st: QuestSubtask) => !st.isCompleted);
  const completedSubtasks = subtasks.filter((st: QuestSubtask) => st.isCompleted).length;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      // Session completed
      if (!isBreak) {
        gainXP(50, 'wisdom'); // Focus session XP
        setSessions(prev => {
          const newSessions = prev + 1;
          // Check if all pomodoros completed
          if (newSessions >= totalPomodoros && currentQuest) {
            handleQuestCompletion();
          }
          return newSessions;
        });
      }
      
      // Auto-switch between work and break
      setIsBreak(!isBreak);
      setTime(isBreak ? 25 * 60 : 5 * 60); // 25 min work, 5 min break
      setIsActive(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, isBreak, gainXP, totalPomodoros, currentQuest]);

  const handleQuestCompletion = () => {
    if (currentQuest && !questCompleted) {
      completeQuestSession();
      setQuestCompleted(true);
    }
  };

  const handleForceComplete = () => {
    if (currentQuest && !questCompleted) {
      handleQuestCompletion();
    }
  };

  const handleSubtaskComplete = (subtaskId: string) => {
    if (questId) {
      completeSubtask(questId, subtaskId);
    }
  };

  const handleReturnToQuests = () => {
    navigate('/habits');
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(25 * 60);
    setIsBreak(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((isBreak ? 5 * 60 : 25 * 60) - time) / (isBreak ? 5 * 60 : 25 * 60) * 100;
  const questProgress = (sessions / totalPomodoros) * 100;
  const subtaskProgress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          {currentQuest ? 'Quest Focus Session' : 'Dungeon Raids'}
        </h1>
        <p className="text-gray-400">
          {currentQuest ? `Conquering: ${currentQuest.title}` : 'Focus sessions to level up your mind'}
        </p>
      </div>

      {/* Quest Progress Bar */}
      {currentQuest && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/90 to-cyan-900/40 rounded-xl p-4 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-300 font-medium">Quest Progress</span>
              <span className="text-white font-bold">{sessions}/{totalPomodoros} Pomodoros</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${questProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-cyan-400">{currentQuest.category}</span>
              <span className="text-yellow-400">{currentQuest.xpReward} XP</span>
            </div>
          </div>
        </div>
      )}

      {/* Current Subtask Display */}
      {currentSubtask && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Target className="text-blue-400" size={20} />
                <span className="text-blue-300 font-medium">Current Focus</span>
              </div>
              <span className="text-xs text-gray-400">
                {completedSubtasks + 1}/{subtasks.length}
              </span>
            </div>
            <h3 className="text-white font-semibold mb-1">{currentSubtask.title}</h3>
            <p className="text-gray-300 text-sm mb-3">{currentSubtask.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-blue-400 text-sm">
                Est. {currentSubtask.estimatedPomodoros} Pomodoros
              </span>
              <button
                onClick={() => handleSubtaskComplete(currentSubtask.id)}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtask Progress */}
      {subtasks.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/80 to-green-900/30 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-300 font-medium">Task Journey</span>
              <button
                onClick={() => setShowJourney(!showJourney)}
                className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center space-x-1"
              >
                <ListTodo size={16} />
                <span>{showJourney ? 'Hide' : 'Show'} All Tasks</span>
              </button>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>
            <div className="text-sm text-green-400">
              {completedSubtasks}/{subtasks.length} tasks completed ({Math.round(subtaskProgress)}%)
            </div>
          </div>
        </div>
      )}

      {/* Subtask Journey Modal */}
      {showJourney && subtasks.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-purple-900/50 rounded-2xl border border-purple-500/30 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Quest Journey</h2>
                <button
                  onClick={() => setShowJourney(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <SubtaskJourney
                subtasks={subtasks}
                onCompleteSubtask={handleSubtaskComplete}
                showCompletionButtons={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quest Completion Modal */}
      {questCompleted && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-green-900/95 to-emerald-900/50 rounded-2xl border border-green-500/30 max-w-md w-full p-6 text-center">
            <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
            <h2 className="text-2xl font-bold text-white mb-2">Quest Completed!</h2>
            <p className="text-green-300 mb-1">{currentQuest?.title}</p>
            <p className="text-gray-400 text-sm mb-6">+{currentQuest?.xpReward} XP earned</p>
            <button
              onClick={handleReturnToQuests}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Return to Quest Board
            </button>
          </div>
        </div>
      )}

      {/* Main Timer */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900/90 to-purple-900/40 rounded-3xl p-12 border border-purple-500/30 text-center backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-white">
              {isBreak ? '🧘 Shadow Rest' : '⚔️ Focus Dungeon'}
            </h2>
            <p className="text-gray-400">
              {isBreak ? 'Restore your mana' : 
               currentQuest ? `Block ${sessions + 1} of ${totalPomodoros}` : 'Battle the distractions'}
            </p>
          </div>

          {/* Circular Progress */}
          <div className="relative w-80 h-80 mx-auto mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className={`transition-all duration-1000 ${
                  isBreak ? 'text-green-500' : 'text-purple-500'
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-white mb-2">
                  {formatTime(time)}
                </div>
                <div className="text-sm text-gray-400">
                  Session {sessions + 1}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleTimer}
              className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-lg hover:shadow-red-500/25'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25'
              }`}
            >
              {isActive ? <Pause size={20} /> : <Play size={20} />}
              <span>{isActive ? 'Pause' : 'Start'} Raid</span>
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center space-x-2 px-8 py-4 bg-gray-700 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
            >
              <Square size={20} />
              <span>Reset</span>
            </button>
            
            {currentQuest && !questCompleted && (
              <button
                onClick={handleForceComplete}
                className="flex items-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300"
              >
                <CheckCircle size={20} />
                <span>Complete Quest</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-6 border border-purple-500/30 text-center">
          <Timer className="mx-auto mb-3 text-purple-400" size={32} />
          <h3 className="text-2xl font-bold text-white">{sessions}</h3>
          <p className="text-purple-400">Sessions Today</p>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-xl p-6 border border-cyan-500/30 text-center">
          <div className="text-3xl mb-3">🧠</div>
          <h3 className="text-2xl font-bold text-white">{sessions * 50}</h3>
          <p className="text-cyan-400">Focus XP Earned</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-6 border border-green-500/30 text-center">
          <div className="text-3xl mb-3">⚔️</div>
          <h3 className="text-2xl font-bold text-white">{Math.floor(sessions * 25 / 60)}</h3>
          <p className="text-green-400">Hours Conquered</p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
