export const GOAL_TYPES = ['5k', '10k', 'half_marathon', 'marathon', 'custom'];

export const GOAL_PRESET_DISTANCES_KM = {
  '5k': 5,
  '10k': 10,
  half_marathon: 21.1,
  marathon: 42.195,
};

export const GOAL_LABELS = {
  '5k': '5 km',
  '10k': '10 km',
  half_marathon: 'Semi-marathon',
  marathon: 'Marathon',
};

export function goalLabel(goal) {
  return GOAL_LABELS[goal.type] ?? `${goal.targetDistanceKm} km`;
}
