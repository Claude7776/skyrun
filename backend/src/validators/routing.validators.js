import { z } from 'zod';

const waypointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const planRouteSchema = z.object({
  waypoints: z.array(waypointSchema).min(2, 'Il faut au moins 2 points pour calculer un itinéraire').max(25),
});
