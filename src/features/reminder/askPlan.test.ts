import type { DayTimes } from '@/features/prayer-times/calculate';
import { askKey, planAsks, prayersToMiss } from './askPlan';

const at = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute);
const timesOf = (day: Date): DayTimes => {
  const d = day.getDate();
  return { fajr: at(d, 5), dhuhr: at(d, 12), asr: at(d, 15, 42), maghrib: at(d, 17, 21), isha: at(d, 19) };
};

const base = {
  timesOf,
  daysAhead: 1,
  prayed: new Set<string>(),
  anchors: {},
  stopsAtNextPrayer: true,
  headsUpMinutes: 0,
  budget: 500,
};

describe('planAsks', () => {
  it('asks at the prayer time and every 10 minutes until the next prayer begins', () => {
    const plan = planAsks({ ...base, from: at(10, 15, 0) }).filter((a) => a.prayer === 'asr' && a.date === '2026-11-10');
    expect(plan[0].fireAt).toEqual(at(10, 15, 42));
    expect(plan[0].first).toBe(true);
    expect(plan[1].fireAt).toEqual(at(10, 15, 52));
    expect(plan[1].first).toBe(false);
    expect(plan[plan.length - 1].fireAt).toEqual(at(10, 17, 12));
    expect(plan.every((a) => a.fireAt.getTime() < at(10, 17, 21).getTime())).toBe(true);
  });

  it('keeps asking on the same 10 minute grid when the app opens mid-window', () => {
    const plan = planAsks({ ...base, from: at(10, 16, 5) }).filter((a) => a.prayer === 'asr' && a.date === '2026-11-10');
    expect(plan[0].fireAt).toEqual(at(10, 16, 12));
  });

  it('moves the next ask to ten minutes after the last answer', () => {
    const anchors = { [askKey('2026-11-10', 'asr')]: at(10, 16, 7).toISOString() };
    const plan = planAsks({ ...base, anchors, from: at(10, 16, 7) }).filter((a) => a.prayer === 'asr' && a.date === '2026-11-10');
    expect(plan[0].fireAt).toEqual(at(10, 16, 17));
    expect(plan[1].fireAt).toEqual(at(10, 16, 27));
  });

  it('ignores an answer that belongs to an earlier window', () => {
    const anchors = { [askKey('2026-11-10', 'asr')]: at(10, 14, 0).toISOString() };
    const plan = planAsks({ ...base, anchors, from: at(10, 15, 0) }).filter((a) => a.prayer === 'asr' && a.date === '2026-11-10');
    expect(plan[0].fireAt).toEqual(at(10, 15, 42));
  });

  it('plans nothing for a prayer already marked prayed', () => {
    const prayed = new Set([askKey('2026-11-10', 'asr')]);
    const plan = planAsks({ ...base, prayed, from: at(10, 15, 0) });
    expect(plan.some((a) => a.prayer === 'asr' && a.date === '2026-11-10')).toBe(false);
  });

  it('runs Isha until the next Fajr and keeps asking after midnight', () => {
    const plan = planAsks({ ...base, from: at(10, 23, 55) }).filter((a) => a.prayer === 'isha' && a.date === '2026-11-10');
    expect(plan[0].fireAt).toEqual(at(11, 0, 0));
    expect(plan[plan.length - 1].fireAt).toEqual(at(11, 4, 50));
  });

  it('keeps each window its next ask when the budget is small, then fills with the soonest repeats', () => {
    const plan = planAsks({ ...base, daysAhead: 2, from: at(10, 6, 0), budget: 12 });
    expect(plan).toHaveLength(12);
    const windows = new Set(plan.map((a) => `${a.date}:${a.prayer}`));
    expect(windows.size).toBe(10);
  });

  it('stops after a fixed time when it does not stop at the next prayer', () => {
    const plan = planAsks({ ...base, stopsAtNextPrayer: false, from: at(10, 18, 0) }).filter(
      (a) => a.prayer === 'asr' && a.date === '2026-11-10',
    );
    expect(plan.length).toBeGreaterThan(12);
  });

  it('adds a silent heads-up before each prayer when asked', () => {
    const plan = planAsks({ ...base, headsUpMinutes: 10, from: at(10, 15, 0) });
    const headsUp = plan.find((a) => a.kind === 'headsup' && a.prayer === 'asr' && a.date === '2026-11-10');
    expect(headsUp?.fireAt).toEqual(at(10, 15, 32));
  });

  it('gives every ask a unique id', () => {
    const plan = planAsks({ ...base, daysAhead: 2, from: at(10, 0, 0) });
    expect(new Set(plan.map((a) => a.id)).size).toBe(plan.length);
  });
});

describe('prayersToMiss', () => {
  const since = at(9, 0);

  it('lists prayers whose window ended with no mark at all', () => {
    const marked = new Set([askKey('2026-11-10', 'fajr')]);
    const missed = prayersToMiss(timesOf, at(10, 16, 0), since, marked, 2);
    expect(missed).toContainEqual({ date: '2026-11-10', prayer: 'dhuhr' });
    expect(missed).not.toContainEqual({ date: '2026-11-10', prayer: 'fajr' });
  });

  it('leaves the prayer in progress and later ones alone', () => {
    const missed = prayersToMiss(timesOf, at(10, 16, 0), since, new Set(), 2);
    expect(missed).not.toContainEqual({ date: '2026-11-10', prayer: 'asr' });
    expect(missed).not.toContainEqual({ date: '2026-11-10', prayer: 'maghrib' });
  });

  it('never goes back past the time the reminders first ran', () => {
    const missed = prayersToMiss(timesOf, at(10, 16, 0), at(10, 11, 0), new Set(), 2);
    expect(missed).toEqual([{ date: '2026-11-10', prayer: 'dhuhr' }]);
  });

  it('does not touch prayers that were marked missed or prayed', () => {
    const marked = new Set([askKey('2026-11-10', 'dhuhr'), askKey('2026-11-10', 'fajr')]);
    expect(prayersToMiss(timesOf, at(10, 16, 0), at(10, 0, 0), marked, 2)).toEqual([]);
  });
});
