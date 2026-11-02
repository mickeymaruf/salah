import { alarmTargetFromData, isDateKey, isPrayerName } from './notificationData';

describe('alarmTargetFromData', () => {
  it('opens the alarm for prayer and follow-up notifications', () => {
    const target = { prayer: 'asr', date: '2026-10-26' };
    expect(alarmTargetFromData({ kind: 'prayer', ...target })).toEqual(target);
    expect(alarmTargetFromData({ kind: 'followup', ...target })).toEqual(target);
  });

  it('ignores reminders and malformed payloads', () => {
    expect(alarmTargetFromData({ kind: 'reminder', prayer: 'asr', date: '2026-10-26' })).toBeNull();
    expect(alarmTargetFromData({ kind: 'prayer', prayer: 'witr', date: '2026-10-26' })).toBeNull();
    expect(alarmTargetFromData({ kind: 'prayer', prayer: 'asr', date: 'tomorrow' })).toBeNull();
    expect(alarmTargetFromData(null)).toBeNull();
    expect(alarmTargetFromData('prayer')).toBeNull();
  });
});

describe('validators', () => {
  it('accepts only known names and zero-padded dates', () => {
    expect(isPrayerName('fajr')).toBe(true);
    expect(isPrayerName('Fajr')).toBe(false);
    expect(isDateKey('2026-01-05')).toBe(true);
    expect(isDateKey('2026-1-5')).toBe(false);
    expect(isDateKey(undefined)).toBe(false);
  });
});
