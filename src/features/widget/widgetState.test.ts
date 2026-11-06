import type { DayTimes, PrayerName } from '@/features/prayer-times/calculate';
import type { Outcome } from '@/features/prayer-times/data/prayerLog';
import { buildWidgetState, nextRefreshAt, widgetQueue } from './widgetState';

function times(day: number): DayTimes {
  const at = (hour: number, minute: number) => new Date(2026, 9, day, hour, minute);
  return { fajr: at(4, 48), dhuhr: at(12, 2), asr: at(15, 42), maghrib: at(17, 21), isha: at(18, 40) };
}

const today = times(26);
const tomorrow = times(27);

function outcomes(entries: Partial<Record<PrayerName, Outcome>>): ReadonlyMap<PrayerName, Outcome> {
  return new Map(Object.entries(entries) as [PrayerName, Outcome][]);
}

const build = (at: Date, marked: Partial<Record<PrayerName, Outcome>>) =>
  buildWidgetState({ at, today, tomorrow, outcomes: outcomes(marked) });

describe('widget queue', () => {
  it('lists passed, unmarked prayers oldest first', () => {
    expect(widgetQueue(today, outcomes({ dhuhr: 'prayed' }), new Date(2026, 9, 26, 16, 0))).toEqual(['fajr', 'asr']);
  });

  it('counts a prayer whose time is exactly now as passed', () => {
    expect(widgetQueue(today, outcomes({}), new Date(2026, 9, 26, 4, 48))).toEqual(['fajr']);
  });

  it('is empty before Fajr', () => {
    expect(widgetQueue(today, outcomes({}), new Date(2026, 9, 26, 3, 0))).toEqual([]);
  });
});

describe('widget state', () => {
  it('asks about the oldest unmarked prayer', () => {
    const { card, counter } = build(new Date(2026, 9, 26, 13, 0), {});
    expect(card).toMatchObject({ mode: 'question', prayer: 'fajr', dayKey: '2026-10-26', lead: 'Did you pray', name: 'Fajr?', time: '4:48 AM', countdown: '' });
    expect(counter).toBe('0 of 5');
  });

  it('moves to the next unanswered prayer after an answer and updates the counter', () => {
    const { card, counter } = build(new Date(2026, 9, 26, 13, 0), { fajr: 'missed' });
    expect(card).toMatchObject({ mode: 'question', prayer: 'dhuhr', name: 'Dhuhr?', time: '12:02 PM' });
    expect(counter).toBe('1 of 5');
  });

  it('shows the next prayer with a countdown when everything passed is marked', () => {
    const { card, counter } = build(new Date(2026, 9, 26, 14, 30), { fajr: 'prayed', dhuhr: 'prayed' });
    expect(card).toMatchObject({ mode: 'next', prayer: 'asr', dayKey: '2026-10-26', lead: 'Next prayer', name: 'Asr', time: '3:42 PM', countdown: 'in 1h 12m' });
    expect(counter).toBe('2 of 5');
  });

  it('shows Fajr before dawn on a fresh day', () => {
    const { card } = build(new Date(2026, 9, 26, 3, 0), {});
    expect(card).toMatchObject({ mode: 'next', prayer: 'fajr', time: '4:48 AM', countdown: 'in 1h 48m' });
  });

  it('skips an upcoming prayer the user marked early', () => {
    const { card } = build(new Date(2026, 9, 26, 14, 30), { fajr: 'prayed', dhuhr: 'prayed', asr: 'prayed' });
    expect(card).toMatchObject({ mode: 'next', prayer: 'maghrib' });
  });

  it("shows tomorrow's Fajr when all five are marked", () => {
    const all = { fajr: 'prayed', dhuhr: 'prayed', asr: 'missed', maghrib: 'prayed', isha: 'prayed' } as const;
    const { card, counter } = build(new Date(2026, 9, 26, 21, 0), all);
    expect(card).toMatchObject({ mode: 'next', prayer: 'fajr', dayKey: '2026-10-27', name: 'Fajr', time: '4:48 AM', countdown: 'in 7h 48m' });
    expect(counter).toBe('5 of 5');
  });
});

describe('widget refresh time', () => {
  it('refreshes at the next prayer when a question is on show', () => {
    const at = new Date(2026, 9, 26, 13, 0);
    const state = build(at, {});
    expect(nextRefreshAt(state, today, tomorrow, at)).toEqual(today.asr);
  });

  it('refreshes every minute while a countdown is on show', () => {
    const at = new Date(2026, 9, 26, 14, 30, 20);
    const state = build(at, { fajr: 'prayed', dhuhr: 'prayed' });
    expect(nextRefreshAt(state, today, tomorrow, at)).toEqual(new Date(2026, 9, 26, 14, 31, 0));
  });

  it('refreshes at the prayer time when it is closer than the next minute', () => {
    const at = new Date(2026, 9, 26, 15, 41, 30);
    const state = build(at, { fajr: 'prayed', dhuhr: 'prayed' });
    expect(nextRefreshAt(state, today, tomorrow, at)).toEqual(today.asr);
  });
});
