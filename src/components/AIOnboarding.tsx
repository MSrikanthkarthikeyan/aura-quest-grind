import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { firebaseDataService } from '../services/firebaseDataService';
import { generateOnboardingResponse, generateAIQuests, AIQuestResponse } from '../services/geminiService';
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

interface OnboardingResponse {
  message: string;
  extractedData?: Partial<ProfileAnswers>;
  isComplete: boolean;
  finalProfile?: UserProfile;
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
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
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

  // Type guard function to check if response is OnboardingResponse
  const isOnboardingResponse = (response: unknown): response is OnboardingResponse => {
    return typeof response === 'object' && 
           response !== null && 
           'message' in response && 
           'isComplete' in response;
  };

  // Type guard function to check if response is AIQuestResponse array
  const isQuestResponseArray = (response: unknown): response is AIQuestResponse[] => {
    return Array.isArray(response) && 
           response.every(item => 
             typeof item === 'object' && 
             item !== null && 
             'title' in item && 
             'category' in item
           );
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || userInputCount >= 5) return;

    console.log('=== Handling user message ===');
    console.log('Input count:', userInputCount + 1);
    console.log('User input:', inputValue);

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
        console.log('=== Triggering completion flow ===');
        await completeOnboardingFlow(newHistory);
      } else {
        console.log('=== Continuing conversation ===');
        const response = await generateOnboardingResponse(
          newHistory,
          newInputCount,
          collectedData
        );
        
        // Type guard the response
        if (isOnboardingResponse(response)) {
          if (response.extractedData) {
            setCollectedData(prev => ({ ...prev, ...response.extractedData }));
            console.log('Updated collected data:', { ...collectedData, ...response.extractedData });
          }
          
          addMessage(response.message, false);
          setConversationHistory(newHistory + `AI: ${response.message}\n`);
        } else {
          throw new Error('Invalid response format from AI');
        }
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

    console.log('=== Starting onboarding completion flow ===');
    setIsCompleting(true);
    setHasError(false);
    setRetryCount(0);
    
    try {
      await executeCompletionSteps(finalHistory);
    } catch (error) {
      console.error('❌ Critical error in completion flow:', error);
      await handleCompletionError(finalHistory);
    } finally {
      setIsCompleting(false);
      setCompletionProgress('');
    }
  };

  const executeCompletionSteps = async (finalHistory: string) => {
    updateProgress('Analyzing your responses...');
    
    // Step 1: Show completion message
    addMessage("🎉 Perfect! Now let me finalize your profile and generate your first personalized quests...", false);

    // Step 2: Create onboarding profile with fallbacks
    const onboardingProfile = {
      name: user?.displayName || 'Hunter',
      interests: collectedData.focusAreas || ['Personal Development'],
      goal: collectedData.mainGoal || 'Level up skills and build better habits',
      dailyCommitment: collectedData.dailyCommitment || '1-2 hours',
      preferredStyle: collectedData.questStyle || 'Solo-leveling quests',
      skillLevel: collectedData.skillLevel || 'Intermediate'
    };

    console.log('Created onboarding profile:', onboardingProfile);

    // Step 3: Save onboarding profile (non-blocking)
    updateProgress('Saving your profile...');
    try {
      await Promise.race([
        firebaseDataService.saveOnboardingProfile(user.uid, onboardingProfile),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Profile save timeout')), 10000))
      ]);
      console.log('✅ Saved onboarding profile to Firebase');
    } catch (error) {
      console.warn('⚠️ Profile save failed, continuing:', error);
    }
    
    // Step 4: Generate quests with retries
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

    let generatedQuests: AIQuestResponse[] = [];
    const maxRetries = 2;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Quest generation attempt ${attempt + 1}/${maxRetries}`);
        const questResponse = await Promise.race([
          generateAIQuests(questRequest),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Quest generation timeout')), 15000))
        ]);
        
        if (isQuestResponseArray(questResponse)) {
          generatedQuests = questResponse;
          break;
        }
      } catch (error) {
        console.warn(`Quest generation attempt ${attempt + 1} failed:`, error);
        if (attempt === maxRetries - 1) {
          console.log('Using fallback quests');
          generatedQuests = []; // Will trigger fallback quest creation
        }
      }
    }
    
    console.log('✅ Generated', generatedQuests.length, 'quests');
    
    // Step 5: Save quests to Firebase (non-blocking)
    updateProgress('Saving your quests...');
    try {
      await Promise.race([
        firebaseDataService.saveGeneratedQuests(user.uid, generatedQuests),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Quest save timeout')), 8000))
      ]);
      console.log('✅ Saved quests to Firebase');
    } catch (error) {
      console.warn('⚠️ Quest save failed, continuing:', error);
    }
    
    // Step 6: Add quests to game context
    updateProgress('Setting up your quest board...');
    let questsAdded = 0;
    
    // Add AI-generated quests or fallback quests
    const questsToAdd = generatedQuests.length > 0 ? generatedQuests : getFallbackQuests();
    
    questsToAdd.forEach(quest => {
      try {
        const habitData = createHabitFromQuest(quest);
        addHabit(habitData);
        questsAdded++;
        console.log(`✅ Added quest ${questsAdded}:`, habitData.title);
      } catch (error) {
        console.error('❌ Error adding quest to game:', error);
      }
    });

    console.log(`✅ Successfully added ${questsAdded} quests to game context`);

    // Step 7: Finalize profile and complete
    await finalizeOnboarding(onboardingProfile, questsAdded);
  };

  const createHabitFromQuest = (quest: AIQuestResponse) => {
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

    return {
      title: quest.title,
      category: quest.category,
      xpReward: quest.xpReward,
      frequency: mappedFrequency,
      difficulty: mappedDifficulty,
      description: `${quest.duration} - ${quest.subtasks.map(st => st.title).join(' • ')}`,
      tier: quest.difficulty === 'Hard' ? 3 : quest.difficulty === 'Moderate' ? 2 : 1,
    };
  };

  const getFallbackQuests = (): AIQuestResponse[] => {
    return [
      {
        title: 'Shadow Progress Check',
        duration: '15 minutes',
        subtasks: [
          { title: 'Review Daily Goals', description: 'Review daily goals', estimatedPomodoros: 1 },
          { title: 'Track Achievements', description: 'Track achievements', estimatedPomodoros: 1 },
          { title: 'Plan Next Steps', description: 'Plan next steps', estimatedPomodoros: 1 }
        ],
        difficulty: 'Easy',
        frequency: 'Daily',
        category: 'Personal',
        xpReward: 25,
      },
      {
        title: 'Skill Forge Training',
        duration: '30 minutes',
        subtasks: [
          { title: 'Practice Core Skills', description: 'Practice core skills', estimatedPomodoros: 2 },
          { title: 'Learn Something New', description: 'Learn something new', estimatedPomodoros: 1 },
          { title: 'Apply Knowledge', description: 'Apply knowledge', estimatedPomodoros: 1 }
        ],
        difficulty: 'Moderate',
        frequency: 'Daily',
        category: 'Personal',
        xpReward: 45,
      }
    ];
  };

  const finalizeOnboarding = async (onboardingProfile: any, questsAdded: number) => {
    updateProgress('Finalizing your adventure...');
    addMessage(`🗡️ All set, ${onboardingProfile.name}! I've crafted ${questsAdded} personalized quests for your journey. Your solo leveling adventure begins now!`, false);

    // Create final user profile
    const profile: UserProfile = {
      interests: onboardingProfile.interests,
      goals: onboardingProfile.goal,
      routine: onboardingProfile.dailyCommitment,
      questStyle: onboardingProfile.preferredStyle,
      timeCommitment: onboardingProfile.dailyCommitment,
      fitnessPreferences: onboardingProfile.interests.filter((i: string) => 
        i.toLowerCase().includes('fitness') || i.toLowerCase().includes('health')
      ),
      skillLevel: onboardingProfile.skillLevel
    };

    // Save user profile (non-blocking)
    try {
      await firebaseDataService.saveUserProfile(user.uid, profile);
      console.log('✅ Saved user profile to Firebase');
    } catch (error) {
      console.warn('⚠️ User profile save failed:', error);
    }
    
    // Clear onboarding progress
    localStorage.removeItem('onboarding_progress');
    
    // Show success toast
    toast({
      title: "🎉 Welcome to AuraQuestGrind!",
      description: `Your ${questsAdded} personalized quests are ready. Time to level up!`,
    });

    console.log('✅ Onboarding completed successfully, redirecting...');
    
    // Call onComplete callback and redirect
    onComplete(profile);
    
    setTimeout(() => {
      console.log('🚀 Navigating to /habits...');
      navigate('/habits');
    }, 2000);
  };

  const handleCompletionError = async (finalHistory: string) => {
    setRetryCount(prev => prev + 1);
    
    if (retryCount < 2) {
      setIsRetrying(true);
      addMessage(`⚠️ Encountered an issue, retrying... (Attempt ${retryCount + 1}/2)`, false);
      
      setTimeout(async () => {
        try {
          await executeCompletionSteps(finalHistory);
        } catch (error) {
          await handleCompletionError(finalHistory);
        } finally {
          setIsRetrying(false);
        }
      }, 3000);
      return;
    }

    // Final fallback
    console.log('Using final fallback completion');
    addMessage("⚠️ Had some technical difficulties, but I've set up a basic profile for you! You can customize everything later.", false, true);

    const fallbackProfile: UserProfile = {
      interests: collectedData.focusAreas || ['Personal Development'],
      goals: collectedData.mainGoal || 'Improve productivity',
      routine: collectedData.dailyCommitment || '1-2 hours daily',
      questStyle: collectedData.questStyle || 'Flexible missions',
      timeCommitment: collectedData.dailyCommitment || '1-2 hours daily',
      fitnessPreferences: [],
      skillLevel: collectedData.skillLevel || 'Intermediate'
    };

    // Add basic fallback quests
    const fallbackQuests = getFallbackQuests();
    fallbackQuests.forEach(quest => {
      try {
        const habitData = createHabitFromQuest(quest);
        addHabit(habitData);
      } catch (error) {
        console.error('Error adding fallback quest:', error);
      }
    });

    localStorage.removeItem('onboarding_progress');

    toast({
      title: "Profile Created",
      description: "Basic setup complete. You can customize everything anytime!",
      variant: "default",
    });
    
    onComplete(fallbackProfile);
    
    setTimeout(() => {
      navigate('/habits');
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Progress persistence
  useEffect(() => {
    const savedProgress = localStorage.getItem('onboarding_progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setUserInputCount(progress.userInputCount || 0);
        setCollectedData(progress.collectedData || {});
        setConversationHistory(progress.conversationHistory || '');
        setMessages(progress.messages || []);
        console.log('Restored onboarding progress:', progress);
      } catch (error) {
        console.error('Error restoring onboarding progress:', error);
      }
    }
  }, []);

  // Save progress on state changes
  useEffect(() => {
    const progress = {
      userInputCount,
      collectedData,
      conversationHistory,
      messages: messages.slice(-10) // Only save last 10 messages
    };
    localStorage.setItem('onboarding_progress', JSON.stringify(progress));
  }, [userInputCount, collectedData, conversationHistory, messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-purple-500/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-b border-purple-500/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-cyan-500 p-2 rounded-lg">
                {isCompleting || isRetrying ? (
                  <Loader2 className="text-white animate-spin" size={24} />
                ) : hasError ? (
                  <AlertCircle className="text-red-400" size={24} />
                ) : (
                  <Sparkles className="text-white" size={24} />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {isCompleting || isRetrying ? 'Setting Up Your Quest Profile' : 'AuraQuestGrind Setup'}
                </h1>
                <p className="text-gray-300">
                  {isCompleting || isRetrying ? 
                    completionProgress || 'Generating personalized quests...' : 
                    'AI-powered personalization (max 5 questions)'
                  }
                  {isRetrying && ` (Retrying: ${retryCount}/2)`}
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
          
          {(isLoading || isCompleting || isRetrying) && (
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
              disabled={isLoading || userInputCount >= 5 || isCompleting || isRetrying}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim() || userInputCount >= 5 || isCompleting || isRetrying}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 p-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
          {(hasError || isRetrying) && (
            <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
              <AlertCircle size={14} />
              <span>
                {isRetrying ? 
                  `Retrying completion process (${retryCount}/2)...` :
                  'Some features may be limited due to connection issues, but your profile will still be created.'
                }
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIOnboarding;
