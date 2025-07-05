
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

      // Generate AI response
      const aiResponse = await generateQuestFollowUp(request.query);
      
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
