import { addDays, parseDateKey, toDateKey } from '@/shared/lib/date';
import { PRAYER_NAMES, type DayTimes, type PrayerName } from '../prayer-times/calculate';
import type { Outcome } from '../prayer-times/data/prayerLog';
import type { PrayerState } from '../prayer-times/schedule';

export const GOAL_DAYS = 40;
// How far back the log is read. A streak can be longer than the 40-day goal.
export const HISTORY_DAYS = 366;

export interface TreeProgress {
  // Days among the last 40 (today included) on which all five prayers were prayed.
  perfectDays: number;
  // How much of today counts while it is still open: prayed / 5, or 0 once a prayer was missed.
  todayFraction: number;
  // 0 (bare tree) to 1 (full tree).
  fullness: number;
  streak: number;
  daysToGo: number;
  percent: number;
  full: boolean;
}

export interface TodayStanding {
  prayed: number;
  // True once a prayer was marked missed, or its window ended unmarked. Today can no longer be perfect.
  broken: boolean;
}

// A prayer's window ends when the next prayer starts. Isha's ends at tomorrow's Fajr.
export function windowsEnded(times: DayTimes, tomorrowFajr: Date, at: Date): Record<PrayerName, boolean> {
  const ends = [times.dhuhr, times.asr, times.maghrib, times.isha, tomorrowFajr];
  return Object.fromEntries(
    PRAYER_NAMES.map((name, i) => [name, ends[i].getTime() <= at.getTime()]),
  ) as Record<PrayerName, boolean>;
}

export function todayStanding(
  states: Record<PrayerName, PrayerState>,
  ended: Record<PrayerName, boolean>,
): TodayStanding {
  let prayed = 0;
  let broken = false;
  for (const name of PRAYER_NAMES) {
    if (states[name] === 'prayed') prayed++;
    else if (states[name] === 'missed' || (states[name] === 'unmarked' && ended[name])) broken = true;
  }
  return { prayed, broken };
}

interface Input {
  todayKey: string;
  entries: readonly { date: string; prayer: PrayerName; outcome: Outcome }[];
  today: TodayStanding;
}

export function computeTreeProgress({ todayKey, entries, today }: Input): TreeProgress {
  const prayedByDate = new Map<string, Set<PrayerName>>();
  for (const { date, prayer, outcome } of entries) {
    if (outcome !== 'prayed') continue;
    const set = prayedByDate.get(date) ?? new Set<PrayerName>();
    set.add(prayer);
    prayedByDate.set(date, set);
  }
  const isPerfect = (date: string) => (prayedByDate.get(date)?.size ?? 0) === PRAYER_NAMES.length;

  const base = parseDateKey(todayKey);
  const todayPerfect = today.prayed === PRAYER_NAMES.length;
  const keyBefore = (days: number) => toDateKey(addDays(base, -days));

  let perfectDays = todayPerfect ? 1 : 0;
  for (let i = 1; i < GOAL_DAYS; i++) if (isPerfect(keyBefore(i))) perfectDays++;

  let streak = todayPerfect ? 1 : 0;
  for (let i = 1; i <= HISTORY_DAYS && isPerfect(keyBefore(i)); i++) streak++;

  const todayFraction = todayPerfect || today.broken ? 0 : today.prayed / PRAYER_NAMES.length;
  const fullness = Math.min(1, (perfectDays + todayFraction) / GOAL_DAYS);
  return {
    perfectDays,
    todayFraction,
    fullness,
    streak,
    daysToGo: Math.max(0, GOAL_DAYS - perfectDays),
    percent: Math.round(fullness * 100),
    full: perfectDays >= GOAL_DAYS,
  };
}
