import type { DayTimes } from './calculate';
import { lastReachedIndex, timelineKinds } from './timeline';

const times: DayTimes = {
  fajr: new Date(2026, 9, 26, 4, 48),
  dhuhr: new Date(2026, 9, 26, 12, 2),
  asr: new Date(2026, 9, 26, 15, 42),
  maghrib: new Date(2026, 9, 26, 17, 21),
  isha: new Date(2026, 9, 26, 18, 40),
};
const at = (h: number) => new Date(2026, 9, 26, h);

describe('timeline', () => {
  it('marks passed, current and upcoming prayers', () => {
    const kinds = timelineKinds(times, at(16), 'asr');
    expect(kinds).toEqual({ fajr: 'passed', dhuhr: 'passed', asr: 'current', maghrib: 'upcoming', isha: 'upcoming' });
    expect(lastReachedIndex(kinds)).toBe(2);
  });

  it('has no current prayer on another day', () => {
    const kinds = timelineKinds(times, at(23), null);
    expect(Object.values(kinds).every((kind) => kind === 'passed')).toBe(true);
    expect(lastReachedIndex(kinds)).toBe(4);
  });

  it('reaches nothing before Fajr', () => {
    expect(lastReachedIndex(timelineKinds(times, at(2), null))).toBe(-1);
  });
});
