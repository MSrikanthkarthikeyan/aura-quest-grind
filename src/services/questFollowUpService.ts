
import { supabaseDataService } from './supabaseDataService';
import { generateQuestFollowUp } from './geminiService';

interface FollowUpRequest {
  questId: string;
  subtaskId?: string;
  query: string;
}

interface FollowUpResponse {
  id: string;
  response: string;
  resources: string[];
}

// Add the missing interface for generateFollowUpResponse
interface GenerateFollowUpRequest {
  questTitle: string;
  subtaskTitle: string;
  subtaskDescription: string;
  userQuery: string;
  category: string;
}

export const generateFollowUpResponse = async (request: GenerateFollowUpRequest): Promise<{ response: string; resources: string[] }> => {
  try {
    console.log('🤖 Generating follow-up response for:', request.userQuery);
    
    // Create a contextual query for the AI
    const contextualQuery = `Quest: ${request.questTitle} (${request.category})
Subtask: ${request.subtaskTitle} - ${request.subtaskDescription}
User Question: ${request.userQuery}`;

    const aiResponse = await generateQuestFollowUp(contextualQuery);
    
    return {
      response: aiResponse.response,
      resources: aiResponse.resources
    };
  } catch (error) {
    console.error('❌ Error generating follow-up response:', error);
    return {
      response: 'I encountered an issue generating a response. Please try rephrasing your question or ask for help with a specific aspect of your quest.',
      resources: []
    };
  }
};

// Helper functions to get context
const getQuestContext = async (questId: string) => {
  try {
    // This is a simplified approach - in practice, you'd fetch from your habits/quests store
    // For now, we'll return a basic structure that can be expanded
    return {
      title: 'Current Quest',
      description: 'Working on improving skills and productivity'
    };
  } catch (error) {
    console.error('Error getting quest context:', error);
    return null;
  }
};

const getSubtaskContext = async (subtaskId: string) => {
  try {
    // This would typically fetch from Supabase or local state
    const subtask = await supabaseDataService.getQuestSubtasks('dummy'); // We'll get specific subtask
    return subtask.find(s => s.id === subtaskId) || null;
  } catch (error) {
    console.error('Error getting subtask context:', error);
    return null;
  }
};

export const questFollowUpService = {
  async submitFollowUpQuery(request: FollowUpRequest): Promise<FollowUpResponse> {
    try {
      console.log('Processing follow-up query:', request.query);
      
      // Save the initial follow-up to database
      const followUpData = await supabaseDataService.saveQuestFollowUp({
        questId: request.questId,
        subtaskId: request.subtaskId,
        query: request.query
      });

      const followUpId = followUpData[0].id;

      // Get quest and subtask context for better AI responses
      const quest = await getQuestContext(request.questId);
      const subtask = request.subtaskId ? await getSubtaskContext(request.subtaskId) : null;
      
      // Generate AI response with full context
      const aiResponse = await generateQuestFollowUp(
        request.query,
        quest?.title,
        quest?.description,
        subtask?.title,
        subtask?.description
      );
      
      // Update the follow-up with the response
      await supabaseDataService.updateFollowUpResponse(
        followUpId,
        aiResponse.response,
        aiResponse.resources
      );

      return {
        id: followUpId,
        response: aiResponse.response,
        resources: aiResponse.resources
      };
    } catch (error) {
      console.error('Error processing follow-up query:', error);
      throw error;
    }
  },

  async getQuestFollowUps(questId: string) {
    return await supabaseDataService.getQuestFollowUps(questId);
  }
};
