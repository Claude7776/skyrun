import type { GoalType } from '@/types/goal';

export const GOAL_PRESETS: { type: GoalType; label: string }[] = [
  { type: '5k', label: '5 km' },
  { type: '10k', label: '10 km' },
  { type: 'half_marathon', label: 'Semi-marathon' },
  { type: 'marathon', label: 'Marathon' },
  { type: 'custom', label: 'Personnalisé' },
];

export const GOAL_LABELS: Record<GoalType, string> = {
  '5k': '5 km',
  '10k': '10 km',
  half_marathon: 'Semi-marathon',
  marathon: 'Marathon',
  custom: 'Personnalisé',
};

export function goalLabel(type: GoalType, targetDistanceKm: number): string {
  return type === 'custom' ? `${targetDistanceKm} km` : GOAL_LABELS[type];
}
