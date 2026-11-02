import { addDays, toDateKey } from '@/shared/lib/date';
import { getDayTimes, PRAYER_LABELS, PRAYER_NAMES, type CalculationInput, type PrayerName } from '@/features/prayer-times/calculate';
import type { Settings } from '@/shared/state/settings';

export type AlarmKind = 'reminder' | 'prayer' | 'followup';

export interface PlannedAlarm {
  id: string;
  kind: AlarmKind;
  prayer: PrayerName;
  date: string;
  fireAt: Date;
  title: string;
  body: string;
}

export const DAYS_AHEAD = 7;
export const FOLLOW_UP_COUNT = 5;
export const FOLLOW_UP_MINUTES = 3;
// iOS keeps only 64 pending local notifications, so leave a little room.
export const IOS_BUDGET = 60;
export const ANDROID_BUDGET = 250;

const MINUTE = 60_000;

export function alarmId(date: string, prayer: PrayerName, kind: AlarmKind, index = 0): string {
  return `${date}-${prayer}-${kind}${index}`;
}

// Ids of every notification that belongs to one prayer, used to cancel follow-ups without listing.
export function idsForPrayer(date: string, prayer: PrayerName): string[] {
  return [
    alarmId(date, prayer, 'reminder'),
    alarmId(date, prayer, 'prayer'),
    ...Array.from({ length: FOLLOW_UP_COUNT }, (_, i) => alarmId(date, prayer, 'followup', i + 1)),
  ];
}

interface PlanInput {
  profile: CalculationInput;
  settings: Pick<Settings, 'reminderMinutesBefore' | 'requireProof'>;
  from: Date;
  // Entries look like "2026-10-26:fajr".
  prayed: ReadonlySet<string>;
  budget: number;
}

export function prayedKey(date: string, prayer: PrayerName): string {
  return `${date}:${prayer}`;
}

export function planAlarms({ profile, settings, from, prayed, budget }: PlanInput): PlannedAlarm[] {
  const main: PlannedAlarm[] = [];
  const extras: PlannedAlarm[] = [];
  const after = from.getTime();
  const callToAction = settings.requireProof
    ? 'Pray, then show proof to silence this alarm.'
    : 'Pray, then mark it as prayed to silence this alarm.';

  for (let offset = 0; offset < DAYS_AHEAD; offset++) {
    const day = addDays(from, offset);
    const date = toDateKey(day);
    const times = getDayTimes(profile, day);

    for (const prayer of PRAYER_NAMES) {
      if (prayed.has(prayedKey(date, prayer))) continue;
      const label = PRAYER_LABELS[prayer];
      const time = times[prayer].getTime();
      const make = (kind: AlarmKind, index: number, fireAt: number, title: string, body: string): PlannedAlarm | null =>
        fireAt > after ? { id: alarmId(date, prayer, kind, index), kind, prayer, date, fireAt: new Date(fireAt), title, body } : null;

      const prayerAlarm = make('prayer', 0, time, `Time for ${label}`, callToAction);
      if (prayerAlarm) main.push(prayerAlarm);

      const { reminderMinutesBefore } = settings;
      const reminder =
        reminderMinutesBefore > 0
          ? make('reminder', 0, time - reminderMinutesBefore * MINUTE, `${label} in ${reminderMinutesBefore} min`, 'Find a clean place to pray.')
          : null;
      if (reminder) extras.push(reminder);

      for (let i = 1; i <= FOLLOW_UP_COUNT; i++) {
        const followUp = make('followup', i, time + i * FOLLOW_UP_MINUTES * MINUTE, `${label} is waiting`, callToAction);
        if (followUp) extras.push(followUp);
      }
    }
  }

  // Prayer alarms for the whole week come first; the rest fills the budget soonest-first.
  const room = Math.max(0, budget - main.length);
  const chosenExtras = extras.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime()).slice(0, room);
  return [...main, ...chosenExtras].slice(0, budget).sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
}
