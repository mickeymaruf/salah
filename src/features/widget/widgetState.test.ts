import type { DayTimes, PrayerName } from '@/features/prayer-times/calculate';
import type { Outcome } from '@/features/prayer-times/data/prayerLog';
import { answerTarget, buildWidgetState, nextRefreshAt, parseAnswerTarget, widgetQueue } from './widgetState';

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
  it('queues every unmarked passed prayer, oldest first', () => {
    const { queue } = build(new Date(2026, 9, 26, 13, 0), {});
    expect(queue.map((card) => card.prayer)).toEqual(['fajr', 'dhuhr']);
    expect(queue[0]).toMatchObject({ mode: 'question', prayer: 'fajr', dayKey: '2026-10-26', lead: 'Did you pray', name: 'Fajr?', time: '4:48 AM', countdown: '' });
  });

  it('drops a marked prayer from the queue', () => {
    const { queue } = build(new Date(2026, 9, 26, 13, 0), { fajr: 'missed' });
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({ prayer: 'dhuhr', name: 'Dhuhr?', time: '12:02 PM' });
  });

  it('keeps the next prayer ready behind the questions, with a countdown', () => {
    const { queue, next } = build(new Date(2026, 9, 26, 13, 0), {});
    expect(queue).toHaveLength(2);
    expect(next).toMatchObject({ mode: 'next', prayer: 'asr', dayKey: '2026-10-26', lead: 'Next prayer', name: 'Asr', time: '3:42 PM', countdown: 'in 2h 42m', targets: null });
  });

  it('has an empty queue when everything passed is marked', () => {
    const { queue, next } = build(new Date(2026, 9, 26, 14, 30), { fajr: 'prayed', dhuhr: 'prayed' });
    expect(queue).toEqual([]);
    expect(next).toMatchObject({ mode: 'next', prayer: 'asr', time: '3:42 PM', countdown: 'in 1h 12m' });
  });

  it('shows Fajr before dawn on a fresh day', () => {
    const { queue, next } = build(new Date(2026, 9, 26, 3, 0), {});
    expect(queue).toEqual([]);
    expect(next).toMatchObject({ mode: 'next', prayer: 'fajr', time: '4:48 AM', countdown: 'in 1h 48m' });
  });

  it('skips an upcoming prayer the user marked early', () => {
    const { next } = build(new Date(2026, 9, 26, 14, 30), { fajr: 'prayed', dhuhr: 'prayed', asr: 'prayed' });
    expect(next).toMatchObject({ mode: 'next', prayer: 'maghrib' });
  });

  it("shows tomorrow's Fajr when all five are marked", () => {
    const all = { fajr: 'prayed', dhuhr: 'prayed', asr: 'missed', maghrib: 'prayed', isha: 'prayed' } as const;
    const { queue, next } = build(new Date(2026, 9, 26, 21, 0), all);
    expect(queue).toEqual([]);
    expect(next).toMatchObject({ mode: 'next', prayer: 'fajr', dayKey: '2026-10-27', name: 'Fajr', time: '4:48 AM', countdown: 'in 7h 48m' });
  });
});

describe('widget answer target', () => {
  it('carries the choice, the day and the prayer', () => {
    const { queue } = build(new Date(2026, 9, 26, 13, 0), {});
    expect(answerTarget('missed', '2026-10-26', 'fajr')).toBe('missed:2026-10-26:fajr');
    expect(queue[0].targets).toEqual({ missed: 'missed:2026-10-26:fajr', prayed: 'prayed:2026-10-26:fajr' });
  });

  it('reads a target back', () => {
    expect(parseAnswerTarget('prayed:2026-10-26:asr')).toEqual({ choice: 'prayed', dayKey: '2026-10-26', prayer: 'asr' });
  });

  it('refuses a target it does not know', () => {
    expect(parseAnswerTarget('maybe:2026-10-26:asr')).toBeNull();
    expect(parseAnswerTarget('missed:2026-10-26:duha')).toBeNull();
    expect(parseAnswerTarget('missed')).toBeNull();
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
