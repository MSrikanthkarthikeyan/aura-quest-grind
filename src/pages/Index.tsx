
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import QuestBoard from '../components/QuestBoard';
import PomodoroTimer from '../components/PomodoroTimer';
import CharacterProfile from '../components/CharacterProfile';
import Achievements from '../components/Achievements';
import SkillTree from '../components/SkillTree';
import Sidebar from '../components/Sidebar';
import RoleSelection from '../components/RoleSelection';
import AIOnboarding from '../components/AIOnboarding';
import DailyLore from '../components/DailyLore';
import AuthModal from '../components/AuthModal';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { User, LogOut } from 'lucide-react';

interface UserProfile {
  interests: string[];
  goals: string;
  routine: string;
  questStyle: string;
  timeCommitment: string;
  fitnessPreferences?: string[];
  skillLevel: string;
}

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const { hasCompletedOnboarding, generateQuestsFromRoles, setUserRoles } = useGame();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleOnboardingComplete = (profile: UserProfile) => {
    console.log('AI Onboarding completed with profile:', profile);
    
    // Convert AI profile to UserRoles format for compatibility
    const userRoles = {
      roles: profile.interests,
      fitnessTypes: profile.fitnessPreferences || []
    };
    
    setUserRoles(userRoles);
    generateQuestsFromRoles();
  };

  const handleStaticOnboardingComplete = () => {
    generateQuestsFromRoles();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-xl text-purple-300">Loading your dungeon...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            Solo Leveling
          </h1>
          <p className="text-xl text-gray-300 mb-8">Your RPG Habit Tracker Adventure Awaits</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <User size={20} />
            <span>Enter the Dungeon</span>
          </button>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return <AIOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <DailyLore />
      
      {/* User info and logout button */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-4">
        <span className="text-purple-300">Welcome, {user.displayName || user.email}</span>
        <button
          onClick={signOut}
          className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
      
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

export default Index;
