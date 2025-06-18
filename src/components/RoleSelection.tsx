
import React, { useState } from 'react';
import { Code, GraduationCap, Briefcase, Megaphone, Dumbbell, User } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface Role {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  fitnessSubOptions?: string[];
}

const RoleSelection = ({ onComplete }: { onComplete: () => void }) => {
  const { setUserRoles } = useGame();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedFitnessTypes, setSelectedFitnessTypes] = useState<string[]>([]);

  const roles: Role[] = [
    {
      id: 'developer',
      name: 'Developer / Coder',
      icon: <Code size={24} />,
      description: 'Master the art of code and build digital empires',
    },
    {
      id: 'student',
      name: 'Student',
      icon: <GraduationCap size={24} />,
      description: 'Conquer academic challenges and expand your knowledge',
    },
    {
      id: 'entrepreneur',
      name: 'Businessperson / Entrepreneur',
      icon: <Briefcase size={24} />,
      description: 'Build businesses and dominate markets',
    },
    {
      id: 'influencer',
      name: 'Influencer / Content Creator',
      icon: <Megaphone size={24} />,
      description: 'Create content and influence the digital realm',
    },
    {
      id: 'fitness',
      name: 'Fitness Enthusiast',
      icon: <Dumbbell size={24} />,
      description: 'Forge your body into the ultimate weapon',
      fitnessSubOptions: ['Gym', 'Calisthenics', 'Home Workout', 'Yoga'],
    },
  ];

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );

    if (roleId !== 'fitness') {
      setSelectedFitnessTypes([]);
    }
  };

  const handleFitnessTypeToggle = (type: string) => {
    setSelectedFitnessTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleComplete = () => {
    const roleData = {
      roles: selectedRoles,
      fitnessTypes: selectedFitnessTypes,
    };
    setUserRoles(roleData);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Choose Your Hunter Path
          </h1>
          <p className="text-gray-300 text-lg">
            Select the roles that define your journey to greatness
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {roles.map(role => (
            <div
              key={role.id}
              onClick={() => handleRoleToggle(role.id)}
              className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                selectedRoles.includes(role.id)
                  ? 'bg-gradient-to-br from-purple-600/30 to-cyan-600/30 border-purple-400 shadow-lg shadow-purple-500/25'
                  : 'bg-gradient-to-br from-gray-900/80 to-gray-800/40 border-gray-700 hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg ${
                  selectedRoles.includes(role.id) ? 'bg-purple-500/20' : 'bg-gray-700/50'
                }`}>
                  {role.icon}
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-lg">{role.name}</h3>
                </div>
              </div>
              <p className="text-gray-300 text-sm">{role.description}</p>
            </div>
          ))}
        </div>

        {/* Fitness Sub-options */}
        {selectedRoles.includes('fitness') && (
          <div className="bg-gradient-to-br from-gray-900/90 to-purple-900/40 rounded-2xl p-6 border border-purple-500/30 mb-8">
            <h3 className="text-xl font-bold mb-4 text-center">Choose Your Fitness Discipline</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {roles.find(r => r.id === 'fitness')?.fitnessSubOptions?.map(type => (
                <button
                  key={type}
                  onClick={() => handleFitnessTypeToggle(type)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    selectedFitnessTypes.includes(type)
                      ? 'bg-gradient-to-r from-red-600/30 to-pink-600/30 border-red-400'
                      : 'bg-gray-800/50 border-gray-600 hover:border-red-500/50'
                  }`}
                >
                  <span className="font-medium">{type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleComplete}
            disabled={selectedRoles.length === 0}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
              selectedRoles.length > 0
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-lg hover:shadow-purple-500/25 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Begin Your Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
