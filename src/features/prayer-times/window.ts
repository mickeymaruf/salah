import { PRAYER_NAMES, type DayTimes, type PrayerName } from './calculate';

export interface PrayerWindow {
  name: PrayerName;
  start: Date;
  end: Date;
  // The prayer that starts at `end`.
  nextName: PrayerName;
  // 0 at the start of the window, 1 at its end.
  progress: number;
}

// The window of the prayer that is in progress: from its start to the start of the next one. Before today's Fajr
// that is yesterday's Isha, and after Isha it runs to tomorrow's Fajr.
export function getPrayerWindow(yesterday: DayTimes, today: DayTimes, tomorrow: DayTimes, at: Date): PrayerWindow {
  const steps: { name: PrayerName; time: Date }[] = [
    { name: 'isha', time: yesterday.isha },
    ...PRAYER_NAMES.map((name) => ({ name, time: today[name] })),
    { name: 'fajr', time: tomorrow.fajr },
  ];
  let current = 0;
  for (let i = 0; i < steps.length - 1; i++) {
    if (steps[i].time.getTime() <= at.getTime()) current = i;
  }
  const { name, time: start } = steps[current];
  const { name: nextName, time: end } = steps[current + 1];
  const length = end.getTime() - start.getTime();
  const progress = length > 0 ? (at.getTime() - start.getTime()) / length : 0;
  return { name, start, end, nextName, progress: Math.min(1, Math.max(0, progress)) };
}

// A point on the half circle, `progress` of the way from its left end (0) to its right end (1). The circle's centre
// is (cx, cy), and the arc bulges upward.
export function arcPoint(progress: number, cx: number, cy: number, radius: number): { x: number; y: number } {
  const angle = Math.PI * progress;
  return { x: cx - radius * Math.cos(angle), y: cy - radius * Math.sin(angle) };
}

export function halfCirclePath(cx: number, cy: number, radius: number): string {
  return `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;
}

export function halfCircleLength(radius: number): number {
  return Math.PI * radius;
}

// How many dots draw the half circle when they are about `spacing` apart, counting both ends.
export function ringDotCount(radius: number, spacing: number): number {
  return Math.round(halfCircleLength(radius) / spacing) + 1;
}

// Where each ring dot sits, and how far along the half circle (0 to 1) it is.
export function ringDots(count: number, cx: number, cy: number, radius: number): { x: number; y: number; at: number }[] {
  return Array.from({ length: count }, (_, i) => {
    const at = count > 1 ? i / (count - 1) : 0;
    return { ...arcPoint(at, cx, cy, radius), at };
  });
}
