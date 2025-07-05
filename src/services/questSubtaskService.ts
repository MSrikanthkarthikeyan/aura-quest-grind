import { generateQuestFollowUp } from './geminiService';

interface QuestSubtask {
  title: string;
  description: string;
  estimatedPomodoros: number;
}

export const generateQuestSubtasks = async (
  questTitle: string,
  questCategory: string,
  questDescription?: string
): Promise<QuestSubtask[]> => {
  try {
    console.log('🔥 Generating subtasks for quest:', questTitle);

    const prompt = `Break down this quest/habit into 3-5 actionable subtasks:

Quest: ${questTitle}
Category: ${questCategory}
Description: ${questDescription || 'A productive habit to build'}

Create specific, measurable subtasks that would help someone complete this quest effectively. Each subtask should be focused and achievable.

Format as JSON array:
[
  {
    "title": "Subtask title",
    "description": "Brief description of what to do",
    "estimatedPomodoros": 1-3
  }
]

Examples:
- For coding quests: "Set up environment", "Write core functionality", "Test and debug"
- For learning quests: "Review concepts", "Practice exercises", "Apply knowledge"
- For fitness quests: "Warm up", "Main workout", "Cool down and stretch"

Make each subtask actionable and motivating. Return only the JSON array.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCh_5H3df-gsWXiQWbD7aG5br6FD0jE1sI`, {
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
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    console.log('Raw subtask response:', responseText);
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const subtasks = JSON.parse(jsonMatch[0]);
      console.log('✅ Generated subtasks successfully:', subtasks.length);
      return subtasks;
    }
    
    throw new Error('No valid JSON found in AI response');
    
  } catch (error) {
    console.error('❌ Error generating subtasks:', error);
    // Return fallback subtasks based on quest category
    return getFallbackSubtasks(questTitle, questCategory);
  }
};

const getFallbackSubtasks = (questTitle: string, questCategory: string): QuestSubtask[] => {
  const fallbacks: { [key: string]: QuestSubtask[] } = {
    'Tech': [
      { title: 'Plan and prepare', description: 'Set up workspace and gather necessary resources', estimatedPomodoros: 1 },
      { title: 'Implement core functionality', description: 'Focus on the main coding/development work', estimatedPomodoros: 2 },
      { title: 'Test and refine', description: 'Debug, test, and polish your work', estimatedPomodoros: 1 }
    ],
    'Academics': [
      { title: 'Review materials', description: 'Go through notes, textbooks, or study materials', estimatedPomodoros: 1 },
      { title: 'Practice problems', description: 'Work through exercises and practice questions', estimatedPomodoros: 2 },
      { title: 'Summarize and review', description: 'Create summaries and review key concepts', estimatedPomodoros: 1 }
    ],
    'Fitness': [
      { title: 'Warm up', description: 'Prepare your body with light movements', estimatedPomodoros: 1 },
      { title: 'Main workout', description: 'Execute the core fitness routine', estimatedPomodoros: 2 },
      { title: 'Cool down', description: 'Stretch and recover properly', estimatedPomodoros: 1 }
    ],
    'Business': [
      { title: 'Research and plan', description: 'Gather information and create a strategy', estimatedPomodoros: 1 },
      { title: 'Execute key actions', description: 'Implement the main business activities', estimatedPomodoros: 2 },
      { title: 'Review and optimize', description: 'Analyze results and make improvements', estimatedPomodoros: 1 }
    ],
    'Personal': [
      { title: 'Prepare and organize', description: 'Set up what you need for this quest', estimatedPomodoros: 1 },
      { title: 'Focus on main activity', description: 'Engage in the core personal development work', estimatedPomodoros: 2 },
      { title: 'Reflect and plan ahead', description: 'Review progress and plan next steps', estimatedPomodoros: 1 }
    ]
  };

  return fallbacks[questCategory] || fallbacks['Personal'];
};