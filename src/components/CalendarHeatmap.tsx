
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/SupabaseAuthContext';
import { supabaseDataService } from '../services/supabaseDataService';

interface CalendarHeatmapProps {
  onDateClick?: (date: string) => void;
}

const CalendarHeatmap = ({ onDateClick }: CalendarHeatmapProps) => {
  const { habits, getDailyActivity, getStreakCount } = useGame();
  const { user } = useAuth();
  const [supabaseActivities, setSupabaseActivities] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      loadSupabaseActivities();
    }
  }, [user]);

  const loadSupabaseActivities = async () => {
    if (!user) return;
    
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    try {
      const activities = await supabaseDataService.getStreakData(startDate, endDate);
      setSupabaseActivities(activities);
    } catch (error) {
      console.error('Error loading Supabase activities:', error);
    }
  };
  
  // Generate last 30 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const dates = generateDates();
  const currentStreak = getStreakCount();

  const getActivityLevel = (date: string) => {
    const activity = getDailyActivity(date);
    const supabaseActivity = supabaseActivities.find(a => a.date === date);
    
    const totalQuests = activity.questsCompleted + (supabaseActivity?.quests_completed || 0);
    
    if (!activity.hasLogin && !supabaseActivity?.has_login) return 0;
    if (totalQuests === 0) return 1;
    if (totalQuests <= 2) return 2;
    if (totalQuests <= 3) return 3;
    return 4; // Epic day
  };

  const getActivityColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-800 border-gray-700';
      case 1: return 'bg-blue-700/30 border-blue-600';
      case 2: return 'bg-green-700/50 border-green-600';
      case 3: return 'bg-green-600/70 border-green-500';
      case 4: return 'bg-gradient-to-br from-yellow-500 to-orange-500 border-yellow-400 shadow-yellow-400/25 shadow-lg';
      default: return 'bg-gray-800 border-gray-700';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/40 rounded-2xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Dungeon History</h3>
          <p className="text-gray-400 text-sm">Your 30-day quest journey {user ? '(Synced)' : '(Local)'}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-400 flex items-center space-x-2">
            <span>🔥</span>
            <span>{currentStreak}</span>
          </div>
          <p className="text-orange-300 text-sm">Day Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1 mb-4">
        {dates.map(date => {
          const level = getActivityLevel(date);
          const activity = getDailyActivity(date);
          const supabaseActivity = supabaseActivities.find(a => a.date === date);
          const totalQuests = activity.questsCompleted + (supabaseActivity?.quests_completed || 0);
          
          return (
            <div
              key={date}
              className={`aspect-square rounded border cursor-pointer transition-all duration-200 hover:scale-110 ${getActivityColor(level)}`}
              onClick={() => onDateClick?.(date)}
              title={`${formatDate(date)}: ${totalQuests} quests${activity.hasLogin || supabaseActivity?.has_login ? ', logged in' : ''}`}
            >
              {level === 4 && (
                <div className="w-full h-full flex items-center justify-center text-xs">
                  ⭐
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-gray-800 border border-gray-700 rounded"></div>
          <div className="w-3 h-3 bg-blue-700/30 border border-blue-600 rounded"></div>
          <div className="w-3 h-3 bg-green-700/50 border border-green-600 rounded"></div>
          <div className="w-3 h-3 bg-green-600/70 border border-green-500 rounded"></div>
          <div className="w-3 h-3 bg-gradient-to-br from-yellow-500 to-orange-500 border border-yellow-400 rounded"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default CalendarHeatmap;
