import { PRAYER_NAMES, type PrayerName } from '@/features/prayer-times/calculate';
import type { PrayerState } from '@/features/prayer-times/schedule';
import { adjacentDate, buildYear, countPrayed, type YearGrid } from './model';
import { computeStats, formatStreak } from './stats';

const todayStates = (state: PrayerState, overrides: Partial<Record<PrayerName, PrayerState>> = {}) =>
  ({ ...Object.fromEntries(PRAYER_NAMES.map((n) => [n, state])), ...overrides }) as Record<PrayerName, PrayerState>;

const all = (date: string) => PRAYER_NAMES.map((prayer) => ({ date, prayer, outcome: 'prayed' as const }));

const build = (
  entries: { date: string; prayer: PrayerName; outcome: 'prayed' | 'missed' }[],
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

  it('shows what was chosen and leaves the rest of a past day unmarked', () => {
    const cell = build([
      { date: '2026-03-05', prayer: 'fajr', outcome: 'prayed' },
      { date: '2026-03-05', prayer: 'dhuhr', outcome: 'missed' },
    ])[2][4];
    expect(cell.date).toBe('2026-03-05');
    expect(cell.states).toEqual(['prayed', 'missed', 'unmarked', 'unmarked', 'unmarked']);
  });

  it('uses the live states for today and upcoming for later days', () => {
    const grid = build([], '2026-03-10', '2026-03-01', todayStates('upcoming', { fajr: 'prayed', dhuhr: 'missed' }));
    expect(grid[2][9].states).toEqual(['prayed', 'missed', 'upcoming', 'upcoming', 'upcoming']);
    expect(grid[2][10].states.every((s) => s === 'upcoming')).toBe(true);
  });

  it('marks days before the start as untracked', () => {
    const grid = build([]);
    expect(grid[0][0].states.every((s) => s === 'untracked')).toBe(true);
    expect(grid[2][0].states.every((s) => s === 'unmarked')).toBe(true);
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

  it('counts only what the user chose; unmarked prayers are not missed', () => {
    const entries = [
      ...all('2026-03-01'),
      ...all('2026-03-02'),
      { date: '2026-03-03', prayer: 'fajr' as const, outcome: 'prayed' as const },
      { date: '2026-03-03', prayer: 'dhuhr' as const, outcome: 'missed' as const },
    ];
    const today = todayStates('upcoming', { fajr: 'prayed', dhuhr: 'missed', asr: 'unmarked' });
    const stats = computeStats(build(entries, '2026-03-10', '2026-03-01', today));
    // Mar 1-2 = 10 prayed, Mar 3 adds 1 prayed and 1 missed, today adds 1 prayed and 1 missed.
    expect(stats.prayed).toBe(12);
    expect(stats.missed).toBe(2);
    expect(stats.percentKept).toBe(Math.round((12 / 14) * 100));
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

describe('adjacentDate', () => {
  const grid = build([]);

  it('steps by one day, across month ends', () => {
    expect(adjacentDate(grid, '2026-03-10', 1)).toBe('2026-03-11');
    expect(adjacentDate(grid, '2026-03-10', -1)).toBe('2026-03-09');
    expect(adjacentDate(grid, '2026-02-28', 1)).toBe('2026-03-01');
    expect(adjacentDate(grid, '2026-03-01', -1)).toBe('2026-02-28');
  });

  it('stops at the first and last day of the year', () => {
    expect(adjacentDate(grid, '2026-01-01', -1)).toBeNull();
    expect(adjacentDate(grid, '2026-12-31', 1)).toBeNull();
  });

  it('returns null for a date outside the year', () => {
    expect(adjacentDate(grid, '2025-12-31', 1)).toBeNull();
  });
});
