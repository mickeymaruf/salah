import type { ManualTimes } from '@/shared/state/profile';
import { PRAYER_NAMES, type DayTimes, type PrayerName } from './calculate';

export function hasManualTimes(manual: ManualTimes | undefined): boolean {
  return manual !== undefined && Object.keys(manual).length > 0;
}

export function toClock(hour24: number, minute: number): string {
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function clockOf(date: Date): string {
  return toClock(date.getHours(), date.getMinutes());
}

export function clockToMinutes(clock: string): number {
  const [hour, minute] = clock.split(':').map(Number);
  return hour * 60 + minute;
}

// The edited clock time is placed on the local calendar day of `day`, so one edit applies to every day.
export function clockOnDay(day: Date, clock: string): Date {
  const [hour, minute] = clock.split(':').map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);
}

export function applyManualTimes(times: DayTimes, manual: ManualTimes | undefined, day: Date): DayTimes {
  if (!hasManualTimes(manual)) return times;
  const result = { ...times };
  for (const name of PRAYER_NAMES) {
    const clock = manual?.[name];
    if (clock) result[name] = clockOnDay(day, clock);
  }
  return result;
}

// The five effective times must rise through the day, or "next prayer" and the missed logic break.
export function findOrderProblem(
  automatic: DayTimes,
  manual: ManualTimes,
): { earlier: PrayerName; later: PrayerName } | null {
  const minutes = PRAYER_NAMES.map((name) => clockToMinutes(manual[name] ?? clockOf(automatic[name])));
  for (let i = 1; i < minutes.length; i++) {
    // Two calculated times are never at fault, even if a phone in another time zone shows them out of order.
    const edited = manual[PRAYER_NAMES[i]] !== undefined || manual[PRAYER_NAMES[i - 1]] !== undefined;
    if (edited && minutes[i] <= minutes[i - 1]) return { earlier: PRAYER_NAMES[i - 1], later: PRAYER_NAMES[i] };
  }
  return null;
}

// Setting a prayer back to its calculated minute is not an edit, so the row returns to Automatic.
export function withClock(
  manual: ManualTimes,
  name: PrayerName,
  clock: string,
  automatic: DayTimes,
): ManualTimes {
  const next = { ...manual };
  if (clock === clockOf(automatic[name])) delete next[name];
  else next[name] = clock;
  return next;
}

export function placeChanged(
  current: { city: string; country: string },
  next: { city: string; country: string },
): boolean {
  return current.city !== next.city || current.country !== next.country;
}
