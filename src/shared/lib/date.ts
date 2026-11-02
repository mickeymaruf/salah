// Every "now" and "today" in the app goes through this module so tests can fix the clock.
let clock: () => Date = () => new Date();

export function setClock(fn: () => Date): void {
  clock = fn;
}

export function resetClock(): void {
  clock = () => new Date();
}

export function now(): Date {
  return clock();
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// Local calendar date as YYYY-MM-DD. Never use toISOString here: it is UTC and shifts the day.
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function todayKey(): string {
  return toDateKey(now());
}

// Uses calendar arithmetic so DST changes do not move the result by a day.
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, date.getHours(), date.getMinutes());
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function formatTime(date: Date): string {
  const hours = date.getHours();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 === 0 ? 12 : hours % 12}:${pad(date.getMinutes())} ${suffix}`;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatLongDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatShortDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()].slice(0, 3)}, ${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`;
}

export function formatDayMonth(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`;
}

export function formatCountdown(ms: number): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `in ${minutes}m`;
  return `in ${hours}h ${minutes}m`;
}
