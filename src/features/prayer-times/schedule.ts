import { PRAYER_NAMES, type DayTimes, type PrayerName } from './calculate';
import type { Outcome } from './data/prayerLog';

// Unmarked is a prayer whose time has passed and that the user has not marked. It is never counted as missed.
export type PrayerState = 'prayed' | 'missed' | 'unmarked' | 'upcoming';

export interface NextPrayer {
  name: PrayerName;
  time: Date;
  isTomorrow: boolean;
}

// What the user chose wins, even before the time. With no choice, a passed time is unmarked and a future one upcoming.
export function getPrayerState(time: Date, outcome: Outcome | undefined, at: Date): PrayerState {
  if (outcome) return outcome;
  return time.getTime() <= at.getTime() ? 'unmarked' : 'upcoming';
}

export function getDayStates(
  times: DayTimes,
  outcomes: ReadonlyMap<PrayerName, Outcome>,
  at: Date,
): Record<PrayerName, PrayerState> {
  return Object.fromEntries(
    PRAYER_NAMES.map((name) => [name, getPrayerState(times[name], outcomes.get(name), at)]),
  ) as Record<PrayerName, PrayerState>;
}

// The next prayer is the first one strictly in the future. After Isha it is tomorrow's Fajr.
export function getNextPrayer(today: DayTimes, tomorrow: DayTimes, at: Date): NextPrayer {
  const upcoming = PRAYER_NAMES.find((name) => today[name].getTime() > at.getTime());
  if (upcoming) return { name: upcoming, time: today[upcoming], isTomorrow: false };
  return { name: 'fajr', time: tomorrow.fajr, isTomorrow: true };
}

// Lets hooks keep the same `states` object between ticks while nothing changed: encode to a string, compare, decode.
export function encodeStates(states: Record<PrayerName, PrayerState>): string {
  return PRAYER_NAMES.map((name) => states[name]).join(',');
}

export function decodeStates(key: string): Record<PrayerName, PrayerState> {
  const parts = key.split(',') as PrayerState[];
  return Object.fromEntries(PRAYER_NAMES.map((name, i) => [name, parts[i]])) as Record<PrayerName, PrayerState>;
}
