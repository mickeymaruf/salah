import { daysInMonth, toDateKey } from '@/shared/lib/date';
import { PRAYER_NAMES, type PrayerName } from '@/features/prayer-times/calculate';
import type { Outcome } from '@/features/prayer-times/data/prayerLog';
import type { PrayerState } from '@/features/prayer-times/schedule';

// "untracked" is a day before the user started. It is drawn like upcoming and never counted.
export type CellState = PrayerState | 'untracked';

export interface DayCell {
  date: string;
  // Same order as PRAYER_NAMES: Fajr first.
  states: CellState[];
}

// Indexed [month 0-11][day 0-30]. A month row has only as many cells as the month has days.
export type YearGrid = DayCell[][];

interface BuildInput {
  year: number;
  entries: readonly { date: string; prayer: PrayerName; outcome: Outcome }[];
  todayKey: string;
  todayStates: Record<PrayerName, PrayerState>;
  startKey: string;
}

// Past days need no prayer times: a prayer is what the user chose, or unmarked. Only today needs the clock.
export function buildYear({ year, entries, todayKey, todayStates, startKey }: BuildInput): YearGrid {
  const outcomesByDate = new Map<string, Map<PrayerName, Outcome>>();
  for (const { date, prayer, outcome } of entries) {
    const outcomes = outcomesByDate.get(date) ?? new Map<PrayerName, Outcome>();
    outcomes.set(prayer, outcome);
    outcomesByDate.set(date, outcomes);
  }

  return Array.from({ length: 12 }, (_, month) =>
    Array.from({ length: daysInMonth(year, month) }, (_, index): DayCell => {
      const date = toDateKey(new Date(year, month, index + 1));
      return { date, states: statesFor(date, outcomesByDate.get(date), { todayKey, todayStates, startKey }) };
    }),
  );
}

function statesFor(
  date: string,
  outcomes: ReadonlyMap<PrayerName, Outcome> | undefined,
  ctx: Pick<BuildInput, 'todayKey' | 'todayStates' | 'startKey'>,
): CellState[] {
  if (date < ctx.startKey) return PRAYER_NAMES.map(() => 'untracked');
  if (date > ctx.todayKey) return PRAYER_NAMES.map(() => 'upcoming');
  if (date === ctx.todayKey) return PRAYER_NAMES.map((name) => ctx.todayStates[name]);
  return PRAYER_NAMES.map((name) => outcomes?.get(name) ?? 'unmarked');
}

export function countPrayed(cell: DayCell): number {
  return cell.states.filter((state) => state === 'prayed').length;
}

// The day before (-1) or after (+1) `date` within the year, or null at either end of the year.
export function adjacentDate(grid: YearGrid, date: string, delta: -1 | 1): string | null {
  const dates = grid.flat().map((cell) => cell.date);
  const index = dates.indexOf(date);
  return index < 0 ? null : (dates[index + delta] ?? null);
}
