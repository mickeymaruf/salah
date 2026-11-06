import { dayRange, relativeDayLabel, shiftDayKey, MAX_DAYS_BACK } from './dayNav';

describe('dayNav', () => {
  it('shifts across month ends', () => {
    expect(shiftDayKey('2026-10-31', 1)).toBe('2026-11-01');
    expect(shiftDayKey('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('labels days relative to today', () => {
    expect(relativeDayLabel('2026-10-26', '2026-10-26')).toBe('Today');
    expect(relativeDayLabel('2026-10-25', '2026-10-26')).toBe('Yesterday');
    expect(relativeDayLabel('2026-10-20', '2026-10-26')).toBe('6 days ago');
  });

  it('goes back a year and stops at today, whenever tracking began', () => {
    const range = dayRange('2026-10-26');
    expect(range.first).toBe(shiftDayKey('2026-10-26', -MAX_DAYS_BACK));
    expect(range.last).toBe('2026-10-26');
  });
});
