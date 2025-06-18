
import React, { useState, useEffect } from 'react';
import { Scroll, X } from 'lucide-react';

const DailyLore = () => {
  const [showLore, setShowLore] = useState(false);
  const [currentLore, setCurrentLore] = useState('');

  const loreScrolls = [
    "The path of mastery is not a destination, but a way of traveling. Each quest completed strengthens your shadow.",
    "A true Shadow Hunter finds strength not in avoiding challenges, but in embracing them with unwavering focus.",
    "Every streak is a chain of victories. Break one link, and you must forge it anew with twice the determination.",
    "The difference between the novice and the master is that the master has failed more times than the novice has tried.",
    "Your XP is not just numbers—it is the crystallization of your will made manifest in reality.",
    "In the darkest dungeons of procrastination, only the disciplined hunter emerges victorious.",
    "Each Pomodoro battle is a test of your mental fortitude. Face the distractions and emerge stronger.",
    "The elite quests are not meant to be easy—they are meant to transform you into who you're destined to become.",
    "A Shadow Hunter's greatest enemy is not failure, but the comfort of mediocrity.",
    "Level up not just your character, but your character. Let discipline be your greatest skill tree.",
  ];

  useEffect(() => {
    const lastShown = localStorage.getItem('lastLoreShown');
    const today = new Date().toDateString();
    
    if (lastShown !== today) {
      const randomLore = loreScrolls[Math.floor(Math.random() * loreScrolls.length)];
      setCurrentLore(randomLore);
      setShowLore(true);
      localStorage.setItem('lastLoreShown', today);
    }
  }, []);

  const handleClose = () => {
    setShowLore(false);
  };

  if (!showLore) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full bg-gradient-to-br from-amber-900/90 to-yellow-900/80 rounded-2xl border-2 border-amber-500/50 p-8 relative animate-scale-in">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-amber-300 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Scroll size={48} className="text-amber-400" />
          </div>
          
          <h2 className="text-3xl font-bold text-amber-100 mb-6">
            📜 Daily Lore Scroll
          </h2>
          
          <div className="bg-black/20 rounded-lg p-6 border border-amber-500/30">
            <p className="text-amber-100 text-lg leading-relaxed italic">
              "{currentLore}"
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="mt-6 bg-gradient-to-r from-amber-600 to-yellow-600 px-8 py-3 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
          >
            Begin Today's Hunt
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyLore;
