import { addDays, parseDateKey, toDateKey } from '@/shared/lib/date';
import { PRAYER_NAMES, type DayTimes, type PrayerName } from '../prayer-times/calculate';
import type { PrayerState } from '../prayer-times/schedule';
import { computeTreeProgress, todayStanding, windowsEnded, type TodayStanding } from './treeProgress';

const TODAY = '2026-11-07';
const ALL = (state: PrayerState) =>
  Object.fromEntries(PRAYER_NAMES.map((name) => [name, state])) as Record<PrayerName, PrayerState>;

function perfectDays(count: number, startOffset = 1) {
  const entries: { date: string; prayer: PrayerName; outcome: 'prayed' }[] = [];
  for (let i = 0; i < count; i++) {
    const date = toDateKey(addDays(parseDateKey(TODAY), -(startOffset + i)));
    for (const prayer of PRAYER_NAMES) entries.push({ date, prayer, outcome: 'prayed' });
  }
  return entries;
}

const open = (prayed: number): TodayStanding => ({ prayed, broken: false });

describe('computeTreeProgress', () => {
  it('is a bare tree with nothing logged', () => {
    const p = computeTreeProgress({ todayKey: TODAY, entries: [], today: open(0) });
    expect(p).toMatchObject({ perfectDays: 0, fullness: 0, streak: 0, daysToGo: 40, percent: 0, full: false });
  });

  it('counts today as prayed / 5 while it is open', () => {
    const p = computeTreeProgress({ todayKey: TODAY, entries: perfectDays(10), today: open(2) });
    expect(p.perfectDays).toBe(10);
    expect(p.todayFraction).toBeCloseTo(0.4);
    expect(p.fullness).toBeCloseTo(10.4 / 40);
    expect(p.streak).toBe(10);
  });

  it('counts today as a full day and in the streak once all five are prayed', () => {
    const p = computeTreeProgress({ todayKey: TODAY, entries: perfectDays(3), today: open(5) });
    expect(p).toMatchObject({ perfectDays: 4, todayFraction: 0, streak: 4, daysToGo: 36 });
    expect(p.fullness).toBeCloseTo(0.1);
  });

  it('drops today share and resets the streak when a prayer was missed', () => {
    const p = computeTreeProgress({ todayKey: TODAY, entries: perfectDays(7), today: { prayed: 2, broken: true } });
    expect(p.todayFraction).toBe(0);
    expect(p.fullness).toBeCloseTo(7 / 40);
    expect(p.streak).toBe(7);
  });

  it('is full at 40 perfect days and keeps counting a longer streak', () => {
    const p = computeTreeProgress({ todayKey: TODAY, entries: perfectDays(50), today: open(0) });
    expect(p.perfectDays).toBe(39);
    expect(p.streak).toBe(50);
    const withToday = computeTreeProgress({ todayKey: TODAY, entries: perfectDays(50), today: open(5) });
    expect(withToday).toMatchObject({ perfectDays: 40, fullness: 1, daysToGo: 0, full: true, percent: 100 });
    expect(withToday.streak).toBe(51);
  });

  it('only looks at the last 40 days for perfect days', () => {
    const p = computeTreeProgress({ todayKey: TODAY, entries: perfectDays(5, 40), today: open(0) });
    expect(p.perfectDays).toBe(0);
  });

  it('does not count a day with a missed prayer and ends the streak there', () => {
    const entries = [...perfectDays(2), ...perfectDays(3, 4)];
    const p = computeTreeProgress({ todayKey: TODAY, entries, today: open(0) });
    expect(p.perfectDays).toBe(5);
    expect(p.streak).toBe(2);
  });

  it('ignores missed rows', () => {
    const entries = perfectDays(1).map((e, i) => (i === 0 ? { ...e, outcome: 'missed' as never } : e));
    expect(computeTreeProgress({ todayKey: TODAY, entries, today: open(0) }).perfectDays).toBe(0);
  });
});

describe('todayStanding and windowsEnded', () => {
  const at = (h: number, m = 0) => new Date(2026, 10, 7, h, m);
  const times: DayTimes = { fajr: at(5), dhuhr: at(12), asr: at(15), maghrib: at(17), isha: at(18, 30) };
  const tomorrowFajr = new Date(2026, 10, 8, 5);

  it('ends a window when the next prayer starts', () => {
    const ended = windowsEnded(times, tomorrowFajr, at(12, 30));
    expect(ended).toEqual({ fajr: true, dhuhr: false, asr: false, maghrib: false, isha: false });
  });

  it('ends Isha at tomorrow Fajr', () => {
    expect(windowsEnded(times, tomorrowFajr, at(23)).isha).toBe(false);
    expect(windowsEnded(times, tomorrowFajr, new Date(2026, 10, 8, 5)).isha).toBe(true);
  });

  it('does not break today for an unmarked prayer whose window is still open', () => {
    const states = { ...ALL('upcoming'), fajr: 'prayed', dhuhr: 'unmarked' } as Record<PrayerName, PrayerState>;
    const ended = windowsEnded(times, tomorrowFajr, at(13));
    expect(todayStanding(states, ended)).toEqual({ prayed: 1, broken: false });
  });

  it('breaks today for an unmarked prayer whose window ended, or a missed one', () => {
    const ended = windowsEnded(times, tomorrowFajr, at(13));
    const unmarked = { ...ALL('upcoming'), fajr: 'unmarked' } as Record<PrayerName, PrayerState>;
    expect(todayStanding(unmarked, ended).broken).toBe(true);
    const missed = { ...ALL('upcoming'), isha: 'missed' } as Record<PrayerName, PrayerState>;
    expect(todayStanding(missed, ended).broken).toBe(true);
  });
});
