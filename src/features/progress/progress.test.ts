import { PRAYER_NAMES, type PrayerName } from '@/features/prayer-times/calculate';
import type { PrayerState } from '@/features/prayer-times/schedule';
import { buildYear, countPrayed, type YearGrid } from './model';
import { buildSeedRows } from './seed';
import { computeStats, formatStreak } from './stats';

const todayStates = (state: PrayerState, overrides: Partial<Record<PrayerName, PrayerState>> = {}) =>
  ({ ...Object.fromEntries(PRAYER_NAMES.map((n) => [n, state])), ...overrides }) as Record<PrayerName, PrayerState>;

const all = (date: string): { date: string; prayer: PrayerName }[] => PRAYER_NAMES.map((prayer) => ({ date, prayer }));

const build = (
  entries: { date: string; prayer: PrayerName }[],
  todayKey = '2026-03-10',
  startKey = '2026-03-01',
  today = todayStates('upcoming'),
): YearGrid => buildYear({ year: 2026, entries, todayKey, todayStates: today, startKey });

describe('buildYear', () => {
  it('has 12 month rows with the right number of days', () => {
    const grid = build([]);
    expect(grid).toHaveLength(12);
    expect(grid.map((month) => month.length)).toEqual([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
    expect(grid[1][27].date).toBe('2026-02-28');
  });

  it('marks logged prayers prayed and the rest of a past day missed', () => {
    const cell = build([{ date: '2026-03-05', prayer: 'fajr' }])[2][4];
    expect(cell.date).toBe('2026-03-05');
    expect(cell.states).toEqual(['prayed', 'missed', 'missed', 'missed', 'missed']);
  });

  it('uses the live states for today and upcoming for later days', () => {
    const grid = build([], '2026-03-10', '2026-03-01', todayStates('upcoming', { fajr: 'prayed', dhuhr: 'missed' }));
    expect(grid[2][9].states).toEqual(['prayed', 'missed', 'upcoming', 'upcoming', 'upcoming']);
    expect(grid[2][10].states.every((s) => s === 'upcoming')).toBe(true);
  });

  it('marks days before the start as untracked', () => {
    const grid = build([]);
    expect(grid[0][0].states.every((s) => s === 'untracked')).toBe(true);
    expect(grid[2][0].states.every((s) => s === 'missed')).toBe(true);
  });

  it('counts prayed prayers in a cell', () => {
    expect(countPrayed(build(all('2026-03-05'))[2][4])).toBe(5);
  });
});

describe('computeStats', () => {
  it('returns null percent when nothing is tracked', () => {
    expect(computeStats(build([], '2026-03-10', '2026-12-31'))).toEqual({
      percentKept: null,
      prayed: 0,
      missed: 0,
      bestStreak: 0,
    });
  });

  it('computes prayed, missed and percent from past days and passed prayers today', () => {
    const entries = [...all('2026-03-01'), ...all('2026-03-02'), { date: '2026-03-03', prayer: 'fajr' as const }];
    const today = todayStates('upcoming', { fajr: 'prayed', dhuhr: 'missed' });
    const stats = computeStats(build(entries, '2026-03-10', '2026-03-01', today));
    // Days Mar 1-9 = 45 prayers, 11 prayed. Today adds 1 prayed and 1 missed.
    expect(stats.prayed).toBe(12);
    expect(stats.missed).toBe(34 + 1);
    expect(stats.percentKept).toBe(Math.round((12 / 47) * 100));
  });

  it('finds the best streak of fully prayed days', () => {
    const entries = [
      ...all('2026-03-01'),
      ...all('2026-03-02'),
      ...all('2026-03-04'),
      ...all('2026-03-05'),
      ...all('2026-03-06'),
    ];
    expect(computeStats(build(entries)).bestStreak).toBe(3);
  });

  it('does not count an unfinished today as a full day', () => {
    const entries = [...all('2026-03-08'), ...all('2026-03-09')];
    expect(computeStats(build(entries, '2026-03-10', '2026-03-01', todayStates('upcoming'))).bestStreak).toBe(2);
  });
});

describe('formatStreak', () => {
  it('pluralizes', () => {
    expect(formatStreak(1)).toBe('1 day');
    expect(formatStreak(7)).toBe('7 days');
  });
});

describe('buildSeedRows', () => {
  const today = new Date(2026, 9, 26, 12);

  it('only covers January 1 up to yesterday', () => {
    const rows = buildSeedRows(2026, today);
    expect(rows[0].date >= '2026-01-01').toBe(true);
    expect(rows.every((row) => row.date <= '2026-10-25')).toBe(true);
  });

  it('is deterministic and mostly prayed with some gaps', () => {
    const rows = buildSeedRows(2026, today);
    expect(buildSeedRows(2026, today)).toEqual(rows);
    const share = rows.length / (298 * 5);
    expect(share).toBeGreaterThan(0.75);
    expect(share).toBeLessThan(0.95);
  });
});
