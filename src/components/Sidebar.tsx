
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Target, Timer, User, Trophy } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Command Center' },
    { path: '/habits', icon: Target, label: 'Quest Log' },
    { path: '/pomodoro', icon: Timer, label: 'Dungeon Raids' },
    { path: '/character', icon: User, label: 'Hunter Profile' },
    { path: '/achievements', icon: Trophy, label: 'Hall of Fame' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-black/90 backdrop-blur-sm border-r border-purple-500/30">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-8">
          SHADOW SYSTEM
        </h1>
        
        <nav className="space-y-2">
          {menuItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                location.pathname === path
                  ? 'bg-gradient-to-r from-purple-600/50 to-cyan-600/50 text-white shadow-lg shadow-purple-500/25'
                  : 'hover:bg-purple-900/30 text-gray-300 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
