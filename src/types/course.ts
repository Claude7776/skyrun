export type CourseDifficulty = 'easy' | 'medium' | 'hard';

export interface Course {
  _id: string;
  user: string;
  name: string;
  description: string;
  difficulty: CourseDifficulty;
  distanceKm: number;
  estimatedTimeMin: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  // Only present on the GET /courses/:id response (not the list endpoint).
  likesCount?: number;
  likedByMe?: boolean;
}
