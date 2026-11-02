import type { DayTimes } from './calculate';
import { getDayStates, getNextPrayer, getPrayerState } from './schedule';

const at = (h: number, m = 0, day = 26) => new Date(2026, 9, day, h, m);

const today: DayTimes = { fajr: at(4, 48), dhuhr: at(12, 2), asr: at(15, 42), maghrib: at(17, 21), isha: at(18, 40) };
const tomorrow: DayTimes = {
  fajr: at(4, 49, 27),
  dhuhr: at(12, 2, 27),
  asr: at(15, 41, 27),
  maghrib: at(17, 20, 27),
  isha: at(18, 39, 27),
};

describe('getPrayerState', () => {
  it('is prayed whenever a log row exists, even before the time', () => {
    expect(getPrayerState(at(15, 42), true, at(10))).toBe('prayed');
  });

  it('is missed once the time has passed without a row', () => {
    expect(getPrayerState(at(12, 2), false, at(12, 2))).toBe('missed');
    expect(getPrayerState(at(12, 2), false, at(13))).toBe('missed');
  });

  it('is upcoming before the time', () => {
    expect(getPrayerState(at(15, 42), false, at(15, 41))).toBe('upcoming');
  });
});

describe('getDayStates', () => {
  it('combines the log and the clock for all five prayers', () => {
    const states = getDayStates(today, new Set(['fajr']), at(13));
    expect(states).toEqual({
      fajr: 'prayed',
      dhuhr: 'missed',
      asr: 'upcoming',
      maghrib: 'upcoming',
      isha: 'upcoming',
    });
  });
});

describe('getNextPrayer', () => {
  it('is Fajr before dawn', () => {
    expect(getNextPrayer(today, tomorrow, at(3))).toEqual({ name: 'fajr', time: today.fajr, isTomorrow: false });
  });

  it('skips prayers that already started', () => {
    expect(getNextPrayer(today, tomorrow, at(12, 2)).name).toBe('asr');
    expect(getNextPrayer(today, tomorrow, at(14)).name).toBe('asr');
  });

  it('rolls over to tomorrow after Isha', () => {
    expect(getNextPrayer(today, tomorrow, at(21))).toEqual({
      name: 'fajr',
      time: tomorrow.fajr,
      isTomorrow: true,
    });
  });
});
