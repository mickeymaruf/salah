import {
  addDays,
  daysInMonth,
  formatCountdown,
  formatLongDate,
  formatShortDate,
  formatTime,
  now,
  parseDateKey,
  resetClock,
  setClock,
  todayKey,
  toDateKey,
} from './date';

afterEach(resetClock);

describe('date keys', () => {
  it('formats the local calendar date with zero padding', () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('round-trips through parseDateKey', () => {
    expect(toDateKey(parseDateKey('2026-10-26'))).toBe('2026-10-26');
  });

  it('uses the injected clock for today', () => {
    setClock(() => new Date(2026, 9, 26, 15, 0));
    expect(todayKey()).toBe('2026-10-26');
    expect(now().getHours()).toBe(15);
  });
});

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(toDateKey(addDays(new Date(2026, 11, 31), 1))).toBe('2027-01-01');
    expect(toDateKey(addDays(new Date(2026, 2, 1), -1))).toBe('2026-02-28');
  });
});

describe('daysInMonth', () => {
  it('handles leap years', () => {
    expect(daysInMonth(2024, 1)).toBe(29);
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2026, 9)).toBe(31);
  });
});

describe('formatting', () => {
  it('formats 12-hour times', () => {
    expect(formatTime(new Date(2026, 0, 1, 0, 5))).toBe('12:05 AM');
    expect(formatTime(new Date(2026, 0, 1, 12, 2))).toBe('12:02 PM');
    expect(formatTime(new Date(2026, 0, 1, 15, 42))).toBe('3:42 PM');
  });

  it('formats dates', () => {
    expect(formatLongDate(new Date(2026, 9, 26))).toBe('Monday, 26 October');
    expect(formatShortDate(new Date(2026, 9, 23))).toBe('Fri, 23 Oct');
  });

  it('formats countdowns, rounding up to the next minute', () => {
    expect(formatCountdown(72 * 60000)).toBe('in 1h 12m');
    expect(formatCountdown(59 * 1000)).toBe('in 1m');
    expect(formatCountdown(5 * 60000)).toBe('in 5m');
    expect(formatCountdown(-1000)).toBe('in 0m');
  });
});
