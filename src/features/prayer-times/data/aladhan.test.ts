import type { CalculationInput } from '../calculate';
import { buildCalendarUrl, parseCalendar } from './aladhan';

const natore: CalculationInput = {
  latitude: 24.4206,
  longitude: 89,
  calculationMethod: 'Karachi',
  asrMethod: 'hanafi',
};

const entry = (date: string, times: Record<string, string>) => ({ date: { gregorian: { date } }, timings: times });
const day = {
  Fajr: '04:54 (+06)',
  Sunrise: '06:11 (+06)',
  Dhuhr: '11:49 (+06)',
  Asr: '15:47 (+06)',
  Maghrib: '17:24 (+06)',
  Isha: '18:41 (+06)',
};

describe('buildCalendarUrl', () => {
  it('maps method and Asr school to the API parameters', () => {
    const url = buildCalendarUrl(natore, 2026, 11);
    expect(url).toBe('https://api.aladhan.com/v1/calendar/2026/11?latitude=24.4206&longitude=89&method=1&school=1');
    expect(
      buildCalendarUrl({ ...natore, calculationMethod: 'MuslimWorldLeague', asrMethod: 'standard' }, 2026, 1),
    ).toContain('method=3&school=0');
  });
});

describe('parseCalendar', () => {
  it('reads each day into local dates, ignoring the zone suffix', () => {
    const table = parseCalendar({ code: 200, data: [entry('02-11-2026', day), entry('03-11-2026', day)] });
    expect(Object.keys(table ?? {})).toEqual(['2026-11-02', '2026-11-03']);
    const times = table!['2026-11-02'];
    expect([times.asr.getHours(), times.asr.getMinutes()]).toEqual([15, 47]);
    expect(times.isha.getDate()).toBe(2);
  });

  it('rejects malformed or out-of-order responses', () => {
    expect(parseCalendar(null)).toBeNull();
    expect(parseCalendar({ data: [] })).toBeNull();
    expect(parseCalendar({ data: [entry('02-11-2026', { ...day, Isha: 'n/a' })] })).toBeNull();
    expect(parseCalendar({ data: [entry('bad', day)] })).toBeNull();
    expect(parseCalendar({ data: [entry('02-11-2026', { ...day, Asr: '10:00' })] })).toBeNull();
  });
});
