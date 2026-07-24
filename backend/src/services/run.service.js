import { Run } from '../models/Run.js';
import { ApiError } from '../utils/ApiError.js';
import { estimateCalories } from './calorie.service.js';
import { evaluateGoalsForRun } from './goal.service.js';
import { evaluateRecordsForRun } from './stats.service.js';

/** Speed/pace are always derived server-side from distance+duration — never trusted from the client. */
function computeMetrics(distanceKm, durationSec) {
  const avgSpeedKmh = distanceKm > 0 ? Number((distanceKm / (durationSec / 3600)).toFixed(2)) : 0;
  const avgPaceMinPerKm = distanceKm > 0 ? Number((durationSec / 60 / distanceKm).toFixed(2)) : 0;
  return { avgSpeedKmh, avgPaceMinPerKm };
}

export async function createRun(userId, { title, date, distanceKm, durationSec, route }) {
  const { avgSpeedKmh, avgPaceMinPerKm } = computeMetrics(distanceKm, durationSec);

  const run = await Run.create({
    user: userId,
    title,
    date: date ?? new Date(),
    distanceKm,
    durationSec,
    avgSpeedKmh,
    avgPaceMinPerKm,
    calories: estimateCalories(distanceKm),
    route,
  });

  await evaluateGoalsForRun(userId, run);
  await evaluateRecordsForRun(userId, run);

  return run;
}

export async function listRuns(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Run.find({ user: userId }).sort({ date: -1 }).skip(skip).limit(limit),
    Run.countDocuments({ user: userId }),
  ]);
  return { items, total, page, limit };
}

export async function getRunById(userId, runId) {
  const run = await Run.findOne({ _id: runId, user: userId });
  if (!run) throw ApiError.notFound('Footing introuvable');
  return run;
}

export async function renameRun(userId, runId, title) {
  const run = await getRunById(userId, runId);
  run.title = title;
  await run.save();
  return run;
}

export async function deleteRun(userId, runId) {
  const run = await getRunById(userId, runId);
  await run.deleteOne();
}
