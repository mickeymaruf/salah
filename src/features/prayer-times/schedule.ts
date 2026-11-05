import { PRAYER_NAMES, type DayTimes, type PrayerName } from './calculate';
import type { Outcome } from './data/prayerLog';

// Unmarked is a prayer whose time has passed and that the user has not marked. It is never counted as missed.
export type PrayerState = 'prayed' | 'missed' | 'unmarked' | 'upcoming';

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

// Lets hooks keep the same `states` object between ticks while nothing changed: encode to a string, compare, decode.
export function encodeStates(states: Record<PrayerName, PrayerState>): string {
  return PRAYER_NAMES.map((name) => states[name]).join(',');
}

export function decodeStates(key: string): Record<PrayerName, PrayerState> {
  const parts = key.split(',') as PrayerState[];
  return Object.fromEntries(PRAYER_NAMES.map((name, i) => [name, parts[i]])) as Record<PrayerName, PrayerState>;
}
