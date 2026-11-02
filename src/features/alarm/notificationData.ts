import { PRAYER_NAMES, type PrayerName } from '@/features/prayer-times/calculate';
import type { AlarmKind } from './schedule';

export interface AlarmTarget {
  prayer: PrayerName;
  date: string;
}

export function isPrayerName(value: unknown): value is PrayerName {
  return PRAYER_NAMES.includes(value as PrayerName);
}

export function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

// Only prayer alarms and follow-ups open the alarm screen. Reminders just open the app.
export function alarmTargetFromData(data: unknown): AlarmTarget | null {
  if (typeof data !== 'object' || data === null) return null;
  const { kind, prayer, date } = data as Record<string, unknown>;
  const opensAlarm: AlarmKind[] = ['prayer', 'followup'];
  if (!opensAlarm.includes(kind as AlarmKind)) return null;
  return isPrayerName(prayer) && isDateKey(date) ? { prayer, date } : null;
}
