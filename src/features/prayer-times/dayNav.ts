import { addDays, parseDateKey, toDateKey } from '@/shared/lib/date';

// Past days can be opened and edited, so the arrows and the calendar go back a year. Days before tracking began are not counted as missed.
// Future days cannot be reached at all: a prayer that has not come cannot be logged.
export const MAX_DAYS_BACK = 365;

export function shiftDayKey(key: string, days: number): string {
  return toDateKey(addDays(parseDateKey(key), days));
}

export interface DayRange {
  first: string;
  last: string;
}

export function dayRange(today: string): DayRange {
  return { first: shiftDayKey(today, -MAX_DAYS_BACK), last: today };
}

// The day itself, or the nearest day inside the range. Keeps every way of changing the day away from the future.
export function clampDay(key: string, range: DayRange): string {
  if (key > range.last) return range.last;
  if (key < range.first) return range.first;
  return key;
}

function daysBetween(from: string, to: string): number {
  const ms = parseDateKey(to).getTime() - parseDateKey(from).getTime();
  return Math.round(ms / 86_400_000);
}

// The small line under the date: "Today", "Yesterday" or "3 days ago".
export function relativeDayLabel(key: string, today: string): string {
  const diff = daysBetween(today, key);
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  return `${-diff} days ago`;
}
