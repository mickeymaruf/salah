import type { DayTimes } from '@/features/prayer-times/calculate';
import { askedLine, formatAgo, nextLine } from './askView';

const at = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute);
const timesOf = (day: Date): DayTimes => {
  const d = day.getDate();
  return { fajr: at(d, 5), dhuhr: at(d, 12), asr: at(d, 15, 42), maghrib: at(d, 17, 21), isha: at(d, 19) };
};

describe('askedLine', () => {
  it('says when the first ask was and how long ago', () => {
    expect(askedLine(at(10, 15, 42), at(10, 15, 52))).toBe('Asked at 3:42 PM · 10 min ago');
    expect(askedLine(at(10, 15, 42), at(10, 16, 12))).toBe('Asked at 3:42 PM · 30 min ago');
  });

  it('switches to hours', () => {
    expect(formatAgo(60)).toBe('1 h ago');
    expect(formatAgo(75)).toBe('1 h 15 min ago');
  });
});

describe('nextLine', () => {
  it('names the next prayer and its time', () => {
    expect(nextLine('asr', at(10, 15, 42), timesOf)).toBe('Next: Maghrib at 5:21 PM');
  });

  it('goes to tomorrow’s Fajr after Isha', () => {
    expect(nextLine('isha', at(10, 19, 0), timesOf)).toBe('Next: Fajr at 5:00 AM');
  });
});
