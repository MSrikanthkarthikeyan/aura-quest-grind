
const GEMINI_API_KEY = 'AIzaSyCh_5H3df-gsWXiQWbD7aG5br6FD0jE1sI';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface OnboardingResponse {
  message: string;
  extractedData?: Partial<UserProfile>;
  isComplete: boolean;
  finalProfile?: UserProfile;
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

export const generateOnboardingResponse = async (
  conversationHistory: string,
  questionsAsked: number,
  currentData: Partial<UserProfile>
): Promise<OnboardingResponse> => {
  console.log('Onboarding AI: Starting conversation generation');
  console.log('Questions asked so far:', questionsAsked);
  console.log('Current data:', currentData);

  const prompt = createOnboardingPrompt(conversationHistory, questionsAsked, currentData);
  
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response generated');
    }

    return parseOnboardingResponse(generatedText, questionsAsked, currentData);
    
  } catch (error) {
    console.error('Onboarding AI Error:', error);
    return getFallbackResponse(questionsAsked, currentData);
  }
};

const createOnboardingPrompt = (
  conversationHistory: string,
  questionsAsked: number,
  currentData: Partial<UserProfile>
): string => {
  const maxQuestions = 5;
  const isNearEnd = questionsAsked >= maxQuestions - 2;

  return `You are an AI companion for AuraQuestGrind, a gamified habit tracker and productivity app. You're having a friendly onboarding conversation with a new user.

CONTEXT:
- This is question #${questionsAsked + 1} in the onboarding flow
- Maximum questions: ${maxQuestions}
- Current user data collected: ${JSON.stringify(currentData)}

CONVERSATION HISTORY:
${conversationHistory}

YOUR ROLE:
- Be friendly, encouraging, and gaming-themed (think RPG/anime vibes)
- Ask ONE focused question per response
- Keep responses under 100 words
- Use emojis and gaming terminology (quests, level up, grinding, etc.)

INFORMATION TO GATHER:
1. Main interests/focus areas (tech, fitness, academics, business, personal)
2. Specific goals they want to achieve
3. Available time commitment (daily hours/routine)
4. Preferred learning/work style (structured vs flexible)
5. Skill level (beginner, intermediate, advanced)

RESPONSE FORMAT:
{
  "message": "Your conversational response with next question",
  "extractedData": {
    "interests": ["array", "of", "interests"],
    "goals": "summarized goals",
    "timeCommitment": "time info",
    "routine": "routine preferences",
    "questStyle": "style preferences",
    "skillLevel": "skill level"
  },
  "isComplete": ${isNearEnd ? 'true if you have enough info' : 'false'},
  "finalProfile": ${isNearEnd ? 'complete profile object if ready' : 'null'}
}

${isNearEnd ? 'If you have enough information, set isComplete to true and provide a complete finalProfile object.' : 'Continue gathering information naturally.'}

Return only valid JSON.`;
};

const parseOnboardingResponse = (
  response: string,
  questionsAsked: number,
  currentData: Partial<UserProfile>
): OnboardingResponse => {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Merge extracted data with current data
    const mergedData = { ...currentData, ...parsed.extractedData };
    
    return {
      message: parsed.message || 'Let me know more about your goals!',
      extractedData: parsed.extractedData,
      isComplete: parsed.isComplete || false,
      finalProfile: parsed.isComplete ? createCompleteProfile(mergedData) : undefined
    };
    
  } catch (error) {
    console.error('Error parsing onboarding response:', error);
    return getFallbackResponse(questionsAsked, currentData);
  }
};

const createCompleteProfile = (data: Partial<UserProfile>): UserProfile => {
  return {
    interests: data.interests || ['Personal Development'],
    goals: data.goals || 'Improve productivity and build better habits',
    routine: data.routine || 'Flexible schedule',
    questStyle: data.questStyle || 'Gamified',
    timeCommitment: data.timeCommitment || '1-2 hours daily',
    fitnessPreferences: data.fitnessPreferences || [],
    skillLevel: data.skillLevel || 'Intermediate'
  };
};

const getFallbackResponse = (
  questionsAsked: number,
  currentData: Partial<UserProfile>
): OnboardingResponse => {
  const fallbackQuestions = [
    "What areas would you like to focus on? (tech, fitness, academics, etc.)",
    "What are your main goals for self-improvement?",
    "How much time can you dedicate daily to your quests?",
    "Do you prefer structured routines or flexible challenges?",
    "What's your current skill level in your main areas of interest?"
  ];

  const question = fallbackQuestions[Math.min(questionsAsked, fallbackQuestions.length - 1)];
  
  return {
    message: `🎮 ${question}`,
    extractedData: {},
    isComplete: questionsAsked >= 4,
    finalProfile: questionsAsked >= 4 ? createCompleteProfile(currentData) : undefined
  };
};
