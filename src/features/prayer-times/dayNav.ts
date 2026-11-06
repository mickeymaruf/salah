import { addDays, parseDateKey, toDateKey } from '@/shared/lib/date';

// Future days are view-only, so the arrows stop a couple of weeks ahead.
export const MAX_DAYS_AHEAD = 14;
// With no start date on the profile, the arrows go back this far.
export const DEFAULT_DAYS_BACK = 30;

export function shiftDayKey(key: string, days: number): string {
  return toDateKey(addDays(parseDateKey(key), days));
}

export interface DayRange {
  first: string;
  last: string;
}

// The first day is where tracking started: earlier days were never part of the log.
export function dayRange(startedOn: string | undefined, today: string): DayRange {
  const fallback = shiftDayKey(today, -DEFAULT_DAYS_BACK);
  const first = startedOn && startedOn <= today ? startedOn : fallback;
  return { first, last: shiftDayKey(today, MAX_DAYS_AHEAD) };
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
