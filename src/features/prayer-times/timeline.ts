import { PRAYER_NAMES, type DayTimes, type PrayerName } from './calculate';

// passed: the time has gone. current: the prayer in progress. upcoming: not yet.
export type TimelineKind = 'passed' | 'current' | 'upcoming';

export function timelineKinds(
  times: DayTimes,
  at: Date,
  currentName: PrayerName | null,
): Record<PrayerName, TimelineKind> {
  return Object.fromEntries(
    PRAYER_NAMES.map((name) => {
      const kind: TimelineKind =
        name === currentName ? 'current' : times[name].getTime() <= at.getTime() ? 'passed' : 'upcoming';
      return [name, kind];
    }),
  ) as Record<PrayerName, TimelineKind>;
}

// Index of the last dot the green line reaches, or -1 when no prayer has started.
export function lastReachedIndex(kinds: Record<PrayerName, TimelineKind>): number {
  let last = -1;
  PRAYER_NAMES.forEach((name, index) => {
    if (kinds[name] !== 'upcoming') last = index;
  });
  return last;
}
