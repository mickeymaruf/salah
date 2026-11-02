import type { YearGrid } from './model';

export interface YearStats {
  // Null when nothing has been tracked yet.
  percentKept: number | null;
  prayed: number;
  missed: number;
  bestStreak: number;
}

// Counts only prayers whose time has passed. Upcoming and untracked prayers are ignored.
// A streak is a run of consecutive days with all five prayers prayed.
export function computeStats(grid: YearGrid): YearStats {
  let prayed = 0;
  let missed = 0;
  let bestStreak = 0;
  let run = 0;

  for (const cell of grid.flat()) {
    for (const state of cell.states) {
      if (state === 'prayed') prayed++;
      else if (state === 'missed') missed++;
    }
    if (cell.states.every((state) => state === 'prayed')) {
      run++;
      bestStreak = Math.max(bestStreak, run);
    } else {
      run = 0;
    }
  }

  const total = prayed + missed;
  return { percentKept: total === 0 ? null : Math.round((prayed / total) * 100), prayed, missed, bestStreak };
}

export function formatStreak(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}
