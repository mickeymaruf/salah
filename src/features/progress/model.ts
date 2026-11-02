import { daysInMonth, toDateKey } from '@/shared/lib/date';
import { PRAYER_NAMES, type PrayerName } from '@/features/prayer-times/calculate';
import type { PrayerState } from '@/features/prayer-times/schedule';

// "untracked" is a day before the user started. It is drawn like upcoming and never counted.
export type CellState = PrayerState | 'untracked';

export interface DayCell {
  date: string;
  // Same order as PRAYER_NAMES: Fajr first.
  states: CellState[];
  // True where the prayer was logged by hand (no photo). Shown as an outlined check.
  manual: boolean[];
}

// Indexed [month 0-11][day 0-30]. A month row has only as many cells as the month has days.
export type YearGrid = DayCell[][];

interface BuildInput {
  year: number;
  entries: readonly { date: string; prayer: PrayerName; proofUri: string | null }[];
  todayKey: string;
  todayStates: Record<PrayerName, PrayerState>;
  startKey: string;
}

// Past days need no prayer times: whatever is not logged is missed. Only today needs the clock.
export function buildYear({ year, entries, todayKey, todayStates, startKey }: BuildInput): YearGrid {
  const prayedByDate = new Map<string, Set<PrayerName>>();
  const manualByDate = new Map<string, Set<PrayerName>>();
  for (const { date, prayer, proofUri } of entries) {
    const prayed = prayedByDate.get(date) ?? new Set<PrayerName>();
    prayed.add(prayer);
    prayedByDate.set(date, prayed);
    if (proofUri === null) {
      const manual = manualByDate.get(date) ?? new Set<PrayerName>();
      manual.add(prayer);
      manualByDate.set(date, manual);
    }
  }

  return Array.from({ length: 12 }, (_, month) =>
    Array.from({ length: daysInMonth(year, month) }, (_, index): DayCell => {
      const date = toDateKey(new Date(year, month, index + 1));
      const states = statesFor(date, prayedByDate.get(date), { todayKey, todayStates, startKey });
      const manual = PRAYER_NAMES.map((name, i) => states[i] === 'prayed' && (manualByDate.get(date)?.has(name) ?? false));
      return { date, states, manual };
    }),
  );
}

function statesFor(
  date: string,
  prayed: ReadonlySet<PrayerName> | undefined,
  ctx: Pick<BuildInput, 'todayKey' | 'todayStates' | 'startKey'>,
): CellState[] {
  if (date < ctx.startKey) return PRAYER_NAMES.map(() => 'untracked');
  if (date > ctx.todayKey) return PRAYER_NAMES.map(() => 'upcoming');
  if (date === ctx.todayKey) return PRAYER_NAMES.map((name) => ctx.todayStates[name]);
  return PRAYER_NAMES.map((name) => (prayed?.has(name) ? 'prayed' : 'missed'));
}

export function countPrayed(cell: DayCell): number {
  return cell.states.filter((state) => state === 'prayed').length;
}
