import { isDateKey, isPrayerName } from '@/features/alarm/notificationData';
import type { PrayerName } from '@/features/prayer-times/calculate';

export interface AskTarget {
  prayer: PrayerName;
  date: string;
  first: boolean;
}

// Only an ask opens the reminder screen. The heads-up notification just opens the app.
export function askTargetFromData(data: unknown): AskTarget | null {
  if (typeof data !== 'object' || data === null) return null;
  const { kind, prayer, date, first } = data as Record<string, unknown>;
  if (kind !== 'ask') return null;
  return isPrayerName(prayer) && isDateKey(date) ? { prayer, date, first: first === true } : null;
}
