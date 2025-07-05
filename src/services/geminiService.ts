export interface AIQuestRequest {
  roles: string[];
  goals: string[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  timeCommitment: string;
  fitnessTypes?: string[];
}

export interface AIQuestResponse {
  title: string;
  duration: string;
  subtasks: Array<{
    title: string;
    description: string;
    estimatedPomodoros: number;
  }>;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  frequency: 'Daily' | 'Weekly' | 'Once' | 'Custom';
  category: string;
  xpReward: number;
  totalEstimatedPomodoros?: number;
}

export interface QuestFollowUpResponse {
  response: string;
  resources: string[];
}

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

interface ProfileAnswers {
  mainGoal?: string;
  focusAreas?: string[];
  dailyHours?: number;
  dailyCommitment?: string;
  questStyle?: string;
  notes?: string;
  skillLevel?: string;
}

const GEMINI_API_KEY = 'AIzaSyCh_5H3df-gsWXiQWbD7aG5br6FD0jE1sI';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Helper function to create serializable request objects
const createSerializableRequest = (body: any) => {
  return JSON.parse(JSON.stringify(body));
};

// Retry mechanism for API calls
const retryApiCall = async (apiCall: () => Promise<Response>, maxRetries = 2): Promise<Response> => {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const response = await apiCall();
      if (response.ok) {
        return response;
      }
      
      if (attempt === maxRetries + 1) {
        throw new Error(`API call failed after ${maxRetries} retries. Status: ${response.status}`);
      }
      
      console.warn(`API call attempt ${attempt} failed with status ${response.status}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    } catch (error) {
      if (attempt === maxRetries + 1) {
        throw error;
      }
      console.warn(`API call attempt ${attempt} failed:`, error);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error('Unexpected error in retry logic');
};

export const generateAIQuests = async (request: AIQuestRequest): Promise<AIQuestResponse[]> => {
  console.log('Gemini API: Starting quest generation with request:', request);
  
  try {
    const prompt = createQuestPrompt(request);
    console.log('Gemini API: Generated prompt length:', prompt.length);
    
    const requestBody = createSerializableRequest({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    console.log('Gemini API: Making request...');
    
    const response = await retryApiCall(() => 
      fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
    );

    console.log('Gemini API: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API: Error response body:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API: Response received successfully');
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Gemini API: Generated text length:', generatedText?.length || 0);
    
    if (!generatedText) {
      console.error('Gemini API: No content generated');
      return getFallbackQuests();
    }

    const parsedQuests = parseAIResponse(generatedText);
    console.log('Gemini API: Successfully parsed', parsedQuests.length, 'quests');
    
    return parsedQuests;
  } catch (error) {
    console.error('Gemini API: Error generating AI quests:', error);
    return getFallbackQuests();
  }
};

export const generateProfileSummary = async (answers: ProfileAnswers): Promise<string> => {
  console.log('Generating profile summary for:', answers);
  
  const prompt = `Based on the following user onboarding responses, generate a brief, encouraging 1-2 sentence summary of their personalized quest profile:

Main Goal: ${answers.mainGoal}
Focus Areas: ${answers.focusAreas?.join(', ')}
Daily Hours: ${answers.dailyHours}
Daily Commitment: ${answers.dailyCommitment}
Quest Style: ${answers.questStyle}
Additional Notes: ${answers.notes}

Write a friendly, RPG-themed summary that acknowledges their goals and shows you understand their preferences. Keep it under 150 characters and use gaming terminology like "hunter", "quests", "level up", etc.`;

  try {
    const requestBody = createSerializableRequest({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 200,
      }
    });

    const response = await retryApiCall(() =>
      fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.candidates[0]?.content?.parts[0]?.text;
    
    return summary || `Perfect! You're all set to ${answers.questStyle?.toLowerCase()} and level up in ${answers.focusAreas?.join(' and ')}.`;
    
  } catch (error) {
    console.error('Error generating profile summary:', error);
    return `Your quest profile is ready! Time to start grinding and level up in ${answers.focusAreas?.join(' and ') || 'your chosen areas'}.`;
  }
};

export const generateOnboardingResponse = async (
  conversationHistory: string,
  userInputCount: number,
  currentData: Partial<ProfileAnswers>,
  isFinalAnalysis: boolean = false
): Promise<OnboardingResponse> => {
  console.log('Onboarding AI: Starting conversation generation');
  console.log('User inputs so far:', userInputCount);
  console.log('Current data collected:', Object.keys(currentData).length, 'fields');
  console.log('Is final analysis:', isFinalAnalysis);

  try {
    const prompt = createDynamicOnboardingPrompt(conversationHistory, userInputCount, currentData, isFinalAnalysis);
    
    const requestBody = createSerializableRequest({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      }
    });

    const response = await retryApiCall(() =>
      fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response generated');
    }

    return parseOnboardingResponse(generatedText, userInputCount, currentData, isFinalAnalysis);
    
  } catch (error) {
    console.error('Onboarding AI Error:', error);
    return getFallbackResponse(userInputCount, currentData, isFinalAnalysis);
  }
};

export const generateQuestFollowUp = async (query: string): Promise<QuestFollowUpResponse> => {
  try {
    console.log('🤖 Generating AI follow-up response for query:', query);

    const prompt = `You are a helpful AI assistant specializing in productivity and skill development. A user is working on a quest/habit and needs assistance.

User Query: "${query}"

Please provide:
1. A helpful, actionable response that directly addresses their question
2. Suggest 2-3 relevant resources (websites, tools, or articles) that could help them

Format your response as a JSON object with:
{
  "response": "Your helpful response here...",
  "resources": ["Resource 1", "Resource 2", "Resource 3"]
}

Keep the response concise but actionable. Focus on practical advice they can implement immediately.`;

    const requestBody = createSerializableRequest({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    const response = await retryApiCall(() => 
      fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    console.log('Raw AI response:', responseText);
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    console.log('✅ Follow-up response generated successfully');
    return {
      response: parsedResponse.response || 'I can help you with that! Could you provide more specific details about what you need assistance with?',
      resources: parsedResponse.resources || []
    };
  } catch (error) {
    console.error('❌ Error generating follow-up response:', error);
    return {
      response: 'I encountered an issue generating a response. Please try rephrasing your question or ask for help with a specific aspect of your quest.',
      resources: []
    };
  }
};

const getFallbackQuests = (): AIQuestResponse[] => {
  console.log('Using fallback quests due to API failure');
  return [
    {
      title: 'Shadow Code Training',
      duration: '30 minutes',
      subtasks: [
        { title: 'Review Progress', description: 'Review yesterday\'s progress', estimatedPomodoros: 1 },
        { title: 'Write Code', description: 'Write clean, focused code', estimatedPomodoros: 2 },
        { title: 'Test & Debug', description: 'Test and debug thoroughly', estimatedPomodoros: 1 }
      ],
      difficulty: 'Moderate',
      frequency: 'Daily',
      category: 'Tech',
      xpReward: 45,
      totalEstimatedPomodoros: 4,
    },
    {
      title: 'Skill Mastery Quest',
      duration: '45 minutes',
      subtasks: [
        { title: 'Study Concepts', description: 'Study new concepts', estimatedPomodoros: 2 },
        { title: 'Practice Implementation', description: 'Practice implementation', estimatedPomodoros: 2 },
        { title: 'Build Project', description: 'Build something useful', estimatedPomodoros: 2 }
      ],
      difficulty: 'Moderate',
      frequency: 'Daily',
      category: 'Personal',
      xpReward: 50,
      totalEstimatedPomodoros: 6,
    },
    {
      title: 'Weekly Reflection Ritual',
      duration: '1 hour',
      subtasks: [
        { title: 'Review Achievements', description: 'Review weekly achievements', estimatedPomodoros: 1 },
        { title: 'Assess Progress', description: 'Assess progress toward goals', estimatedPomodoros: 1 },
        { title: 'Plan Challenges', description: 'Plan upcoming challenges', estimatedPomodoros: 1 }
      ],
      difficulty: 'Easy',
      frequency: 'Weekly',
      category: 'Personal',
      xpReward: 75,
      totalEstimatedPomodoros: 3,
    }
  ];
};

const createQuestPrompt = (request: AIQuestRequest): string => {
  const rolesText = request.roles.join(', ');
  const goalsText = request.goals.join(', ');
  const fitnessText = request.fitnessTypes ? `, with fitness focus on ${request.fitnessTypes.join(', ')}` : '';

  return `Generate 3-5 personalized quests for a user who is a ${rolesText} aiming to ${goalsText}. The user is a ${request.skillLevel} level and has ${request.timeCommitment} available${fitnessText}.

Please provide your response in the following JSON format:
[
  {
    "title": "Quest title (gamified, RPG-themed like 'Shadow Script Practice' or 'Algorithm Abyss')",
    "duration": "Realistic time estimate (e.g., '30 minutes', '2 hours')",
    "subtasks": ["actionable step 1", "actionable step 2", "actionable step 3"],
    "difficulty": "Easy|Moderate|Hard",
    "frequency": "Daily|Weekly|Once|Custom",
    "category": "Tech|Academics|Business|Content|Fitness|Personal",
    "xpReward": 25-100
  }
]

Requirements:
- Use engaging, RPG-themed quest titles
- Keep subtasks actionable and motivational
- Match difficulty to user's skill level
- Ensure time estimates are realistic
- Categories should match: Tech, Academics, Business, Content, Fitness, Personal
- XP rewards: Easy (25-40), Moderate (45-70), Hard (75-100)

Return only the JSON array, no additional text.`;
};

const createDynamicOnboardingPrompt = (
  conversationHistory: string,
  userInputCount: number,
  currentData: Partial<ProfileAnswers>,
  isFinalAnalysis: boolean
): string => {
  const maxInputs = 5;
  const remainingInputs = maxInputs - userInputCount;

  if (isFinalAnalysis) {
    return `You are completing the onboarding for AuraQuestGrind. Based on the conversation history, create a final summary and complete user profile.

CONVERSATION HISTORY:
${conversationHistory}

CURRENT DATA COLLECTED:
${JSON.stringify(currentData)}

Create a final response with:
1. A celebratory message acknowledging their goals
2. A complete user profile extraction

RESPONSE FORMAT:
{
  "message": "Encouraging completion message with summary of their goals (keep under 150 words)",
  "extractedData": {
    "mainGoal": "main objective",
    "focusAreas": ["area1", "area2"],
    "dailyCommitment": "time commitment",
    "questStyle": "preferred style",
    "personalNote": "additional context",
    "skillLevel": "beginner/intermediate/advanced"
  },
  "isComplete": true,
  "finalProfile": {
    "interests": ["converted focus areas"],
    "goals": "main goal summary",
    "routine": "routine description",
    "questStyle": "quest style preference",
    "timeCommitment": "time commitment",
    "fitnessPreferences": ["fitness related areas if any"],
    "skillLevel": "skill level"
  }
}

Return only valid JSON.`;
  }

  return `You are an AI mentor for AuraQuestGrind, a gamified productivity app. You're having a natural conversation with a new user to understand their goals and preferences.

CONVERSATION SO FAR:
${conversationHistory}

CONTEXT:
- This is input #${userInputCount} out of ${maxInputs} maximum
- Remaining inputs: ${remainingInputs}
- Current data: ${JSON.stringify(currentData)}

YOUR TASK:
- Ask ONE natural, conversational question that helps understand their goals, interests, or preferences
- Be friendly, encouraging, and use gaming terminology
- Keep responses under 80 words
- ${remainingInputs <= 2 ? 'Focus on missing key information since you\'re running out of inputs' : 'Continue natural conversation flow'}

INFORMATION TO GATHER:
- Main goals (career, fitness, academics, personal growth)
- Focus areas/interests  
- Daily time commitment
- Preferred style (structured vs flexible)
- Skill level
- Personal context/motivation

RESPONSE FORMAT:
{
  "message": "Your conversational response with next question",
  "extractedData": {
    "mainGoal": "extracted goal if mentioned",
    "focusAreas": ["extracted interests"],
    "dailyCommitment": "time mentioned if any", 
    "questStyle": "style preference if mentioned",
    "personalNote": "additional context",
    "skillLevel": "skill level if mentioned"
  },
  "isComplete": false
}

Return only valid JSON.`;
};

const parseOnboardingResponse = (
  response: string,
  userInputCount: number,
  currentData: Partial<ProfileAnswers>,
  isFinalAnalysis: boolean = false
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
      message: parsed.message || 'Tell me more about your goals!',
      extractedData: parsed.extractedData || {},
      isComplete: parsed.isComplete || isFinalAnalysis,
      finalProfile: parsed.finalProfile || (isFinalAnalysis ? createCompleteProfile(mergedData) : undefined)
    };
    
  } catch (error) {
    console.error('Error parsing onboarding response:', error);
    return getFallbackResponse(userInputCount, currentData, isFinalAnalysis);
  }
};

const createCompleteProfile = (data: Partial<ProfileAnswers>): UserProfile => {
  return {
    interests: data.focusAreas || ['Personal Development'],
    goals: data.mainGoal || 'Improve productivity and build better habits',
    routine: data.dailyCommitment || 'Flexible schedule',
    questStyle: data.questStyle || 'Gamified',
    timeCommitment: data.dailyCommitment || '1-2 hours daily',
    fitnessPreferences: data.focusAreas?.filter(area => 
      area.toLowerCase().includes('fitness') || 
      area.toLowerCase().includes('health') ||
      area.toLowerCase().includes('workout')
    ) || [],
    skillLevel: data.skillLevel || 'Intermediate'
  };
};

const getFallbackResponse = (
  userInputCount: number,
  currentData: Partial<ProfileAnswers>,
  isFinalAnalysis: boolean = false
): OnboardingResponse => {
  if (isFinalAnalysis) {
    return {
      message: "🎉 Perfect! I've got everything I need to create your personalized quest profile. Your adventure is about to begin!",
      extractedData: {},
      isComplete: true,
      finalProfile: createCompleteProfile(currentData)
    };
  }

  const fallbackQuestions = [
    "🎯 What's your main goal right now? (e.g., get fit, learn coding, build habits)",
    "💪 Which areas interest you most? (tech, fitness, academics, business, etc.)",
    "⏰ How much time can you dedicate daily to your quests?",
    "⚔️ Do you prefer structured schedules or flexible challenges?",
    "🚀 What's your experience level in your main areas of focus?"
  ];

  const question = fallbackQuestions[Math.min(userInputCount - 1, fallbackQuestions.length - 1)];
  
  return {
    message: question,
    extractedData: {},
    isComplete: userInputCount >= 5,
    finalProfile: userInputCount >= 5 ? createCompleteProfile(currentData) : undefined
  };
};

const parseAIResponse = (response: string): AIQuestResponse[] => {
  console.log('Parsing AI response length:', response.length);
  
  try {
    // Clean the response to extract JSON
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in response');
      return getFallbackQuests();
    }
    
    const cleanedResponse = jsonMatch[0];
    console.log('Extracted JSON length:', cleanedResponse.length);
    
    const quests = JSON.parse(cleanedResponse);
    console.log('Parsed', quests.length, 'quests from AI');
    
    const mappedQuests = quests.map((quest: any) => ({
      title: quest.title || 'Generated Quest',
      duration: quest.duration || '30 minutes',
      subtasks: Array.isArray(quest.subtasks) ? quest.subtasks.map((subtask: any, index: number) => {
        if (typeof subtask === 'string') {
          return {
            title: `Step ${index + 1}`,
            description: subtask,
            estimatedPomodoros: 1
          };
        }
        return {
          title: subtask.title || `Step ${index + 1}`,
          description: subtask.description || subtask,
          estimatedPomodoros: subtask.estimatedPomodoros || 1
        };
      }) : [],
      difficulty: quest.difficulty || 'Moderate',
      frequency: quest.frequency || 'Daily',
      category: quest.category || 'Personal',
      xpReward: quest.xpReward || 35,
      totalEstimatedPomodoros: quest.totalEstimatedPomodoros || quest.subtasks?.reduce((sum: number, st: any) => sum + (typeof st === 'object' ? st.estimatedPomodoros || 1 : 1), 0) || 4,
    }));
    
    console.log('Final mapped quests count:', mappedQuests.length);
    return mappedQuests;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return getFallbackQuests();
  }
};

export const generateQuestWithSubtasks = async (request: AIQuestRequest): Promise<AIQuestResponse[]> => {
  console.log('Gemini API: Starting quest with subtasks generation:', request);
  
  try {
    const prompt = createQuestWithSubtasksPrompt(request);
    console.log('Gemini API: Generated quest with subtasks prompt length:', prompt.length);
    
    const requestBody = createSerializableRequest({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000,
      }
    });

    console.log('Gemini API: Making quest with subtasks request...');
    
    const response = await retryApiCall(() => 
      fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
    );

    console.log('Gemini API: Quest with subtasks response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API: Quest with subtasks error response body:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API: Quest with subtasks response received successfully');
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Gemini API: Generated quest with subtasks text length:', generatedText?.length || 0);
    
    if (!generatedText) {
      console.error('Gemini API: No quest with subtasks content generated');
      return getFallbackQuestsWithSubtasks();
    }

    const parsedQuests = parseQuestWithSubtasksResponse(generatedText);
    console.log('Gemini API: Successfully parsed', parsedQuests.length, 'quests with subtasks');
    
    return parsedQuests;
  } catch (error) {
    console.error('Gemini AI: Error generating quests with subtasks:', error);
    return getFallbackQuestsWithSubtasks();
  }
};

const createQuestWithSubtasksPrompt = (request: AIQuestRequest): string => {
  const rolesText = request.roles.join(', ');
  const goalsText = request.goals.join(', ');
  const fitnessText = request.fitnessTypes ? `, with fitness focus on ${request.fitnessTypes.join(', ')}` : '';

  return `Generate 3-5 personalized quests for a user who is a ${rolesText} aiming to ${goalsText}. The user is a ${request.skillLevel} level and has ${request.timeCommitment} available${fitnessText}.

For each quest, break it down into 3-5 specific, actionable subtasks. Each subtask should be something that can be completed in 1-4 pomodoro sessions (25 minutes each). Estimate the number of pomodoros needed for each subtask based on complexity and skill level.

Please provide your response in the following JSON format:
[
  {
    "title": "Quest title (gamified, RPG-themed like 'Shadow Script Practice' or 'Algorithm Abyss')",
    "duration": "Total realistic time estimate based on subtasks",
    "subtasks": [
      {
        "title": "Specific subtask title",
        "description": "Detailed description of what to do",
        "estimatedPomodoros": 2
      }
    ],
    "difficulty": "Easy|Moderate|Hard",
    "frequency": "Daily|Weekly|Once|Custom",
    "category": "Tech|Academics|Business|Content|Fitness|Personal",
    "xpReward": 25-100,
    "totalEstimatedPomodoros": "Sum of all subtask pomodoros"
  }
]

Requirements:
- Use engaging, RPG-themed quest titles
- Make subtasks specific and actionable
- Estimate pomodoros realistically (beginners need more time)
- Each subtask should be 1-4 pomodoros max
- Total quest should be 4-15 pomodoros depending on difficulty
- Match difficulty to user's skill level
- Categories should match: Tech, Academics, Business, Content, Fitness, Personal
- XP rewards: Easy (25-40), Moderate (45-70), Hard (75-100)

Return only the JSON array, no additional text.`;
};

const parseQuestWithSubtasksResponse = (response: string): AIQuestResponse[] => {
  console.log('Parsing quest with subtasks response length:', response.length);
  
  try {
    // Clean the response to extract JSON
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in quest with subtasks response');
      return getFallbackQuestsWithSubtasks();
    }
    
    const cleanedResponse = jsonMatch[0];
    console.log('Extracted quest with subtasks JSON length:', cleanedResponse.length);
    
    const quests = JSON.parse(cleanedResponse);
    console.log('Parsed', quests.length, 'quests with subtasks from AI');
    
    const mappedQuests = quests.map((quest: any) => ({
      title: quest.title || 'Generated Quest',
      duration: quest.duration || '2 hours',
      subtasks: Array.isArray(quest.subtasks) ? quest.subtasks.map((subtask: any) => ({
        title: subtask.title || 'Subtask',
        description: subtask.description || 'Complete this part of the quest',
        estimatedPomodoros: subtask.estimatedPomodoros || 2
      })) : [],
      difficulty: quest.difficulty || 'Moderate',
      frequency: quest.frequency || 'Daily',
      category: quest.category || 'Personal',
      xpReward: quest.xpReward || 35,
      totalEstimatedPomodoros: quest.totalEstimatedPomodoros || quest.subtasks?.reduce((sum: number, st: any) => sum + (st.estimatedPomodoros || 2), 0) || 4,
    }));
    
    console.log('Final mapped quests with subtasks count:', mappedQuests.length);
    return mappedQuests;
  } catch (error) {
    console.error('Error parsing quest with subtasks response:', error);
    return getFallbackQuestsWithSubtasks();
  }
};

const getFallbackQuestsWithSubtasks = (): AIQuestResponse[] => {
  console.log('Using fallback quests with subtasks due to API failure');
  return [
    {
      title: 'Shadow Code Training',
      duration: '2 hours',
      subtasks: [
        { title: 'Setup Development Environment', description: 'Configure your coding workspace with necessary tools', estimatedPomodoros: 2 },
        { title: 'Review Core Concepts', description: 'Go through fundamental programming concepts', estimatedPomodoros: 3 },
        { title: 'Practice Coding', description: 'Write and test sample code implementations', estimatedPomodoros: 3 }
      ],
      difficulty: 'Moderate',
      frequency: 'Daily',
      category: 'Tech',
      xpReward: 45,
      totalEstimatedPomodoros: 8,
    },
    {
      title: 'Skill Mastery Quest',
      duration: '90 minutes',
      subtasks: [
        { title: 'Research New Techniques', description: 'Study advanced methods in your field', estimatedPomodoros: 2 },
        { title: 'Practice Implementation', description: 'Apply new techniques in practical exercises', estimatedPomodoros: 3 },
        { title: 'Create Something Useful', description: 'Build a project that demonstrates your learning', estimatedPomodoros: 2 }
      ],
      difficulty: 'Moderate',
      frequency: 'Daily',
      category: 'Personal',
      xpReward: 50,
      totalEstimatedPomodoros: 7,
    }
  ];
};
