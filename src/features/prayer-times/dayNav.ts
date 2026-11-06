import { addDays, parseDateKey, toDateKey } from '@/shared/lib/date';

// Future days are view-only, so the arrows stop a couple of weeks ahead.
export const MAX_DAYS_AHEAD = 14;
// Past days can be opened and edited, so the arrows go back a year. Days before tracking began are not counted as missed.
export const MAX_DAYS_BACK = 365;

export function shiftDayKey(key: string, days: number): string {
  return toDateKey(addDays(parseDateKey(key), days));
}

export interface DayRange {
  first: string;
  last: string;
}

export function dayRange(today: string): DayRange {
  return { first: shiftDayKey(today, -MAX_DAYS_BACK), last: shiftDayKey(today, MAX_DAYS_AHEAD) };
}

function daysBetween(from: string, to: string): number {
  const ms = parseDateKey(to).getTime() - parseDateKey(from).getTime();
  return Math.round(ms / 86_400_000);
}

// The small line under the date: "Today", "Yesterday", "3 days ago", "Tomorrow", "In 3 days".
export function relativeDayLabel(key: string, today: string): string {
  const diff = daysBetween(today, key);
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  if (diff === 1) return 'Tomorrow';
  return diff < 0 ? `${-diff} days ago` : `In ${diff} days`;
}
