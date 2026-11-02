import { PRAYER_NAMES, type DayTimes, type PrayerName } from './calculate';

export type PrayerState = 'prayed' | 'missed' | 'upcoming';

export interface NextPrayer {
  name: PrayerName;
  time: Date;
  isTomorrow: boolean;
}

// Prayed wins over everything. Otherwise a passed time with no log row is missed.
export function getPrayerState(time: Date, prayed: boolean, at: Date): PrayerState {
  if (prayed) return 'prayed';
  return time.getTime() <= at.getTime() ? 'missed' : 'upcoming';
}

export function getDayStates(
  times: DayTimes,
  prayed: ReadonlySet<PrayerName>,
  at: Date,
): Record<PrayerName, PrayerState> {
  return Object.fromEntries(
    PRAYER_NAMES.map((name) => [name, getPrayerState(times[name], prayed.has(name), at)]),
  ) as Record<PrayerName, PrayerState>;
}

// The next prayer is the first one strictly in the future. After Isha it is tomorrow's Fajr.
export function getNextPrayer(today: DayTimes, tomorrow: DayTimes, at: Date): NextPrayer {
  const upcoming = PRAYER_NAMES.find((name) => today[name].getTime() > at.getTime());
  if (upcoming) return { name: upcoming, time: today[upcoming], isTomorrow: false };
  return { name: 'fajr', time: tomorrow.fajr, isTomorrow: true };
}
