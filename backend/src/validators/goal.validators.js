import { z } from 'zod';
import { GOAL_TYPES } from '../constants/goals.js';

export const createGoalSchema = z
  .object({
    type: z.enum(GOAL_TYPES),
    targetDistanceKm: z.number().min(0.1).optional(),
    targetDate: z.string().datetime().optional(),
  })
  .refine((data) => data.type !== 'custom' || (data.targetDistanceKm && data.targetDistanceKm > 0), {
    message: 'targetDistanceKm est requis pour un objectif personnalisé',
    path: ['targetDistanceKm'],
  });
