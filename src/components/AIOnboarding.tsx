
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

interface ProfileAnswers {
  mainGoal?: string;
  focusAreas?: string[];
  dailyCommitment?: string;
  questStyle?: string;
  personalNote?: string;
  skillLevel?: string;
}

interface AIOnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const AIOnboarding = ({ onComplete }: AIOnboardingProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInputCount, setUserInputCount] = useState(0);
  const [collectedData, setCollectedData] = useState<ProfileAnswers>({});
  const [conversationHistory, setConversationHistory] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start with an AI-generated welcome message
    const welcomeMessage: Message = {
      id: '1',
      text: "🎮 Hey there, future hunter! Welcome to AuraQuestGrind! I'm your AI mentor, and I'm here to create the perfect quest experience just for you. What brings you here today? Are you looking to level up in coding, get fit, build better habits, or something else entirely?",
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    setConversationHistory('AI: ' + welcomeMessage.text + '\n');
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || userInputCount >= 5) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Update conversation history
    const newHistory = conversationHistory + `User: ${inputValue}\n`;
    setConversationHistory(newHistory);
    
    const newInputCount = userInputCount + 1;
    setUserInputCount(newInputCount);
    
    setInputValue('');
    setIsLoading(true);

    try {
      if (newInputCount >= 5) {
        // Final input reached - complete onboarding
        await completeOnboarding(newHistory);
      } else {
        // Continue conversation with AI
        const response = await generateOnboardingResponse(
          newHistory,
          newInputCount,
          collectedData
        );
        
        // Update collected data
        if (response.extractedData) {
          setCollectedData(prev => ({ ...prev, ...response.extractedData }));
        }
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.message,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setConversationHistory(newHistory + `AI: ${response.message}\n`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error processing response:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: newInputCount >= 5 
          ? "🎉 Perfect! I've got everything I need. Let me set up your personalized quest profile!"
          : "That's great! Tell me more about what you'd like to focus on.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      setIsLoading(false);
      
      if (newInputCount >= 5) {
        setTimeout(() => completeOnboarding(newHistory), 2000);
      }
    }
  };

  const completeOnboarding = async (finalHistory: string) => {
    if (!user) return;

    try {
      // Get final AI analysis
      const finalResponse = await generateOnboardingResponse(
        finalHistory,
        5,
        collectedData,
        true // Indicate this is the final analysis
      );
      
      // Convert to UserProfile format
      const profile: UserProfile = {
        interests: finalResponse.finalProfile?.interests || collectedData.focusAreas || ['Personal Development'],
        goals: finalResponse.finalProfile?.goals || collectedData.mainGoal || 'Improve productivity',
        routine: finalResponse.finalProfile?.routine || collectedData.dailyCommitment || '1-2 hours daily',
        questStyle: finalResponse.finalProfile?.questStyle || collectedData.questStyle || 'Flexible missions',
        timeCommitment: finalResponse.finalProfile?.timeCommitment || collectedData.dailyCommitment || '1-2 hours daily',
        fitnessPreferences: finalResponse.finalProfile?.fitnessPreferences || [],
        skillLevel: finalResponse.finalProfile?.skillLevel || collectedData.skillLevel || 'Intermediate'
      };

      // Save to Firebase
      await firebaseDataService.saveUserProfile(user.uid, profile);
      await firebaseDataService.saveGameData(user.uid, {
        userProfile: collectedData,
        lastUpdated: new Date()
      });
      
      const completionMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: finalResponse.message || `🎉 Perfect! I've analyzed our conversation and created your personalized quest profile. You're all set to start your ${profile.interests.join(' and ')} journey with ${profile.timeCommitment} of daily commitment. Let's begin your adventure!`,
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
        interests: collectedData.focusAreas || ['Personal Development'],
        goals: collectedData.mainGoal || 'Improve productivity',
        routine: collectedData.dailyCommitment || '1-2 hours daily',
        questStyle: collectedData.questStyle || 'Flexible missions',
        timeCommitment: collectedData.dailyCommitment || '1-2 hours daily',
        fitnessPreferences: [],
        skillLevel: collectedData.skillLevel || 'Intermediate'
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
                <p className="text-gray-300">AI-powered personalization (max 5 questions)</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {userInputCount} / 5 inputs
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
              placeholder={userInputCount >= 5 ? "Onboarding complete!" : "Type your response..."}
              className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              disabled={isLoading || userInputCount >= 5}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim() || userInputCount >= 5}
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
