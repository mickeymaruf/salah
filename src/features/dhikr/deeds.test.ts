import type { DhikrEntry } from './config';
import { allTimeDeeds, countForKey, dayKeysEnding, deedsForDay, deedsForMonth, lastDays, recitationDeeds, sum, todayLine, type DhikrRow } from './deeds';

const table: DhikrEntry[] = [
  { key: 'durood', arabic: '', name: '', meaning: '', deedValue: 10, source: '', verified: true },
  { key: 'subhanallah', arabic: '', name: '', meaning: '', deedValue: 3, source: '', verified: false },
  { key: 'alhamdulillah', arabic: '', name: '', meaning: '', deedValue: null, source: '', verified: true },
];

const rows: DhikrRow[] = [
  { key: 'durood', day: '2026-10-26', count: 10 },
  { key: 'subhanallah', day: '2026-10-26', count: 33 },
  { key: 'alhamdulillah', day: '2026-10-26', count: 4 },
  { key: 'durood', day: '2026-10-25', count: 2 },
  { key: 'durood', day: '2026-09-30', count: 5 },
];

describe('recitationDeeds', () => {
  it('uses a verified value', () => {
    expect(recitationDeeds(table[0])).toBe(10);
  });

  it('adds 1 when the value is not verified, missing, not positive or the dhikr is unknown', () => {
    expect(recitationDeeds(table[1])).toBe(1);
    expect(recitationDeeds(table[2])).toBe(1);
    expect(recitationDeeds({ deedValue: 0, verified: true })).toBe(1);
    expect(recitationDeeds(undefined)).toBe(1);
  });
});

describe('deeds', () => {
  it('multiplies recitations by the deed value for a day', () => {
    expect(deedsForDay(rows, '2026-10-26', table)).toBe(10 * 10 + 33 + 4);
    expect(deedsForDay(rows, '2026-10-20', table)).toBe(0);
  });

  it('gives one value per day of the month, empty days as 0', () => {
    const month = deedsForMonth(rows, 2026, 9, table);
    expect(month).toHaveLength(31);
    expect(month[25]).toBe(137);
    expect(month[24]).toBe(20);
    expect(month[0]).toBe(0);
    expect(month.reduce((a, b) => a + b, 0)).toBe(157);
  });

  it('sizes the month by its days, including February in a leap year', () => {
    expect(deedsForMonth([], 2028, 1, table)).toHaveLength(29);
    expect(deedsForMonth([], 2026, 1, table)).toHaveLength(28);
    expect(deedsForMonth([], 2026, 8, table)).toHaveLength(30);
  });

  it('sums everything ever counted for the all-time total', () => {
    expect(allTimeDeeds([{ key: 'durood', count: 100 }, { key: 'subhanallah', count: 50 }, { key: 'unknown', count: 7 }], table)).toBe(1000 + 50 + 7);
    expect(allTimeDeeds([], table)).toBe(0);
  });

  it('lists the last days oldest first, today last, across a month boundary', () => {
    expect(dayKeysEnding('2026-10-02', 4)).toEqual(['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02']);
    expect(lastDays(rows, '2026-10-26', 3, table)).toEqual([0, 20, 137]);
    expect(lastDays(rows, '2026-10-26', 7, table)).toHaveLength(7);
  });

  it('counts one dhikr on one day', () => {
    expect(countForKey(rows, 'subhanallah', '2026-10-26')).toBe(33);
    expect(countForKey(rows, 'subhanallah', '2026-10-25')).toBe(0);
  });

  it('adds up values', () => {
    expect(sum([1, 2, 3])).toBe(6);
    expect(sum([])).toBe(0);
  });

  it('describes a dhikr for today', () => {
    expect(todayLine(0)).toBe('Not yet today');
    expect(todayLine(10)).toBe('10 today');
  });
});
