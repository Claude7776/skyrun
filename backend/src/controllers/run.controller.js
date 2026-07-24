import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as runService from '../services/run.service.js';
import * as statsService from '../services/stats.service.js';

export const create = asyncHandler(async (req, res) => {
  const run = await runService.createRun(req.user._id, req.body);
  new ApiResponse(201, run, 'Footing enregistré').send(res);
});

export const list = asyncHandler(async (req, res) => {
  const result = await runService.listRuns(req.user._id, req.query);
  new ApiResponse(200, result).send(res);
});

export const getOne = asyncHandler(async (req, res) => {
  const run = await runService.getRunById(req.user._id, req.params.id);
  new ApiResponse(200, run).send(res);
});

export const update = asyncHandler(async (req, res) => {
  const run = await runService.renameRun(req.user._id, req.params.id, req.body.title);
  new ApiResponse(200, run, 'Footing mis à jour').send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await runService.deleteRun(req.user._id, req.params.id);
  new ApiResponse(200, null, 'Footing supprimé').send(res);
});

export const summary = asyncHandler(async (req, res) => {
  const data = await statsService.getSummary(req.user._id);
  new ApiResponse(200, data).send(res);
});

export const weekly = asyncHandler(async (req, res) => {
  const data = await statsService.getWeeklyStats(req.user._id);
  new ApiResponse(200, data).send(res);
});

export const monthly = asyncHandler(async (req, res) => {
  const data = await statsService.getMonthlyStats(req.user._id);
  new ApiResponse(200, data).send(res);
});

export const records = asyncHandler(async (req, res) => {
  const data = await statsService.getRecords(req.user._id);
  new ApiResponse(200, data).send(res);
});
