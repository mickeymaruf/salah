import type { DayTimes } from './calculate';
import { decodeStates, encodeStates, getDayStates, getPrayerState } from './schedule';

const at = (h: number, m = 0, day = 26) => new Date(2026, 9, day, h, m);

const today: DayTimes = { fajr: at(4, 48), dhuhr: at(12, 2), asr: at(15, 42), maghrib: at(17, 21), isha: at(18, 40) };

describe('getPrayerState', () => {
  it('is whatever the user chose, even before the time', () => {
    expect(getPrayerState(at(15, 42), 'prayed', at(10))).toBe('prayed');
    expect(getPrayerState(at(12, 2), 'missed', at(13))).toBe('missed');
  });

  it('is unmarked, not missed, once the time has passed with no choice', () => {
    expect(getPrayerState(at(12, 2), undefined, at(12, 2))).toBe('unmarked');
    expect(getPrayerState(at(12, 2), undefined, at(13))).toBe('unmarked');
  });

  it('is upcoming before the time', () => {
    expect(getPrayerState(at(15, 42), undefined, at(15, 41))).toBe('upcoming');
  });
});

describe('getDayStates', () => {
  it('combines the choices and the clock for all five prayers', () => {
    const states = getDayStates(today, new Map([['fajr', 'prayed']]), at(13));
    expect(states).toEqual({
      fajr: 'prayed',
      dhuhr: 'unmarked',
      asr: 'upcoming',
      maghrib: 'upcoming',
      isha: 'upcoming',
    });
  });

  it('shows a chosen Missed as missed', () => {
    const states = getDayStates(today, new Map([['dhuhr', 'missed']]), at(13));
    expect(states.dhuhr).toBe('missed');
    expect(states.fajr).toBe('unmarked');
  });
});

describe('encodeStates', () => {
  it('round-trips through decodeStates', () => {
    const states = getDayStates(today, new Map([['fajr', 'prayed']]), at(13));
    expect(decodeStates(encodeStates(states))).toEqual(states);
  });
});
