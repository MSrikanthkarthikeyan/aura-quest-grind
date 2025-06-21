
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { firebaseDataService } from '../services/firebaseDataService';
import { generateOnboardingResponse, generateAIQuests } from '../services/geminiService';
import { Send, Sparkles, Bot, User as UserIcon, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isError?: boolean;
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
  const { addHabit } = useGame();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [userInputCount, setUserInputCount] = useState(0);
  const [collectedData, setCollectedData] = useState<ProfileAnswers>({});
  const [conversationHistory, setConversationHistory] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [completionProgress, setCompletionProgress] = useState('');
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
  }, []);

  const addMessage = (text: string, isUser: boolean, isError: boolean = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      isError
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const updateProgress = (step: string) => {
    setCompletionProgress(step);
    console.log('Onboarding progress:', step);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || userInputCount >= 5) return;

    const userMessage = addMessage(inputValue, true);
    
    const newHistory = conversationHistory + `User: ${inputValue}\n`;
    setConversationHistory(newHistory);
    
    const newInputCount = userInputCount + 1;
    setUserInputCount(newInputCount);
    
    setInputValue('');
    setIsLoading(true);
    setHasError(false);

    try {
      if (newInputCount >= 5) {
        await completeOnboardingFlow(newHistory);
      } else {
        const response = await generateOnboardingResponse(
          newHistory,
          newInputCount,
          collectedData
        );
        
        if (response.extractedData) {
          setCollectedData(prev => ({ ...prev, ...response.extractedData }));
          console.log('Updated collected data:', { ...collectedData, ...response.extractedData });
        }
        
        addMessage(response.message, false);
        setConversationHistory(newHistory + `AI: ${response.message}\n`);
      }
    } catch (error) {
      console.error('Error processing response:', error);
      setHasError(true);
      
      const fallbackMessage = newInputCount >= 5 
        ? "🎉 Perfect! Let me set up your personalized quest profile and generate your first quests!"
        : "That's great! Tell me more about what you'd like to focus on.";
      
      addMessage(fallbackMessage, false);
      
      if (newInputCount >= 5) {
        setTimeout(() => completeOnboardingFlow(newHistory), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboardingFlow = async (finalHistory: string) => {
    if (!user) {
      console.error('No user found during onboarding completion');
      addMessage("❌ Error: No user session found. Please refresh and try again.", false, true);
      return;
    }

    setIsCompleting(true);
    setHasError(false);
    
    try {
      console.log('=== Starting onboarding completion flow ===');
      updateProgress('Analyzing your responses...');
      
      // Step 1: Show completion message
      addMessage("🎉 Perfect! Now let me finalize your profile and generate your first personalized quests...", false);

      // Step 2: Get final AI analysis with timeout
      updateProgress('Creating your profile...');
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI analysis timeout')), 15000)
      );
      
      const finalResponse = await Promise.race([
        generateOnboardingResponse(finalHistory, 5, collectedData, true),
        timeoutPromise
      ]);

      console.log('Final AI response received:', finalResponse);

      // Step 3: Create structured onboarding profile
      const onboardingProfile = {
        name: user.displayName || 'Hunter',
        interests: finalResponse.finalProfile?.interests || collectedData.focusAreas || ['Personal Development'],
        goal: finalResponse.finalProfile?.goals || collectedData.mainGoal || 'Level up skills and build better habits',
        dailyCommitment: finalResponse.finalProfile?.timeCommitment || collectedData.dailyCommitment || '1-2 hours',
        preferredStyle: finalResponse.finalProfile?.questStyle || collectedData.questStyle || 'Solo-leveling quests',
        skillLevel: finalResponse.finalProfile?.skillLevel || collectedData.skillLevel || 'Intermediate'
      };

      console.log('Created onboarding profile:', onboardingProfile);

      // Step 4: Save onboarding profile to Firebase
      updateProgress('Saving your profile...');
      try {
        await firebaseDataService.saveOnboardingProfile(user.uid, onboardingProfile);
        console.log('✅ Saved onboarding profile to Firebase');
      } catch (error) {
        console.warn('⚠️ Failed to save onboarding profile, continuing with quest generation:', error);
      }
      
      // Step 5: Generate personalized quests using AI
      updateProgress('Generating your personalized quests...');
      const questRequest = {
        roles: onboardingProfile.interests,
        goals: [onboardingProfile.goal],
        skillLevel: onboardingProfile.skillLevel as 'Beginner' | 'Intermediate' | 'Advanced',
        timeCommitment: onboardingProfile.dailyCommitment,
        fitnessTypes: onboardingProfile.interests.filter(interest => 
          interest.toLowerCase().includes('fitness') || 
          interest.toLowerCase().includes('health') ||
          interest.toLowerCase().includes('workout')
        )
      };

      console.log('Generating personalized quests with:', questRequest);
      
      const questTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Quest generation timeout')), 20000)
      );
      
      const generatedQuests = await Promise.race([
        generateAIQuests(questRequest),
        questTimeoutPromise
      ]);
      
      console.log('✅ Generated', generatedQuests.length, 'quests');
      
      // Step 6: Save quests to Firebase
      updateProgress('Saving your quests...');
      try {
        await firebaseDataService.saveGeneratedQuests(user.uid, generatedQuests);
        console.log('✅ Saved quests to Firebase');
      } catch (error) {
        console.warn('⚠️ Failed to save quests to Firebase, continuing with quest addition:', error);
      }
      
      // Step 7: Add quests to game context
      updateProgress('Setting up your quest board...');
      let questsAdded = 0;
      generatedQuests.forEach(quest => {
        try {
          // Map quest frequency to expected types
          let mappedFrequency: 'daily' | 'weekly' | 'milestone';
          if (quest.frequency === 'Daily') {
            mappedFrequency = 'daily';
          } else if (quest.frequency === 'Weekly') {
            mappedFrequency = 'weekly';
          } else {
            mappedFrequency = 'milestone';
          }

          // Map quest difficulty to expected types
          let mappedDifficulty: 'basic' | 'intermediate' | 'elite';
          if (quest.difficulty === 'Easy') {
            mappedDifficulty = 'basic';
          } else if (quest.difficulty === 'Hard') {
            mappedDifficulty = 'elite';
          } else {
            mappedDifficulty = 'intermediate';
          }

          const habitData = {
            title: quest.title,
            category: quest.category,
            xpReward: quest.xpReward,
            frequency: mappedFrequency,
            difficulty: mappedDifficulty,
            description: `${quest.duration} - ${quest.subtasks.join(' • ')}`,
            tier: quest.difficulty === 'Hard' ? 3 : quest.difficulty === 'Moderate' ? 2 : 1,
          };
          
          addHabit(habitData);
          questsAdded++;
          console.log(`✅ Added quest ${questsAdded}:`, habitData.title);
        } catch (error) {
          console.error('❌ Error adding quest to game:', error);
        }
      });

      console.log(`✅ Successfully added ${questsAdded} out of ${generatedQuests.length} quests to game context`);

      // Step 8: Show success message
      updateProgress('Finalizing your adventure...');
      addMessage(`🗡️ All set, ${onboardingProfile.name}! I've crafted ${generatedQuests.length} personalized quests based on your ${onboardingProfile.goal.toLowerCase()}. Your solo leveling journey begins now!`, false);

      // Step 9: Complete onboarding and redirect
      const profile: UserProfile = {
        interests: onboardingProfile.interests,
        goals: onboardingProfile.goal,
        routine: onboardingProfile.dailyCommitment,
        questStyle: onboardingProfile.preferredStyle,
        timeCommitment: onboardingProfile.dailyCommitment,
        fitnessPreferences: questRequest.fitnessTypes,
        skillLevel: onboardingProfile.skillLevel
      };

      try {
        await firebaseDataService.saveUserProfile(user.uid, profile);
        console.log('✅ Saved user profile to Firebase');
      } catch (error) {
        console.warn('⚠️ Failed to save user profile, continuing with completion:', error);
      }
      
      // Show success toast
      toast({
        title: "🎉 Welcome to AuraQuestGrind!",
        description: `Your ${generatedQuests.length} personalized quests are ready. Time to level up!`,
      });

      console.log('✅ Onboarding completed successfully, redirecting...');
      
      // Call onComplete callback
      onComplete(profile);
      
      // Redirect after short delay
      setTimeout(() => {
        console.log('🚀 Navigating to /habits...');
        navigate('/habits');
      }, 2000);

    } catch (error) {
      console.error('❌ Error completing onboarding flow:', error);
      setHasError(true);
      
      // Fallback completion
      addMessage("⚠️ Something went wrong, but don't worry! I'll set up a basic profile for you and you can customize it later.", false, true);

      // Create fallback profile
      const fallbackProfile: UserProfile = {
        interests: collectedData.focusAreas || ['Personal Development'],
        goals: collectedData.mainGoal || 'Improve productivity',
        routine: collectedData.dailyCommitment || '1-2 hours daily',
        questStyle: collectedData.questStyle || 'Flexible missions',
        timeCommitment: collectedData.dailyCommitment || '1-2 hours daily',
        fitnessPreferences: [],
        skillLevel: collectedData.skillLevel || 'Intermediate'
      };

      toast({
        title: "Profile Created",
        description: "Basic setup complete. You can customize your quests anytime!",
        variant: "default",
      });
      
      onComplete(fallbackProfile);
      
      setTimeout(() => {
        navigate('/habits');
      }, 2000);
    } finally {
      setIsCompleting(false);
      setCompletionProgress('');
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
                {isCompleting ? (
                  <Loader2 className="text-white animate-spin" size={24} />
                ) : hasError ? (
                  <AlertCircle className="text-red-400" size={24} />
                ) : (
                  <Sparkles className="text-white" size={24} />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {isCompleting ? 'Setting Up Your Quest Profile' : 'AuraQuestGrind Setup'}
                </h1>
                <p className="text-gray-300">
                  {isCompleting ? completionProgress || 'Generating personalized quests...' : 'AI-powered personalization (max 5 questions)'}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-400 flex items-center space-x-2">
              {userInputCount >= 5 ? (
                <>
                  <CheckCircle className="text-green-400" size={16} />
                  <span>Complete</span>
                </>
              ) : (
                <span>{userInputCount} / 5 inputs</span>
              )}
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
                    : message.isError
                    ? 'bg-red-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.isUser ? <UserIcon size={16} /> : message.isError ? <AlertCircle size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.isUser 
                    ? 'bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30' 
                    : message.isError
                    ? 'bg-red-900/20 border border-red-500/30'
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
          
          {(isLoading || isCompleting) && (
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
              placeholder={userInputCount >= 5 ? "Setting up your profile..." : "Type your response..."}
              className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              disabled={isLoading || userInputCount >= 5 || isCompleting}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim() || userInputCount >= 5 || isCompleting}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 p-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
          {hasError && (
            <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
              <AlertCircle size={14} />
              <span>Some features may be limited due to connection issues, but your profile will still be created.</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIOnboarding;
