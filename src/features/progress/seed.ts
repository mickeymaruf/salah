import { PRAYER_NAMES, type PrayerName } from '@/features/prayer-times/calculate';
import { addDays, toDateKey } from '@/shared/lib/date';

export interface SeedRow {
  date: string;
  prayer: PrayerName;
}

// Small deterministic hash so the sample year looks the same every time.
function chance(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

// Fills January 1 up to yesterday. Some days are fully prayed and some have gaps, so the grid and streaks have variety.
export function buildSeedRows(year: number, today: Date): SeedRow[] {
  const rows: SeedRow[] = [];
  const last = addDays(today, -1);
  for (let day = new Date(year, 0, 1); day <= last; day = addDays(day, 1)) {
    const date = toDateKey(day);
    const strong = chance(`${date}:day`) < 0.55;
    for (const prayer of PRAYER_NAMES) {
      if (chance(`${date}:${prayer}`) < (strong ? 0.97 : 0.7)) rows.push({ date, prayer });
    }
  }
  return rows;
}
