
export interface QuestSubtask {
  id: string;
  title: string;
  description?: string; // Make this optional to match database service
  estimatedPomodoros: number;
  isCompleted: boolean;
  resources?: string[];
  followUpQueries?: string[];
}

export interface EnhancedQuestTemplate {
  id: string;
  title: string;
  category: string;
  xpReward: number;
  frequency: 'daily' | 'weekly' | 'milestone';
  difficulty: 'basic' | 'intermediate' | 'elite';
  description: string;
  tier: number;
  subtasks: QuestSubtask[];
  totalEstimatedPomodoros: number;
  isCustom?: boolean;
}

export interface QuestFollowUp {
  questId: string;
  subtaskId: string;
  query: string;
  response?: string;
  resources?: string[];
  timestamp: string;
}
