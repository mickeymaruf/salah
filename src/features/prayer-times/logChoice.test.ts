import { availableChoices, canLog, initialChoice, isEditableDay, sheetSubtitle } from './logChoice';

describe('availableChoices', () => {
  it('allows nothing before the prayer time', () => {
    expect(availableChoices('upcoming')).toEqual([]);
    expect(canLog('upcoming')).toBe(false);
    expect(canLog('missed')).toBe(true);
    expect(canLog('prayed')).toBe(true);
    expect(availableChoices('missed')).toEqual(['prayed', 'missed']);
    expect(availableChoices('prayed')).toEqual(['prayed', 'missed']);
    expect(availableChoices('untracked')).toEqual(['prayed', 'missed']);
  });
});

describe('initialChoice', () => {
  it('opens on the current state', () => {
    expect(initialChoice('missed')).toBe('missed');
    expect(initialChoice('prayed')).toBe('prayed');
    expect(initialChoice('upcoming')).toBe('prayed');
    expect(initialChoice('untracked')).toBe('prayed');
  });
});

describe('sheetSubtitle', () => {
  const time = new Date(2026, 9, 26, 4, 48);
  it('says Today for the current day and the weekday for others', () => {
    expect(sheetSubtitle(time, '2026-10-26', '2026-10-26')).toBe('4:48 AM · Today, 26 Oct');
    expect(sheetSubtitle(new Date(2026, 9, 23, 4, 48), '2026-10-23', '2026-10-26')).toBe('4:48 AM · Fri, 23 Oct');
  });
});

describe('isEditableDay', () => {
  it('allows today and any earlier day, not future days', () => {
    expect(isEditableDay('2026-10-26', '2026-10-26')).toBe(true);
    expect(isEditableDay('2025-01-01', '2026-10-26')).toBe(true);
    expect(isEditableDay('2026-10-27', '2026-10-26')).toBe(false);
  });
});
