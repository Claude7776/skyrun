export type GoalType = '5k' | '10k' | 'half_marathon' | 'marathon' | 'custom';

export interface Goal {
  _id: string;
  user: string;
  type: GoalType;
  targetDistanceKm: number;
  targetDate: string | null;
  achieved: boolean;
  achievedAt: string | null;
  bestDistanceKm: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}
