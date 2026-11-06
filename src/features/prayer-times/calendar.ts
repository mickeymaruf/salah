import { daysInMonth, toDateKey } from '@/shared/lib/date';

// A day of the month as a YYYY-MM-DD key, or null for the empty cells before the 1st and after the last day.
export type CalendarCell = string | null;

// `firstWeekday` is 0 for Sunday up to 6 for Saturday: the column the week starts on.
export function monthGrid(year: number, monthIndex: number, firstWeekday: number): CalendarCell[][] {
  const lead = (new Date(year, monthIndex, 1).getDay() - firstWeekday + 7) % 7;
  const cells: CalendarCell[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= daysInMonth(year, monthIndex); day++) {
    cells.push(toDateKey(new Date(year, monthIndex, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, row) => cells.slice(row * 7, row * 7 + 7));
}

const LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function weekdayLetters(firstWeekday: number): string[] {
  return LETTERS.map((_, i) => LETTERS[(i + firstWeekday) % 7]);
}

export interface MonthRef {
  year: number;
  monthIndex: number;
}

export function monthOf(key: string): MonthRef {
  const [year, month] = key.split('-').map(Number);
  return { year, monthIndex: month - 1 };
}

export function shiftMonth(month: MonthRef, delta: number): MonthRef {
  const total = month.year * 12 + month.monthIndex + delta;
  return { year: Math.floor(total / 12), monthIndex: ((total % 12) + 12) % 12 };
}

// Negative when `a` is an earlier month than `b`.
export function compareMonths(a: MonthRef, b: MonthRef): number {
  return a.year * 12 + a.monthIndex - (b.year * 12 + b.monthIndex);
}
