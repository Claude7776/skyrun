import type { RunSummary, RunRecords, Run } from '@/types/run';
import type { Goal } from '@/types/goal';

export interface Badge {
  id: string;
  emoji: string;
  label: string;
}

// Highest milestone reached wins — no point showing "10 km" once past 100.
const DISTANCE_MILESTONES_KM = [500, 250, 100, 50, 10];
const RUN_COUNT_MILESTONES = [100, 50, 25, 10, 5];
const RECENT_RECORD_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function isRecent(run: Run | null | undefined): boolean {
  if (!run) return false;
  return Date.now() - new Date(run.createdAt).getTime() < RECENT_RECORD_WINDOW_MS;
}

/**
 * Badges are computed on the client from data the API already returns
 * (summary/records/goals) rather than stored server-side — no backend
 * changes needed to light these up.
 */
export function deriveBadges(
  summary: RunSummary | undefined,
  records: RunRecords | undefined,
  goals: Goal[] | undefined
): Badge[] {
  const badges: Badge[] = [];

  if (summary) {
    const distanceMilestone = DISTANCE_MILESTONES_KM.find((m) => summary.totalDistanceKm >= m);
    if (distanceMilestone) {
      badges.push({ id: `distance-${distanceMilestone}`, emoji: '🏁', label: `${distanceMilestone} km parcourus` });
    }

    const runsMilestone = RUN_COUNT_MILESTONES.find((m) => summary.totalRuns >= m);
    if (runsMilestone) {
      badges.push({ id: `runs-${runsMilestone}`, emoji: '👟', label: `${runsMilestone} footings` });
    }
  }

  const achievedGoals = goals?.filter((g) => g.achieved).length ?? 0;
  if (achievedGoals > 0) {
    badges.push({
      id: 'goals-achieved',
      emoji: '🎯',
      label: `${achievedGoals} objectif${achievedGoals > 1 ? 's' : ''} atteint${achievedGoals > 1 ? 's' : ''}`,
    });
  }

  if (records && (isRecent(records.longestDistance) || isRecent(records.longestDuration) || isRecent(records.bestPace))) {
    badges.push({ id: 'new-record', emoji: '🏆', label: 'Nouveau record cette semaine' });
  }

  return badges;
}
