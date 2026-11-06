import { DEFAULT_SETTINGS, parseSettings } from './settings';

describe('parseSettings', () => {
  it('returns defaults when nothing is stored or the value is broken', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('{oops')).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('42')).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid stored values', () => {
    const stored = { requireProof: false, markSound: false, alarmSound: 'bell', reminderMinutesBefore: 0 };
    expect(parseSettings(JSON.stringify(stored))).toEqual(stored);
  });

  it('replaces invalid fields with defaults and keeps the valid ones', () => {
    const parsed = parseSettings(JSON.stringify({ requireProof: false, alarmSound: 'adhan', reminderMinutesBefore: 7 }));
    expect(parsed).toEqual({ ...DEFAULT_SETTINGS, requireProof: false });
  });
});
