import { z } from 'zod';

const difficultySchema = z.enum(['easy', 'medium', 'hard']);

export const createCourseSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(80),
  description: z.string().trim().max(500).optional().default(''),
  difficulty: difficultySchema,
  distanceKm: z.number().min(0),
  estimatedTimeMin: z.number().min(0),
});

export const updateCourseSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(500).optional(),
  difficulty: difficultySchema.optional(),
  distanceKm: z.number().min(0).optional(),
  estimatedTimeMin: z.number().min(0).optional(),
  isPublic: z.boolean().optional(),
});

export const listCoursesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
