import { addDays, parseDateKey, toDateKey } from '@/shared/lib/date';
import { getDayTimes, PRAYER_NAMES, type CalculationInput, type PrayerName } from '@/features/prayer-times/calculate';

export interface CatchUpItem {
  date: string;
  prayer: PrayerName;
  time: Date;
}

// A person who did not open the app for weeks should not face hundreds of cards. Older prayers stay unmarked.
export const MAX_DAYS_BACK = 7;

interface QueueInput {
  profile: CalculationInput & { startedOn?: string };
  // Dates and prayers that have a log row, prayed or missed. Anything else is unlogged.
  logged: readonly { date: string; prayer: PrayerName }[];
  at: Date;
}

// First day the queue looks at: the start of tracking, but never more than MAX_DAYS_BACK days ago.
export function queueStartKey(startedOn: string | undefined, at: Date): string {
  const today = toDateKey(at);
  const earliest = toDateKey(addDays(parseDateKey(today), -(MAX_DAYS_BACK - 1)));
  const start = startedOn && startedOn <= today ? startedOn : today;
  return start > earliest ? start : earliest;
}

// Every prayer whose time has passed and that has no log row, oldest first. Uses the same times as every other screen,
// so hand-set times count.
export function buildCatchUpQueue({ profile, logged, at }: QueueInput): CatchUpItem[] {
  const loggedKeys = new Set(logged.map((entry) => `${entry.date}:${entry.prayer}`));
  const today = toDateKey(at);
  const queue: CatchUpItem[] = [];

  for (let day = parseDateKey(queueStartKey(profile.startedOn, at)); toDateKey(day) <= today; day = addDays(day, 1)) {
    const date = toDateKey(day);
    const times = getDayTimes(profile, day);
    for (const prayer of PRAYER_NAMES) {
      if (times[prayer].getTime() <= at.getTime() && !loggedKeys.has(`${date}:${prayer}`)) {
        queue.push({ date, prayer, time: times[prayer] });
      }
    }
  }
  return queue.sort((a, b) => a.time.getTime() - b.time.getTime());
}
