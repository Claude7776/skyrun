import { z } from 'zod';

const routePointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  t: z.number(),
});

export const createRunSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  date: z.string().datetime().optional(),
  distanceKm: z.number().min(0),
  durationSec: z.number().min(1),
  route: z.array(routePointSchema).min(2, 'Le trajet doit contenir au moins 2 points'),
});

export const updateRunSchema = z.object({
  title: z.string().trim().min(1).max(80),
});

export const listRunsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
