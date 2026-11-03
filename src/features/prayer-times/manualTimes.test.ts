import type { DayTimes } from './calculate';
import { clockOf, findOrderProblem, placeChanged, toClock, withClock } from './manualTimes';

const at = (hour: number, minute: number) => new Date(2026, 9, 26, hour, minute);
const automatic: DayTimes = {
  fajr: at(4, 48),
  dhuhr: at(12, 2),
  asr: at(16, 0),
  maghrib: at(17, 21),
  isha: at(18, 40),
};

describe('findOrderProblem', () => {
  it('accepts automatic times and sensible edits', () => {
    expect(findOrderProblem(automatic, {})).toBeNull();
    expect(findOrderProblem(automatic, { fajr: '04:30', isha: '21:00' })).toBeNull();
  });

  it('reports the first pair that is out of order', () => {
    expect(findOrderProblem(automatic, { fajr: '13:00' })).toEqual({ earlier: 'fajr', later: 'dhuhr' });
    expect(findOrderProblem(automatic, { maghrib: '03:00' })).toEqual({ earlier: 'asr', later: 'maghrib' });
  });

  it('ignores out-of-order calculated times when nothing nearby was edited', () => {
    const shifted: DayTimes = { ...automatic, fajr: at(22, 0) };
    expect(findOrderProblem(shifted, { isha: '19:00' })).toBeNull();
  });

  it('rejects two prayers at the same minute', () => {
    expect(findOrderProblem(automatic, { dhuhr: clockOf(automatic.asr) })).toEqual({ earlier: 'dhuhr', later: 'asr' });
  });
});

describe('withClock', () => {
  it('stores an edit and removes it again when set back to the calculated minute', () => {
    const edited = withClock({}, 'asr', '16:30', automatic);
    expect(edited).toEqual({ asr: '16:30' });
    expect(withClock(edited, 'asr', clockOf(automatic.asr), automatic)).toEqual({});
  });

  it('does not change the object it was given', () => {
    const before = { fajr: '04:50' };
    withClock(before, 'isha', '20:00', automatic);
    expect(before).toEqual({ fajr: '04:50' });
  });
});

describe('helpers', () => {
  it('pads clocks', () => {
    expect(toClock(4, 5)).toBe('04:05');
  });

  it('treats a different city or country as a new place', () => {
    const here = { city: 'Dhaka', country: 'Bangladesh' };
    expect(placeChanged(here, { ...here })).toBe(false);
    expect(placeChanged(here, { city: 'Sylhet', country: 'Bangladesh' })).toBe(true);
    expect(placeChanged(here, { city: 'Dhaka', country: 'India' })).toBe(true);
  });
});
