import { CalculationMethod } from 'adhan';
import { ALARM_SOUNDS, REMINDER_OPTIONS } from '@/shared/state/settings';
import { ALARM_SOUND_LABELS, CALCULATION_METHOD_LABELS, formatReminder, labelEntries } from './options';

describe('option labels', () => {
  it('cover every calculation method adhan offers, except Other', () => {
    const adhanMethods = Object.keys(CalculationMethod).filter((name) => name !== 'Other');
    expect(Object.keys(CALCULATION_METHOD_LABELS).sort()).toEqual(adhanMethods.sort());
  });

  it('cover every alarm sound', () => {
    expect(Object.keys(ALARM_SOUND_LABELS).sort()).toEqual([...ALARM_SOUNDS].sort());
  });
});

describe('formatReminder', () => {
  it('shows Off for 0 and minutes otherwise', () => {
    expect(REMINDER_OPTIONS.map(formatReminder)).toEqual(['Off', '5 min', '10 min', '15 min', '30 min']);
  });
});

describe('labelEntries', () => {
  it('keeps the declaration order', () => {
    expect(labelEntries({ a: 'A', b: 'B' })).toEqual([
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ]);
  });
});
