export type Course = {
  id: string;
  title: string;
  coverUrl?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  lessons: number;
  durationMinutes: number;
  rating?: number;
  tags?: string[];
  shortDescription?: string;
};

export type PathNode = {
  id: string;
  courseId: string;
  status: 'locked' | 'in_progress' | 'done';
};

export type PathProgress = {
  userId: string;
  nodes: PathNode[];
  completionPct: number;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  interests?: string[];
  preferredLevel?: 'beginner' | 'intermediate' | 'advanced';
  theme?: 'system' | 'light' | 'dark';
  onboardingComplete: boolean;
  weeklyGoalMinutes?: number;
};
