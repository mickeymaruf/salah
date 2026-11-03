import { getDayTimes, PRAYER_NAMES, type CalculationInput } from './calculate';

const dhaka: CalculationInput = {
  latitude: 23.8103,
  longitude: 90.4125,
  calculationMethod: 'Karachi',
  asrMethod: 'standard',
};

describe('getDayTimes', () => {
  it('returns the five prayers in chronological order', () => {
    const times = getDayTimes(dhaka, new Date(2026, 9, 26, 12));
    const instants = PRAYER_NAMES.map((name) => times[name].getTime());
    expect(instants.every(Number.isFinite)).toBe(true);
    expect([...instants].sort((a, b) => a - b)).toEqual(instants);
  });

  it('gives the same times for any moment of the same local day', () => {
    const morning = getDayTimes(dhaka, new Date(2026, 9, 26, 1));
    const evening = getDayTimes(dhaka, new Date(2026, 9, 26, 23));
    expect(morning.fajr.getTime()).toBe(evening.fajr.getTime());
  });

  it('makes Asr later with the Hanafi method', () => {
    const date = new Date(2026, 9, 26, 12);
    const standard = getDayTimes(dhaka, date);
    const hanafi = getDayTimes({ ...dhaka, asrMethod: 'hanafi' }, date);
    expect(hanafi.asr.getTime()).toBeGreaterThan(standard.asr.getTime());
    expect(hanafi.dhuhr.getTime()).toBe(standard.dhuhr.getTime());
  });

  it('still produces valid times at high latitudes in summer', () => {
    const oslo: CalculationInput = { ...dhaka, latitude: 59.91, longitude: 10.75, calculationMethod: 'MuslimWorldLeague' };
    const times = getDayTimes(oslo, new Date(2026, 5, 21, 12));
    expect(PRAYER_NAMES.every((name) => Number.isFinite(times[name].getTime()))).toBe(true);
  });
});

describe('getDayTimes with manual times', () => {
  const day = new Date(2026, 9, 26, 12);

  it('replaces only the edited prayers', () => {
    const automatic = getDayTimes(dhaka, day);
    const edited = getDayTimes({ ...dhaka, manualTimes: { fajr: '04:55', isha: '20:10' } }, day);
    expect([edited.fajr.getHours(), edited.fajr.getMinutes()]).toEqual([4, 55]);
    expect([edited.isha.getHours(), edited.isha.getMinutes()]).toEqual([20, 10]);
    expect(edited.dhuhr.getTime()).toBe(automatic.dhuhr.getTime());
    expect(edited.asr.getTime()).toBe(automatic.asr.getTime());
  });

  it('puts the edit on whichever local day is asked for', () => {
    const next = getDayTimes({ ...dhaka, manualTimes: { fajr: '04:55' } }, new Date(2026, 9, 27, 12));
    expect([next.fajr.getDate(), next.fajr.getHours(), next.fajr.getMinutes()]).toEqual([27, 4, 55]);
  });

  it('gives the automatic times when nothing is edited', () => {
    expect(getDayTimes({ ...dhaka, manualTimes: {} }, day)).toEqual(getDayTimes(dhaka, day));
  });
});
