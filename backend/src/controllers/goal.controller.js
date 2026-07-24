import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as goalService from '../services/goal.service.js';

export const create = asyncHandler(async (req, res) => {
  const goal = await goalService.createGoal(req.user._id, req.body);
  new ApiResponse(201, goal, 'Objectif créé').send(res);
});

export const list = asyncHandler(async (req, res) => {
  const goals = await goalService.listGoals(req.user._id);
  new ApiResponse(200, goals).send(res);
});

export const getOne = asyncHandler(async (req, res) => {
  const goal = await goalService.getGoalById(req.user._id, req.params.id);
  new ApiResponse(200, goal).send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await goalService.deleteGoal(req.user._id, req.params.id);
  new ApiResponse(200, null, 'Objectif supprimé').send(res);
});
