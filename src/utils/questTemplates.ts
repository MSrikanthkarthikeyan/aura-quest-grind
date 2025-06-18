
export interface QuestTemplate {
  id: string;
  title: string;
  category: string;
  xpReward: number;
  frequency: 'daily' | 'weekly' | 'milestone';
  difficulty: 'basic' | 'intermediate' | 'elite';
  roles: string[];
  fitnessTypes?: string[];
  description: string;
  tier: number;
  unlockRequirement?: {
    streak: number;
    level: number;
  };
}

export const questTemplates: QuestTemplate[] = [
  // Developer Quests
  {
    id: 'code-daily',
    title: 'Code Mastery Session',
    category: 'Tech',
    xpReward: 30,
    frequency: 'daily',
    difficulty: 'basic',
    roles: ['developer'],
    description: 'Write code for at least 1 hour',
    tier: 1,
  },
  {
    id: 'leetcode-solve',
    title: 'Algorithm Hunter',
    category: 'Tech',
    xpReward: 40,
    frequency: 'daily',
    difficulty: 'intermediate',
    roles: ['developer'],
    description: 'Solve 1 LeetCode problem',
    tier: 1,
  },
  {
    id: 'github-commit',
    title: 'Code Demon Ritual',
    category: 'Tech',
    xpReward: 25,
    frequency: 'daily',
    difficulty: 'basic',
    roles: ['developer'],
    description: 'Make at least 1 GitHub commit',
    tier: 1,
  },
  {
    id: 'project-work',
    title: 'Shadow Project Forge',
    category: 'Tech',
    xpReward: 50,
    frequency: 'weekly',
    difficulty: 'intermediate',
    roles: ['developer'],
    description: 'Work on personal project for 5+ hours',
    tier: 2,
  },

  // Student Quests
  {
    id: 'study-session',
    title: 'Knowledge Absorption',
    category: 'Academics',
    xpReward: 35,
    frequency: 'daily',
    difficulty: 'basic',
    roles: ['student'],
    description: 'Study for at least 2 hours',
    tier: 1,
  },
  {
    id: 'assignment-complete',
    title: 'Academic Conquest',
    category: 'Academics',
    xpReward: 45,
    frequency: 'weekly',
    difficulty: 'intermediate',
    roles: ['student'],
    description: 'Complete and submit assignment',
    tier: 1,
  },
  {
    id: 'revision-notes',
    title: 'Memory Palace Building',
    category: 'Academics',
    xpReward: 25,
    frequency: 'daily',
    difficulty: 'basic',
    roles: ['student'],
    description: 'Review and organize study notes',
    tier: 1,
  },

  // Entrepreneur Quests
  {
    id: 'pitch-practice',
    title: 'Persuasion Arts Training',
    category: 'Business',
    xpReward: 40,
    frequency: 'weekly',
    difficulty: 'intermediate',
    roles: ['entrepreneur'],
    description: 'Practice business pitch presentation',
    tier: 1,
  },
  {
    id: 'market-research',
    title: 'Intelligence Gathering',
    category: 'Business',
    xpReward: 35,
    frequency: 'weekly',
    difficulty: 'basic',
    roles: ['entrepreneur'],
    description: 'Research market trends and competitors',
    tier: 1,
  },
  {
    id: 'network-connect',
    title: 'Alliance Formation',
    category: 'Business',
    xpReward: 30,
    frequency: 'daily',
    difficulty: 'basic',
    roles: ['entrepreneur'],
    description: 'Connect with 3 new professionals',
    tier: 1,
  },

  // Influencer Quests
  {
    id: 'content-create',
    title: 'Digital Realm Expansion',
    category: 'Content',
    xpReward: 40,
    frequency: 'daily',
    difficulty: 'intermediate',
    roles: ['influencer'],
    description: 'Create and publish content',
    tier: 1,
  },
  {
    id: 'audience-engage',
    title: 'Community Cultivation',
    category: 'Content',
    xpReward: 25,
    frequency: 'daily',
    difficulty: 'basic',
    roles: ['influencer'],
    description: 'Engage with followers for 30+ minutes',
    tier: 1,
  },
  {
    id: 'analytics-review',
    title: 'Performance Analysis',
    category: 'Content',
    xpReward: 30,
    frequency: 'weekly',
    difficulty: 'basic',
    roles: ['influencer'],
    description: 'Review and analyze content metrics',
    tier: 1,
  },

  // Fitness Quests
  {
    id: 'gym-workout',
    title: 'Iron Temple Pilgrimage',
    category: 'Fitness',
    xpReward: 45,
    frequency: 'daily',
    difficulty: 'intermediate',
    roles: ['fitness'],
    fitnessTypes: ['Gym'],
    description: 'Complete gym workout session',
    tier: 1,
  },
  {
    id: 'calisthenics-train',
    title: 'Bodyweight Mastery',
    category: 'Fitness',
    xpReward: 40,
    frequency: 'daily',
    difficulty: 'intermediate',
    roles: ['fitness'],
    fitnessTypes: ['Calisthenics'],
    description: 'Complete calisthenics routine',
    tier: 1,
  },
  {
    id: 'home-workout',
    title: 'Sanctuary Training',
    category: 'Fitness',
    xpReward: 35,
    frequency: 'daily',
    difficulty: 'basic',
    roles: ['fitness'],
    fitnessTypes: ['Home Workout'],
    description: 'Complete home workout routine',
    tier: 1,
  },
  {
    id: 'yoga-practice',
    title: 'Mind-Body Harmony',
    category: 'Fitness',
    xpReward: 30,
    frequency: 'daily',
    difficulty: 'basic',
    roles: ['fitness'],
    fitnessTypes: ['Yoga'],
    description: 'Complete yoga session',
    tier: 1,
  },
  {
    id: 'hydration-track',
    title: 'Elixir of Life',
    category: 'Fitness',
    xpReward: 15,
    frequency: 'daily',
    difficulty: 'basic',
    roles: ['fitness'],
    description: 'Drink 8+ glasses of water',
    tier: 1,
  },

  // Elite Quests (unlocked with high streaks)
  {
    id: 'elite-code-marathon',
    title: 'Shadow Sovereign Code Marathon',
    category: 'Tech',
    xpReward: 100,
    frequency: 'weekly',
    difficulty: 'elite',
    roles: ['developer'],
    description: 'Code for 8+ hours in a single day',
    tier: 3,
    unlockRequirement: { streak: 7, level: 5 },
  },
  {
    id: 'elite-fitness-beast',
    title: 'Demon Lord Transformation',
    category: 'Fitness',
    xpReward: 80,
    frequency: 'weekly',
    difficulty: 'elite',
    roles: ['fitness'],
    description: 'Complete double workout session',
    tier: 3,
    unlockRequirement: { streak: 10, level: 3 },
  },
];

export const getQuestsForRoles = (roles: string[], fitnessTypes: string[] = [], userLevel: number = 1, maxStreak: number = 0) => {
  return questTemplates.filter(quest => {
    // Check if quest matches user roles
    const matchesRole = quest.roles.some(role => roles.includes(role));
    if (!matchesRole) return false;

    // Check fitness type if applicable
    if (quest.fitnessTypes && quest.fitnessTypes.length > 0) {
      const matchesFitnessType = quest.fitnessTypes.some(type => fitnessTypes.includes(type));
      if (!matchesFitnessType) return false;
    }

    // Check unlock requirements for elite quests
    if (quest.unlockRequirement) {
      const meetsLevel = userLevel >= quest.unlockRequirement.level;
      const meetsStreak = maxStreak >= quest.unlockRequirement.streak;
      if (!meetsLevel || !meetsStreak) return false;
    }

    return true;
  });
};

export const scaleQuestDifficulty = (quest: QuestTemplate, streak: number): QuestTemplate => {
  if (streak < 3) return quest;
  
  const scalingFactor = Math.floor(streak / 3);
  const scaledXP = quest.xpReward + (scalingFactor * 10);
  
  let scaledTitle = quest.title;
  if (streak >= 7) {
    scaledTitle = `Elite ${quest.title}`;
  } else if (streak >= 3) {
    scaledTitle = `Advanced ${quest.title}`;
  }

  return {
    ...quest,
    title: scaledTitle,
    xpReward: scaledXP,
    difficulty: streak >= 7 ? 'elite' : streak >= 3 ? 'intermediate' : 'basic',
  };
};
