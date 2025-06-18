
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Play, Pause, Square, Timer } from 'lucide-react';

const PomodoroTimer = () => {
  const { gainXP } = useGame();
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);

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
        setSessions(prev => prev + 1);
      }
      
      // Auto-switch between work and break
      setIsBreak(!isBreak);
      setTime(isBreak ? 25 * 60 : 5 * 60); // 25 min work, 5 min break
      setIsActive(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, isBreak, gainXP]);

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

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Dungeon Raids
        </h1>
        <p className="text-gray-400">Focus sessions to level up your mind</p>
      </div>

      {/* Main Timer */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900/90 to-purple-900/40 rounded-3xl p-12 border border-purple-500/30 text-center backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-white">
              {isBreak ? '🧘 Shadow Rest' : '⚔️ Focus Dungeon'}
            </h2>
            <p className="text-gray-400">
              {isBreak ? 'Restore your mana' : 'Battle the distractions'}
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
