import { toClock } from '@/features/prayer-times/manualTimes';

export interface WheelValue {
  // Index into HOURS, MINUTES and PERIODS.
  hour: number;
  minute: number;
  period: number;
}

export const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
export const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
export const PERIODS = ['AM', 'PM'];

export function clockToWheel(clock: string): WheelValue {
  const [hour24, minute] = clock.split(':').map(Number);
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour: hour12 - 1, minute, period: hour24 >= 12 ? 1 : 0 };
}

export function wheelToClock({ hour, minute, period }: WheelValue): string {
  return toClock(((hour + 1) % 12) + period * 12, minute);
}
