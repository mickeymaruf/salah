import { addDays, toDateKey } from '@/shared/lib/date';
import { PRAYER_LABELS, PRAYER_NAMES, type DayTimes, type PrayerName } from '@/features/prayer-times/calculate';
import { REMINDER_INTERVAL_MINUTES, REMINDER_MAX_MINUTES_WITHOUT_STOP } from './config';

const MINUTE = 60_000;

export type AskKind = 'ask' | 'headsup';

export interface PlannedAsk {
  id: string;
  kind: AskKind;
  prayer: PrayerName;
  date: string;
  fireAt: Date;
  // True for the ask at the prayer time itself (screen 4). Later asks are the "Have you prayed already?" screen.
  first: boolean;
  title: string;
  body: string;
}

export function askKey(date: string, prayer: PrayerName): string {
  return `${date}:${prayer}`;
}

export interface PrayerWindowOfDay {
  date: string;
  prayer: PrayerName;
  start: Date;
  end: Date;
}

// One entry per prayer from `fromOffset` days away to `toOffset`, each ending when the next prayer begins
// (Isha ends at the next day's Fajr).
export function prayerWindows(
  timesOf: (day: Date) => DayTimes,
  from: Date,
  fromOffset: number,
  toOffset: number,
  stopsAtNextPrayer: boolean,
): PrayerWindowOfDay[] {
  const windows: PrayerWindowOfDay[] = [];
  for (let offset = fromOffset; offset <= toOffset; offset++) {
    const day = addDays(from, offset);
    const today = timesOf(day);
    const tomorrow = timesOf(addDays(day, 1));
    PRAYER_NAMES.forEach((prayer, i) => {
      const start = today[prayer];
      const next = i + 1 < PRAYER_NAMES.length ? today[PRAYER_NAMES[i + 1]] : tomorrow.fajr;
      const end = stopsAtNextPrayer ? next : new Date(start.getTime() + REMINDER_MAX_MINUTES_WITHOUT_STOP * MINUTE);
      windows.push({ date: toDateKey(day), prayer, start, end });
    });
  }
  return windows;
}

interface PlanInput {
  timesOf: (day: Date) => DayTimes;
  from: Date;
  daysAhead: number;
  // Keys from askKey of prayers already marked prayed.
  prayed: ReadonlySet<string>;
  // When the user last answered "Not yet" or closed the ask, by askKey. The next ask is that moment plus the interval.
  anchors: Readonly<Record<string, string>>;
  stopsAtNextPrayer: boolean;
  headsUpMinutes: number;
  budget: number;
}

function parseTime(value: string | undefined): number | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

export function planAsks({ timesOf, from, daysAhead, prayed, anchors, stopsAtNextPrayer, headsUpMinutes, budget }: PlanInput): PlannedAsk[] {
  const after = from.getTime();
  const interval = REMINDER_INTERVAL_MINUTES * MINUTE;
  const heads: PlannedAsk[] = [];
  const extras: PlannedAsk[] = [];

  for (const window of prayerWindows(timesOf, from, -1, daysAhead - 1, stopsAtNextPrayer)) {
    const { date, prayer, start, end } = window;
    if (prayed.has(askKey(date, prayer))) continue;
    const label = PRAYER_LABELS[prayer];

    if (headsUpMinutes > 0) {
      const at = start.getTime() - headsUpMinutes * MINUTE;
      if (at > after) {
        extras.push({
          id: `headsup-${date}-${prayer}`,
          kind: 'headsup',
          prayer,
          date,
          fireAt: new Date(at),
          first: false,
          title: `${label} in ${headsUpMinutes} min`,
          body: 'Find a clean place to pray.',
        });
      }
    }

    const anchor = parseTime(anchors[askKey(date, prayer)]);
    const anchored = anchor !== null && anchor >= start.getTime();
    const base = anchored ? anchor : start.getTime();
    const asks: PlannedAsk[] = [];
    for (let k = anchored ? 1 : 0; ; k++) {
      const at = base + k * interval;
      if (at >= end.getTime()) break;
      if (at <= after) continue;
      asks.push({
        id: `ask-${date}-${prayer}-${at}`,
        kind: 'ask',
        prayer,
        date,
        fireAt: new Date(at),
        first: at === start.getTime(),
        title: `Time for ${label}`,
        body: 'Did you pray? Tap to answer.',
      });
    }
    if (asks.length > 0) {
      heads.push(asks[0]);
      extras.push(...asks.slice(1));
    }
  }

  // Every window keeps its next ask. The rest of the budget goes to the soonest repeats.
  const room = Math.max(0, budget - heads.length);
  const rest = extras.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime()).slice(0, room);
  return [...heads, ...rest].slice(0, budget).sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
}

export interface MissedPrayer {
  date: string;
  prayer: PrayerName;
}

// Prayers whose window ended with no mark at all, so the reminders ran out. Only prayers that began after `since` count,
// so the first days of using the app are not filled with misses.
export function prayersToMiss(
  timesOf: (day: Date) => DayTimes,
  from: Date,
  since: Date,
  marked: ReadonlySet<string>,
  daysBack: number,
): MissedPrayer[] {
  return prayerWindows(timesOf, from, -daysBack, 0, true)
    .filter(
      (w) => w.end.getTime() <= from.getTime() && w.start.getTime() >= since.getTime() && !marked.has(askKey(w.date, w.prayer)),
    )
    .map(({ date, prayer }) => ({ date, prayer }));
}
