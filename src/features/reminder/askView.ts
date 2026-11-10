import { addDays, formatTime } from '@/shared/lib/date';
import { PRAYER_LABELS, PRAYER_NAMES, type DayTimes, type PrayerName } from '@/features/prayer-times/calculate';

const MINUTE = 60_000;

export function formatAgo(minutes: number): string {
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h ago` : `${hours} h ${rest} min ago`;
}

// "Asked at 3:42 PM · 10 min ago" for the second and later asks.
export function askedLine(prayerTime: Date, at: Date): string {
  const minutes = Math.max(1, Math.round((at.getTime() - prayerTime.getTime()) / MINUTE));
  return `Asked at ${formatTime(prayerTime)} · ${formatAgo(minutes)}`;
}

// "Next: Maghrib at 5:21 PM". After Isha the next prayer is tomorrow's Fajr.
export function nextLine(prayer: PrayerName, date: Date, timesOf: (day: Date) => DayTimes): string {
  const i = PRAYER_NAMES.indexOf(prayer);
  const next = i + 1 < PRAYER_NAMES.length ? { name: PRAYER_NAMES[i + 1], time: timesOf(date)[PRAYER_NAMES[i + 1]] } : { name: 'fajr' as const, time: timesOf(addDays(date, 1)).fajr };
  return `Next: ${PRAYER_LABELS[next.name]} at ${formatTime(next.time)}`;
}
