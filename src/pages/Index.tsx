
import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { User, LogOut } from 'lucide-react';
import LoadingWrapper from '../components/LoadingWrapper';
import { DashboardSkeleton, QuestBoardSkeleton, PomodoroSkeleton } from '../components/ui/loading-skeleton';

// Lazy load components for better performance
const Dashboard = lazy(() => import('../components/Dashboard'));
const QuestBoard = lazy(() => import('../components/QuestBoard'));
const PomodoroTimer = lazy(() => import('../components/PomodoroTimer'));
const CharacterProfile = lazy(() => import('../components/CharacterProfile'));
const Achievements = lazy(() => import('../components/Achievements'));
const SkillTree = lazy(() => import('../components/SkillTree'));
const Sidebar = lazy(() => import('../components/Sidebar'));
const RoleSelection = lazy(() => import('../components/RoleSelection'));
const AIOnboarding = lazy(() => import('../components/AIOnboarding'));
const DailyLore = lazy(() => import('../components/DailyLore'));
const AuthModal = lazy(() => import('../components/AuthModal'));

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
  const [retryCount, setRetryCount] = useState(0);

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

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            Solo Leveling
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">Your RPG Habit Tracker Adventure Awaits</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 px-6 md:px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-2 mx-auto w-full md:w-auto justify-center"
          >
            <User size={20} />
            <span>Enter the Dungeon</span>
          </button>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </Suspense>
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <Suspense fallback={<LoadingWrapper isLoading={true} />}>
        <AIOnboarding onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  return (
    <LoadingWrapper 
      isLoading={loading} 
      onRetry={handleRetry}
      timeout={5000}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        <Suspense fallback={null}>
          <DailyLore />
        </Suspense>
        
        {/* User info and logout button - Mobile optimized */}
        <div className="absolute top-2 md:top-4 right-2 md:right-4 z-50 flex items-center space-x-2 md:space-x-4">
          <span className="text-purple-300 text-sm md:text-base hidden sm:block">
            Welcome, {user.displayName || user.email}
          </span>
          <button
            onClick={signOut}
            className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 px-2 md:px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 md:space-x-2 text-sm md:text-base"
          >
            <LogOut size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row">
          <Suspense fallback={null}>
            <Sidebar />
          </Suspense>
          <main className="flex-1 md:ml-64 min-h-screen">
            <Routes>
              <Route 
                path="/" 
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <Dashboard />
                  </Suspense>
                } 
              />
              <Route 
                path="/habits" 
                element={
                  <Suspense fallback={<QuestBoardSkeleton />}>
                    <QuestBoard />
                  </Suspense>
                } 
              />
              <Route 
                path="/pomodoro" 
                element={
                  <Suspense fallback={<PomodoroSkeleton />}>
                    <PomodoroTimer />
                  </Suspense>
                } 
              />
              <Route 
                path="/character" 
                element={
                  <Suspense fallback={<div className="p-8"><div className="animate-pulse bg-gray-800 h-64 rounded-lg"></div></div>}>
                    <CharacterProfile />
                  </Suspense>
                } 
              />
              <Route 
                path="/achievements" 
                element={
                  <Suspense fallback={<div className="p-8"><div className="animate-pulse bg-gray-800 h-64 rounded-lg"></div></div>}>
                    <Achievements />
                  </Suspense>
                } 
              />
              <Route 
                path="/skills" 
                element={
                  <Suspense fallback={<div className="p-8"><div className="animate-pulse bg-gray-800 h-64 rounded-lg"></div></div>}>
                    <SkillTree />
                  </Suspense>
                } 
              />
            </Routes>
          </main>
        </div>
      </div>
    </LoadingWrapper>
  );
};

export default Index;
