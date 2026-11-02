import type { CalculationInput } from '@/features/prayer-times/calculate';
import { toDateKey } from '@/shared/lib/date';
import { ANDROID_BUDGET, IOS_BUDGET, idsForPrayer, planAlarms, prayedKey } from './schedule';

const profile: CalculationInput = {
  latitude: 21.4225,
  longitude: 39.8262,
  calculationMethod: 'Karachi',
  asrMethod: 'standard',
};
const settings = { reminderMinutesBefore: 10, requireProof: true };
const from = new Date(2026, 9, 26, 0, 30);

const plan = (overrides: Partial<Parameters<typeof planAlarms>[0]> = {}) =>
  planAlarms({ profile, settings, from, prayed: new Set(), budget: ANDROID_BUDGET, ...overrides });

describe('planAlarms', () => {
  it('plans a prayer alarm for each of the 5 prayers over 7 days', () => {
    const alarms = plan();
    expect(alarms.filter((a) => a.kind === 'prayer')).toHaveLength(35);
  });

  it('plans one reminder and five follow-ups per prayer', () => {
    const alarms = plan();
    expect(alarms.filter((a) => a.kind === 'reminder')).toHaveLength(35);
    expect(alarms.filter((a) => a.kind === 'followup')).toHaveLength(175);
  });

  it('spaces follow-ups three minutes apart after the prayer time', () => {
    const alarms = plan();
    const prayer = alarms.find((a) => a.kind === 'prayer')!;
    const followUps = alarms.filter((a) => a.kind === 'followup' && a.prayer === prayer.prayer && a.date === prayer.date);
    expect(followUps.map((a) => (a.fireAt.getTime() - prayer.fireAt.getTime()) / 60000)).toEqual([3, 6, 9, 12, 15]);
  });

  it('omits reminders when the setting is 0', () => {
    expect(plan({ settings: { ...settings, reminderMinutesBefore: 0 } }).some((a) => a.kind === 'reminder')).toBe(false);
  });

  it('never plans anything in the past', () => {
    const late = new Date(2026, 9, 26, 23, 0);
    expect(plan({ from: late }).every((a) => a.fireAt.getTime() > late.getTime())).toBe(true);
  });

  it('skips every notification of a prayer that is already prayed', () => {
    const today = toDateKey(from);
    const alarms = plan({ prayed: new Set([prayedKey(today, 'fajr')]) });
    expect(alarms.some((a) => a.date === today && a.prayer === 'fajr')).toBe(false);
    expect(alarms.some((a) => a.date === today && a.prayer === 'dhuhr')).toBe(true);
  });

  it('keeps all prayer alarms and drops the latest extras when over budget', () => {
    const alarms = plan({ budget: IOS_BUDGET });
    expect(alarms).toHaveLength(IOS_BUDGET);
    expect(alarms.filter((a) => a.kind === 'prayer')).toHaveLength(35);
    const full = plan();
    const lastKept = Math.max(...alarms.filter((a) => a.kind !== 'prayer').map((a) => a.fireAt.getTime()));
    const dropped = full.filter((a) => a.kind !== 'prayer' && !alarms.some((b) => b.id === a.id));
    expect(dropped.every((a) => a.fireAt.getTime() >= lastKept)).toBe(true);
  });

  it('returns alarms in chronological order with unique ids', () => {
    const alarms = plan();
    const times = alarms.map((a) => a.fireAt.getTime());
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    expect(new Set(alarms.map((a) => a.id)).size).toBe(alarms.length);
  });

  it('changes the message when proof is not required', () => {
    const body = plan({ settings: { ...settings, requireProof: false } }).find((a) => a.kind === 'prayer')!.body;
    expect(body).toContain('mark it as prayed');
  });
});

describe('idsForPrayer', () => {
  it('lists the ids the planner generates for that prayer', () => {
    const date = toDateKey(from);
    const planned = plan().filter((a) => a.date === date && a.prayer === 'asr').map((a) => a.id);
    expect(idsForPrayer(date, 'asr').sort()).toEqual(expect.arrayContaining(planned.sort()));
  });
});
