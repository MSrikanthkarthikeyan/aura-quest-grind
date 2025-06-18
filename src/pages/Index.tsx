
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import HabitTracker from '../components/HabitTracker';
import PomodoroTimer from '../components/PomodoroTimer';
import CharacterProfile from '../components/CharacterProfile';
import Achievements from '../components/Achievements';
import Sidebar from '../components/Sidebar';
import { GameProvider } from '../context/GameContext';

const Index = () => {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/habits" element={<HabitTracker />} />
              <Route path="/pomodoro" element={<PomodoroTimer />} />
              <Route path="/character" element={<CharacterProfile />} />
              <Route path="/achievements" element={<Achievements />} />
            </Routes>
          </main>
        </div>
      </div>
    </GameProvider>
  );
};

export default Index;
