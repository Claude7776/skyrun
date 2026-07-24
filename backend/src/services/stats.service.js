import mongoose from 'mongoose';
import { Run } from '../models/Run.js';
import { Notification } from '../models/Notification.js';

const WEEKS_RANGE = 8;
const MONTHS_RANGE = 6;

function toObjectId(userId) {
  return new mongoose.Types.ObjectId(userId);
}

function truncateToMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getSummary(userId) {
  const [result] = await Run.aggregate([
    { $match: { user: toObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalDistanceKm: { $sum: '$distanceKm' },
        totalDurationSec: { $sum: '$durationSec' },
        totalRuns: { $sum: 1 },
        totalCalories: { $sum: '$calories' },
      },
    },
  ]);

  if (!result) {
    return {
      totalDistanceKm: 0,
      totalDurationSec: 0,
      totalRuns: 0,
      totalCalories: 0,
      avgPaceMinPerKm: 0,
      avgDurationSec: 0,
    };
  }

  const avgPaceMinPerKm =
    result.totalDistanceKm > 0 ? Number((result.totalDurationSec / 60 / result.totalDistanceKm).toFixed(2)) : 0;
  const avgDurationSec = Math.round(result.totalDurationSec / result.totalRuns);

  return {
    totalDistanceKm: Number(result.totalDistanceKm.toFixed(2)),
    totalDurationSec: result.totalDurationSec,
    totalRuns: result.totalRuns,
    totalCalories: result.totalCalories,
    avgPaceMinPerKm,
    avgDurationSec,
  };
}

/** Distance per ISO-ish week (Monday start) over the last WEEKS_RANGE weeks, zero-filled for a continuous chart. */
export async function getWeeklyStats(userId) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - WEEKS_RANGE * 7);

  const results = await Run.aggregate([
    { $match: { user: toObjectId(userId), date: { $gte: start } } },
    {
      $group: {
        _id: { $dateTrunc: { date: '$date', unit: 'week', startOfWeek: 'monday' } },
        distanceKm: { $sum: '$distanceKm' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byWeek = new Map(results.map((r) => [r._id.toISOString().slice(0, 10), Number(r.distanceKm.toFixed(2))]));

  const weeks = [];
  const cursor = truncateToMonday(start);
  const endWeek = truncateToMonday(now);
  while (cursor <= endWeek) {
    const key = cursor.toISOString().slice(0, 10);
    weeks.push({ weekStart: key, distanceKm: byWeek.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 7);
  }
  return weeks;
}

/** Distance per calendar month over the last MONTHS_RANGE months, zero-filled. */
export async function getMonthlyStats(userId) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (MONTHS_RANGE - 1), 1);

  const results = await Run.aggregate([
    { $match: { user: toObjectId(userId), date: { $gte: start } } },
    {
      $group: {
        _id: { $dateTrunc: { date: '$date', unit: 'month' } },
        distanceKm: { $sum: '$distanceKm' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byMonth = new Map(results.map((r) => [r._id.toISOString().slice(0, 7), Number(r.distanceKm.toFixed(2))]));

  const months = [];
  const cursor = new Date(start);
  for (let i = 0; i < MONTHS_RANGE; i += 1) {
    const key = cursor.toISOString().slice(0, 7);
    months.push({ month: key, distanceKm: byMonth.get(key) ?? 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

export async function getRecords(userId) {
  const [longestDistance, longestDuration, bestPace] = await Promise.all([
    Run.findOne({ user: userId }).sort({ distanceKm: -1 }),
    Run.findOne({ user: userId }).sort({ durationSec: -1 }),
    Run.findOne({ user: userId, distanceKm: { $gt: 0 } }).sort({ avgPaceMinPerKm: 1 }),
  ]);
  return { longestDistance, longestDuration, bestPace };
}

/**
 * Called right after a run is saved (see run.service.js). Compares it
 * against the user's *previous* records (i.e. excluding the run itself) and
 * notifies for each one it beats. Skipped entirely for a user's very first
 * run — trivially "the longest/fastest" with nothing to compare against,
 * which would otherwise fire three notifications on day one.
 */
export async function evaluateRecordsForRun(userId, run) {
  const hasPriorRuns = await Run.exists({ user: userId, _id: { $ne: run._id } });
  if (!hasPriorRuns) return;

  const [prevLongestDistance, prevLongestDuration, prevBestPace] = await Promise.all([
    Run.findOne({ user: userId, _id: { $ne: run._id } }).sort({ distanceKm: -1 }),
    Run.findOne({ user: userId, _id: { $ne: run._id } }).sort({ durationSec: -1 }),
    Run.findOne({ user: userId, _id: { $ne: run._id }, distanceKm: { $gt: 0 } }).sort({ avgPaceMinPerKm: 1 }),
  ]);

  const messages = [];
  if (run.distanceKm > (prevLongestDistance?.distanceKm ?? 0)) {
    messages.push(`Nouveau record de distance : ${run.distanceKm} km !`);
  }
  if (run.durationSec > (prevLongestDuration?.durationSec ?? 0)) {
    messages.push(`Nouveau record de durée : ${Math.round(run.durationSec / 60)} min !`);
  }
  if (run.distanceKm > 0 && (!prevBestPace || run.avgPaceMinPerKm < prevBestPace.avgPaceMinPerKm)) {
    messages.push(`Nouveau record d'allure : ${run.avgPaceMinPerKm.toFixed(2)} min/km !`);
  }

  if (messages.length > 0) {
    await Notification.insertMany(messages.map((message) => ({ user: userId, type: 'new_record', message })));
  }
}
