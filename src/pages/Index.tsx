
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import QuestBoard from '../components/QuestBoard';
import PomodoroTimer from '../components/PomodoroTimer';
import CharacterProfile from '../components/CharacterProfile';
import Achievements from '../components/Achievements';
import SkillTree from '../components/SkillTree';
import Sidebar from '../components/Sidebar';
import RoleSelection from '../components/RoleSelection';
import DailyLore from '../components/DailyLore';
import { GameProvider, useGame } from '../context/GameContext';

const AppContent = () => {
  const { hasCompletedOnboarding, generateQuestsFromRoles } = useGame();

  const handleOnboardingComplete = () => {
    generateQuestsFromRoles();
  };

  if (!hasCompletedOnboarding) {
    return <RoleSelection onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <DailyLore />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/habits" element={<QuestBoard />} />
            <Route path="/pomodoro" element={<PomodoroTimer />} />
            <Route path="/character" element={<CharacterProfile />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/skills" element={<SkillTree />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default Index;
