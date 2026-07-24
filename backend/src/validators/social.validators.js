import { z } from 'zod';

export const addCommentSchema = z.object({
  text: z.string().trim().min(1, 'Le commentaire ne peut pas être vide').max(500),
});

export const listFeedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
