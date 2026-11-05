import type { CalculationInput } from '@/features/prayer-times/calculate';
import { buildCatchUpQueue, MAX_DAYS_BACK, queueStartKey } from './queue';

const at = (day: number, h: number, m = 0) => new Date(2026, 10, day, h, m);

describe('queueStartKey', () => {
  it('starts at the start of tracking when that is recent', () => {
    expect(queueStartKey('2026-11-03', at(5, 12))).toBe('2026-11-03');
  });

  it('never looks back further than the limit', () => {
    expect(queueStartKey('2026-01-01', at(10, 12))).toBe(`2026-11-0${10 - (MAX_DAYS_BACK - 1)}`);
  });

  it('is today when tracking has not started or starts later', () => {
    expect(queueStartKey(undefined, at(5, 12))).toBe('2026-11-05');
    expect(queueStartKey('2026-12-01', at(5, 12))).toBe('2026-11-05');
  });
});

describe('buildCatchUpQueue', () => {
  // Hand-set times make the clock times exact whatever time zone the tests run in.
  const profile: CalculationInput & { startedOn: string } = {
    latitude: 23.8,
    longitude: 90.4,
    calculationMethod: 'Karachi',
    asrMethod: 'hanafi',
    manualTimes: { fajr: '05:00', dhuhr: '12:00', asr: '15:30', maghrib: '17:20', isha: '19:00' },
    startedOn: '2026-11-04',
  };

  it('lists every passed unlogged prayer, oldest first, across days', () => {
    const queue = buildCatchUpQueue({ profile, logged: [], at: at(5, 13) });
    expect(queue.map((item) => `${item.date} ${item.prayer}`)).toEqual([
      '2026-11-04 fajr',
      '2026-11-04 dhuhr',
      '2026-11-04 asr',
      '2026-11-04 maghrib',
      '2026-11-04 isha',
      '2026-11-05 fajr',
      '2026-11-05 dhuhr',
    ]);
  });

  it('skips prayers that were logged either way', () => {
    const queue = buildCatchUpQueue({
      profile,
      logged: [
        { date: '2026-11-04', prayer: 'fajr' },
        { date: '2026-11-04', prayer: 'isha' },
        { date: '2026-11-05', prayer: 'dhuhr' },
      ],
      at: at(5, 13),
    });
    expect(queue.map((item) => `${item.date} ${item.prayer}`)).toEqual([
      '2026-11-04 dhuhr',
      '2026-11-04 asr',
      '2026-11-04 maghrib',
      '2026-11-05 fajr',
    ]);
  });

  it('never includes a prayer whose time has not come', () => {
    const queue = buildCatchUpQueue({ profile, logged: [], at: at(5, 4, 59) });
    expect(queue.some((item) => item.date === '2026-11-05')).toBe(false);
    expect(buildCatchUpQueue({ profile, logged: [], at: at(5, 5, 0) }).some((item) => item.date === '2026-11-05')).toBe(true);
  });

  it('is empty when everything that has passed is logged', () => {
    const logged = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].flatMap((prayer) => [
      { date: '2026-11-04', prayer: prayer as 'fajr' },
    ]);
    const queue = buildCatchUpQueue({
      profile,
      logged: [...logged, { date: '2026-11-05', prayer: 'fajr' }, { date: '2026-11-05', prayer: 'dhuhr' }],
      at: at(5, 13),
    });
    expect(queue).toEqual([]);
  });

  it('ignores days before tracking started', () => {
    const queue = buildCatchUpQueue({ profile: { ...profile, startedOn: '2026-11-05' }, logged: [], at: at(5, 13) });
    expect(queue.every((item) => item.date === '2026-11-05')).toBe(true);
  });
});
