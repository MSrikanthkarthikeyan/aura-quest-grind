
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firebaseDataService } from '../services/firebaseDataService';
import { generateProfileSummary } from '../services/geminiService';
import { Send, Sparkles, Bot, User as UserIcon } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface UserProfile {
  interests: string[];
  goals: string;
  routine: string;
  questStyle: string;
  timeCommitment: string;
  fitnessPreferences?: string[];
  skillLevel: string;
}

interface ProfileAnswers {
  mainGoal?: string;
  focusAreas?: string[];
  dailyHours?: number;
  questStyle?: string;
  notes?: string;
}

interface AIOnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const ONBOARDING_PROMPTS = [
  "🎤 Hey hunter, welcome to AuraQuestGrind! What's your main goal these days? (e.g., build consistency, level up in coding, fitness, business, study routines)",
  "🎯 Which areas do you want to focus on right now? (Pick all that apply: Fitness, Coding, Business, Academics, Content Creation, Language Learning, etc.)",
  "⏰ How many hours can you commit daily for your quests?",
  "⚔️ What's your preferred quest style? (Choose one: Structured schedule, Flexible missions, Random daily challenges)",
  "💡 Anything else you'd like to tell your AI mentor? (e.g., 'I'm preparing for a job', 'Want to get shredded', etc.)"
];

const AIOnboarding = ({ onComplete }: AIOnboardingProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [answers, setAnswers] = useState<ProfileAnswers>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start with the first prompt
    const welcomeMessage: Message = {
      id: '1',
      text: ONBOARDING_PROMPTS[0],
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [user]);

  const parseUserResponse = (response: string, promptIndex: number): Partial<ProfileAnswers> => {
    switch (promptIndex) {
      case 0:
        return { mainGoal: response };
      case 1:
        // Parse focus areas from response
        const focusOptions = ['fitness', 'coding', 'business', 'academics', 'content creation', 'language learning'];
        const focusAreas = focusOptions.filter(area => 
          response.toLowerCase().includes(area) || 
          response.toLowerCase().includes(area.replace(' ', ''))
        );
        return { focusAreas: focusAreas.length > 0 ? focusAreas : [response] };
      case 2:
        // Extract number from response
        const hours = response.match(/\d+/);
        return { dailyHours: hours ? parseInt(hours[0]) : 1 };
      case 3:
        // Normalize quest style
        let questStyle = 'Flexible missions';
        if (response.toLowerCase().includes('structured')) questStyle = 'Structured schedule';
        else if (response.toLowerCase().includes('random')) questStyle = 'Random daily challenges';
        return { questStyle };
      case 4:
        return { notes: response };
      default:
        return {};
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Parse and store the answer
    const parsedAnswer = parseUserResponse(inputValue, currentPrompt);
    const updatedAnswers = { ...answers, ...parsedAnswer };
    setAnswers(updatedAnswers);
    
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if we have more prompts
      if (currentPrompt < ONBOARDING_PROMPTS.length - 1) {
        // Move to next prompt
        const nextPromptIndex = currentPrompt + 1;
        const nextMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: ONBOARDING_PROMPTS[nextPromptIndex],
          isUser: false,
          timestamp: new Date()
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, nextMessage]);
          setCurrentPrompt(nextPromptIndex);
          setIsLoading(false);
        }, 1000);
      } else {
        // All prompts completed, generate summary
        await completeOnboarding(updatedAnswers);
      }
    } catch (error) {
      console.error('Error processing response:', error);
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (finalAnswers: ProfileAnswers) => {
    if (!user) return;

    try {
      // Generate AI summary
      const summary = await generateProfileSummary(finalAnswers);
      
      // Convert to UserProfile format for compatibility
      const profile: UserProfile = {
        interests: finalAnswers.focusAreas || ['Personal Development'],
        goals: finalAnswers.mainGoal || 'Improve productivity',
        routine: `${finalAnswers.dailyHours || 1} hours daily`,
        questStyle: finalAnswers.questStyle || 'Flexible missions',
        timeCommitment: `${finalAnswers.dailyHours || 1} hours daily`,
        fitnessPreferences: finalAnswers.focusAreas?.includes('fitness') ? ['General'] : [],
        skillLevel: 'Intermediate'
      };

      // Save to Firebase
      await firebaseDataService.saveUserProfile(user.uid, profile);
      
      // Also save the structured profile
      await firebaseDataService.saveGameData(user.uid, {
        userProfile: finalAnswers,
        lastUpdated: new Date()
      });
      
      const completionMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `🎉 Perfect! I've analyzed your responses and created your personalized quest profile. ${summary}\n\nYour adventure begins now - let's start grinding those quests and level up together!`,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, completionMessage]);
      setIsLoading(false);
      
      // Complete onboarding after a short delay
      setTimeout(() => {
        onComplete(profile);
      }, 3000);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      
      // Fallback completion
      const fallbackProfile: UserProfile = {
        interests: finalAnswers.focusAreas || ['Personal Development'],
        goals: finalAnswers.mainGoal || 'Improve productivity',
        routine: `${finalAnswers.dailyHours || 1} hours daily`,
        questStyle: finalAnswers.questStyle || 'Flexible missions',
        timeCommitment: `${finalAnswers.dailyHours || 1} hours daily`,
        fitnessPreferences: [],
        skillLevel: 'Intermediate'
      };
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "🎉 Your profile has been created! Let's start your quest adventure!",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      
      setTimeout(() => {
        onComplete(fallbackProfile);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-purple-500/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-b border-purple-500/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-cyan-500 p-2 rounded-lg">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  AuraQuestGrind Setup
                </h1>
                <p className="text-gray-300">Quick setup to personalize your quest experience</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {currentPrompt + 1} / {ONBOARDING_PROMPTS.length}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-3 max-w-3xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isUser 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.isUser ? <UserIcon size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.isUser 
                    ? 'bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30' 
                    : 'bg-gray-800/50 border border-gray-700/50'
                }`}>
                  <p className="text-white whitespace-pre-wrap">{message.text}</p>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-purple-500/30 p-6">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 p-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOnboarding;
