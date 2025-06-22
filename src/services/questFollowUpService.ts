
interface FollowUpRequest {
  questTitle: string;
  subtaskTitle: string;
  subtaskDescription: string;
  userQuery: string;
  category: string;
}

interface FollowUpResponse {
  response: string;
  resources: string[];
  additionalTips: string[];
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

export const generateFollowUpResponse = async (request: FollowUpRequest): Promise<FollowUpResponse> => {
  console.log('Gemini AI: Starting follow-up response generation with request:', request);
  
  try {
    const prompt = createFollowUpPrompt(request);
    console.log('Gemini AI: Generated follow-up prompt length:', prompt.length);
    
    const requestBody = createSerializableRequest({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      }
    });

    console.log('Gemini AI: Making follow-up request...');
    
    const response = await retryApiCall(() => 
      fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
    );

    console.log('Gemini AI: Follow-up response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini AI: Follow-up error response body:', errorText);
      throw new Error(`Gemini AI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini AI: Follow-up response received successfully');
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Gemini AI: Generated follow-up text length:', generatedText?.length || 0);
    
    if (!generatedText) {
      console.error('Gemini AI: No follow-up content generated');
      return getFallbackFollowUpResponse();
    }

    const parsedResponse = parseFollowUpResponse(generatedText);
    console.log('Gemini AI: Successfully parsed follow-up response');
    
    return parsedResponse;
  } catch (error) {
    console.error('Gemini AI: Error generating follow-up response:', error);
    return getFallbackFollowUpResponse();
  }
};

const createFollowUpPrompt = (request: FollowUpRequest): string => {
  return `You are an expert productivity coach and resource specialist. A user is working on a quest called "${request.questTitle}" in the ${request.category} category. They're specifically working on the subtask: "${request.subtaskTitle}" - ${request.subtaskDescription}.

The user has asked: "${request.userQuery}"

Please provide a comprehensive, helpful response that includes:
1. A detailed answer to their question
2. Practical resources (websites, tools, articles, courses)
3. Additional tips for success

Respond in the following JSON format:
{
  "response": "Your detailed, helpful response to their question (2-3 paragraphs)",
  "resources": [
    "https://example.com/resource1 - Brief description",
    "https://example.com/resource2 - Brief description",
    "Tool/App Name - Brief description",
    "Book/Course Title - Brief description"
  ],
  "additionalTips": [
    "Practical tip 1",
    "Practical tip 2",
    "Practical tip 3"
  ]
}

Guidelines:
- Be specific and actionable
- Include both free and premium resources
- Focus on high-quality, reputable sources
- Make tips practical and immediately applicable
- Keep the tone encouraging and motivational
- Include 3-5 resources and 3-4 additional tips

Return only the JSON, no additional text.`;
};

const parseFollowUpResponse = (response: string): FollowUpResponse => {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in follow-up response');
      return getFallbackFollowUpResponse();
    }
    
    const cleanedResponse = jsonMatch[0];
    const parsed = JSON.parse(cleanedResponse);
    
    return {
      response: parsed.response || 'I understand your question and I\'m here to help you succeed with this subtask.',
      resources: Array.isArray(parsed.resources) ? parsed.resources : [],
      additionalTips: Array.isArray(parsed.additionalTips) ? parsed.additionalTips : [],
    };
  } catch (error) {
    console.error('Error parsing follow-up response:', error);
    return getFallbackFollowUpResponse();
  }
};

const getFallbackFollowUpResponse = (): FollowUpResponse => {
  return {
    response: "I understand your question about this subtask. Here are some general strategies that can help you make progress and overcome any challenges you're facing.",
    resources: [
      "https://www.coursera.org - Online courses for skill development",
      "https://www.youtube.com - Video tutorials and educational content",
      "https://medium.com - Articles and insights from experts",
      "Notion - Task organization and note-taking tool"
    ],
    additionalTips: [
      "Break down the subtask into even smaller, manageable steps",
      "Set specific deadlines for each component",
      "Track your progress and celebrate small wins",
      "Don't hesitate to ask for help from communities or mentors"
    ]
  };
};
