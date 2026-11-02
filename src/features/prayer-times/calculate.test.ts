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
