import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Square, Timer, CheckCircle, Target, List } from 'lucide-react';
import { supabaseDataService } from '../services/supabaseDataService';
import { QuestSubtask } from '../types/quest';
import SubtaskJourney from './SubtaskJourney';

const PomodoroTimer = () => {
  const { gainXP, currentQuestSession, completeQuestSession, habits } = useGame();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const questId = searchParams.get('quest');
  const initialPomodoros = parseInt(searchParams.get('pomodoros') || '1');
  
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalPomodoros] = useState(initialPomodoros);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [subtasks, setSubtasks] = useState<QuestSubtask[]>([]);
  const [currentSubtaskIndex, setCurrentSubtaskIndex] = useState(0);

  const currentQuest = questId ? habits.find(h => h.id === questId) : null;

  // Load subtasks when component mounts
  useEffect(() => {
    const loadSubtasks = async () => {
      if (questId) {
        try {
          const questSubtasks = await supabaseDataService.getQuestSubtasks(questId);
          setSubtasks(questSubtasks);
          
          // Find the first incomplete subtask
          const incompleteIndex = questSubtasks.findIndex(s => !s.isCompleted);
          setCurrentSubtaskIndex(incompleteIndex >= 0 ? incompleteIndex : 0);
        } catch (error) {
          console.error('Error loading subtasks:', error);
        }
      }
    };

    loadSubtasks();
  }, [questId]);

  // Set up real-time subscription for subtasks
  useEffect(() => {
    if (!questId) return;

    const unsubscribe = supabaseDataService.subscribeToSubtasks(questId, (updatedSubtasks) => {
      setSubtasks(updatedSubtasks);
      const incompleteIndex = updatedSubtasks.findIndex(s => !s.isCompleted);
      setCurrentSubtaskIndex(incompleteIndex >= 0 ? incompleteIndex : updatedSubtasks.length - 1);
    });

    return unsubscribe;
  }, [questId]);

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

  const handleSubtaskComplete = (subtaskId: string) => {
    // Update local state
    setSubtasks(prev => prev.map(subtask => 
      subtask.id === subtaskId ? { ...subtask, isCompleted: true } : subtask
    ));
    
    // Move to next incomplete subtask
    const nextIncompleteIndex = subtasks.findIndex((s, idx) => 
      idx > currentSubtaskIndex && !s.isCompleted
    );
    if (nextIncompleteIndex >= 0) {
      setCurrentSubtaskIndex(nextIncompleteIndex);
    }

    // Check if all subtasks are completed
    const allCompleted = subtasks.every(s => s.isCompleted);
    if (allCompleted && currentQuest && !questCompleted) {
      handleQuestCompletion();
    }
  };

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

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          {currentQuest ? 'Quest Focus Session' : 'Dungeon Raids'}
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          {currentQuest ? `Conquering: ${currentQuest.title}` : 'Focus sessions to level up your mind'}
        </p>
      </div>

      {/* Quest Progress Bar */}
      {currentQuest && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/90 to-cyan-900/40 rounded-xl p-4 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-300 font-medium">Quest Progress</span>
              <div className="flex items-center space-x-4">
                <span className="text-white font-bold text-sm md:text-base">{sessions}/{totalPomodoros} Pomodoros</span>
                {subtasks.length > 0 && (
                  <button
                    onClick={() => setShowSubtasks(!showSubtasks)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-1"
                  >
                    <List size={14} />
                    <span>Tasks</span>
                  </button>
                )}
              </div>
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

      {/* Subtasks Journey */}
      {showSubtasks && subtasks.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <SubtaskJourney
            questId={questId || ''}
            subtasks={subtasks}
            currentSubtaskIndex={currentSubtaskIndex}
            onSubtaskComplete={handleSubtaskComplete}
          />
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
        <div className="bg-gradient-to-br from-gray-900/90 to-purple-900/40 rounded-2xl md:rounded-3xl p-6 md:p-12 border border-purple-500/30 text-center backdrop-blur-sm">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-white">
              {isBreak ? '🧘 Shadow Rest' : '⚔️ Focus Dungeon'}
            </h2>
            <p className="text-gray-400 text-sm md:text-base">
              {isBreak ? 'Restore your mana' : 
               currentQuest ? `Block ${sessions + 1} of ${totalPomodoros}` : 'Battle the distractions'}
            </p>
          </div>

          {/* Circular Progress */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-6 md:mb-8">
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
                <div className="text-4xl md:text-6xl font-bold text-white mb-2">
                  {formatTime(time)}
                </div>
                <div className="text-xs md:text-sm text-gray-400">
                  Session {sessions + 1}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleTimer}
              className={`flex items-center space-x-2 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-lg hover:shadow-red-500/25'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25'
              }`}
            >
              {isActive ? <Pause size={18} className="md:w-5 md:h-5" /> : <Play size={18} className="md:w-5 md:h-5" />}
              <span>{isActive ? 'Pause' : 'Start'} Raid</span>
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center space-x-2 px-6 md:px-8 py-3 md:py-4 bg-gray-700 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 text-sm md:text-base"
            >
              <Square size={18} className="md:w-5 md:h-5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Force Complete Button */}
          {currentQuest && !questCompleted && (
            <div className="mt-4">
              <button
                onClick={handleForceComplete}
                className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 mx-auto text-sm md:text-base"
              >
                <CheckCircle size={16} className="md:w-5 md:h-5" />
                <span>Complete Quest</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-4 md:p-6 border border-purple-500/30 text-center">
          <Timer className="mx-auto mb-3 text-purple-400" size={24} />
          <h3 className="text-xl md:text-2xl font-bold text-white">{sessions}</h3>
          <p className="text-purple-400 text-sm md:text-base">Sessions Today</p>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-xl p-4 md:p-6 border border-cyan-500/30 text-center">
          <div className="text-2xl md:text-3xl mb-3">🧠</div>
          <h3 className="text-xl md:text-2xl font-bold text-white">{sessions * 50}</h3>
          <p className="text-cyan-400 text-sm md:text-base">Focus XP Earned</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-4 md:p-6 border border-green-500/30 text-center">
          <div className="text-2xl md:text-3xl mb-3">⚔️</div>
          <h3 className="text-xl md:text-2xl font-bold text-white">{Math.floor(sessions * 25 / 60)}</h3>
          <p className="text-green-400 text-sm md:text-base">Hours Conquered</p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
