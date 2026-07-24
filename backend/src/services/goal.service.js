import { Goal } from '../models/Goal.js';
import { Run } from '../models/Run.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { GOAL_PRESET_DISTANCES_KM, goalLabel } from '../constants/goals.js';

export async function createGoal(userId, { type, targetDistanceKm, targetDate }) {
  const distance = type === 'custom' ? targetDistanceKm : GOAL_PRESET_DISTANCES_KM[type];
  const goal = await Goal.create({ user: userId, type, targetDistanceKm: distance, targetDate });
  return withProgress(goal);
}

export async function listGoals(userId) {
  const goals = await Goal.find({ user: userId }).sort({ createdAt: -1 });
  return Promise.all(goals.map(withProgress));
}

export async function getGoalById(userId, goalId) {
  const goal = await Goal.findOne({ _id: goalId, user: userId });
  if (!goal) throw ApiError.notFound('Objectif introuvable');
  return withProgress(goal);
}

export async function deleteGoal(userId, goalId) {
  const goal = await Goal.findOne({ _id: goalId, user: userId });
  if (!goal) throw ApiError.notFound('Objectif introuvable');
  await goal.deleteOne();
}

/**
 * Attaches a live-computed progress figure: the best single-run distance
 * recorded since the goal was created, as a fraction of the target. Kept
 * separate from the stored `achieved` flag, which is only ever flipped once
 * (at run-creation time, see evaluateGoalsForRun) so it can drive a
 * one-time notification.
 */
async function withProgress(goal) {
  const best = await Run.findOne({ user: goal.user, date: { $gte: goal.createdAt } })
    .sort({ distanceKm: -1 })
    .select('distanceKm');
  const bestDistanceKm = best?.distanceKm ?? 0;
  const progressPercent = Math.min(100, Math.round((bestDistanceKm / goal.targetDistanceKm) * 100));
  return { ...goal.toObject(), bestDistanceKm, progressPercent };
}

/**
 * Called right after a run is saved (see run.service.js). Promotes any
 * still-active goal that this run now satisfies, and records a notification
 * for each — this is the "déclenchement notification à l'atteinte" step.
 */
export async function evaluateGoalsForRun(userId, run) {
  const candidates = await Goal.find({
    user: userId,
    achieved: false,
    createdAt: { $lte: run.date },
    targetDistanceKm: { $lte: run.distanceKm },
  });

  for (const goal of candidates) {
    goal.achieved = true;
    goal.achievedAt = new Date();
    await goal.save();
    await Notification.create({
      user: userId,
      type: 'goal_achieved',
      message: `Objectif "${goalLabel(goal)}" atteint !`,
      relatedGoal: goal._id,
    });
  }
}
