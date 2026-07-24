import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as routingService from '../services/routing.service.js';

export const plan = asyncHandler(async (req, res) => {
  const route = await routingService.planRoute(req.user._id, req.body.waypoints);
  new ApiResponse(201, route, 'Itinéraire calculé').send(res);
});
