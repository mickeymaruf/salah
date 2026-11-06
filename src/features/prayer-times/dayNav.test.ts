import { dayRange, relativeDayLabel, shiftDayKey, MAX_DAYS_AHEAD } from './dayNav';

describe('dayNav', () => {
  it('shifts across month ends', () => {
    expect(shiftDayKey('2026-10-31', 1)).toBe('2026-11-01');
    expect(shiftDayKey('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('labels days relative to today', () => {
    expect(relativeDayLabel('2026-10-26', '2026-10-26')).toBe('Today');
    expect(relativeDayLabel('2026-10-25', '2026-10-26')).toBe('Yesterday');
    expect(relativeDayLabel('2026-10-27', '2026-10-26')).toBe('Tomorrow');
    expect(relativeDayLabel('2026-10-20', '2026-10-26')).toBe('6 days ago');
    expect(relativeDayLabel('2026-10-30', '2026-10-26')).toBe('In 4 days');
  });

  it('starts at the day tracking began and ends two weeks ahead', () => {
    const range = dayRange('2026-10-01', '2026-10-26');
    expect(range.first).toBe('2026-10-01');
    expect(range.last).toBe(shiftDayKey('2026-10-26', MAX_DAYS_AHEAD));
  });

  it('falls back to 30 days back without a start date', () => {
    expect(dayRange(undefined, '2026-10-26').first).toBe('2026-09-26');
  });
});
