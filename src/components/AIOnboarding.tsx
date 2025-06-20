
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firebaseDataService } from '../services/firebaseDataService';
import { generateOnboardingResponse } from '../services/geminiService';
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

interface AIOnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const AIOnboarding = ({ onComplete }: AIOnboardingProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationData, setConversationData] = useState<Partial<UserProfile>>({});
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start the conversation
    const welcomeMessage: Message = {
      id: '1',
      text: `🎮 Welcome to AuraQuestGrind, ${user?.displayName || 'Hunter'}! I'm your AI companion here to create the perfect quest experience for you. Let's start by getting to know you better. What are your main goals or areas you want to improve in? (Tech, fitness, academics, business, personal development, etc.)`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage]
        .map(m => `${m.isUser ? 'User' : 'AI'}: ${m.text}`)
        .join('\n');

      const response = await generateOnboardingResponse(
        conversationHistory,
        questionsAsked,
        conversationData
      );

      console.log('AI Response:', response);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation data with extracted information
      if (response.extractedData) {
        setConversationData(prev => ({ ...prev, ...response.extractedData }));
      }

      setQuestionsAsked(prev => prev + 1);

      // Check if we have enough information to complete onboarding
      if (response.isComplete && response.finalProfile) {
        setTimeout(() => {
          completeOnboarding(response.finalProfile);
        }, 2000);
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Let's continue with a quick setup instead. What areas would you like to focus on? (Just type a few keywords)",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (profile: UserProfile) => {
    if (!user) return;

    try {
      // Save profile to Firebase
      await firebaseDataService.saveUserProfile(user.uid, profile);
      
      const completionMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `🎉 Perfect! I've created your personalized quest profile. Your adventure begins now - let's start grinding those quests and level up together!`,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, completionMessage]);
      
      // Complete onboarding after a short delay
      setTimeout(() => {
        onComplete(profile);
      }, 3000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
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
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-cyan-500 p-2 rounded-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AuraQuestGrind Setup
              </h1>
              <p className="text-gray-300">Your AI companion is personalizing your experience...</p>
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
