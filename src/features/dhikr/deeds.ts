import { addDays, daysInMonth, parseDateKey, toDateKey } from '@/shared/lib/date';
import { DHIKR, type DhikrEntry } from './config';

export interface DhikrRow {
  key: string;
  day: string;
  count: number;
}

export interface DhikrTotal {
  key: string;
  count: number;
}

// Deeds one recitation adds. A value that is not verified, or is missing or not positive, counts as 1.
export function recitationDeeds(entry: Pick<DhikrEntry, 'deedValue' | 'verified'> | undefined): number {
  if (!entry || !entry.verified || entry.deedValue === null || !(entry.deedValue > 0)) return 1;
  return entry.deedValue;
}

export function deedsFor(key: string, count: number, table: readonly DhikrEntry[] = DHIKR): number {
  return count * recitationDeeds(table.find((entry) => entry.key === key));
}

export function deedsForDay(rows: readonly DhikrRow[], day: string, table: readonly DhikrEntry[] = DHIKR): number {
  return rows.filter((row) => row.day === day).reduce((sum, row) => sum + deedsFor(row.key, row.count, table), 0);
}

// One value per day of the month, day 1 first.
export function deedsForMonth(rows: readonly DhikrRow[], year: number, monthIndex: number, table: readonly DhikrEntry[] = DHIKR): number[] {
  const days = Array.from({ length: daysInMonth(year, monthIndex) }, () => 0);
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`;
  for (const row of rows) {
    if (!row.day.startsWith(prefix)) continue;
    const index = Number(row.day.slice(prefix.length)) - 1;
    if (index >= 0 && index < days.length) days[index] += deedsFor(row.key, row.count, table);
  }
  return days;
}

// Everything ever counted, from the per-dhikr totals.
export function allTimeDeeds(totals: readonly DhikrTotal[], table: readonly DhikrEntry[] = DHIKR): number {
  return totals.reduce((sum, total) => sum + deedsFor(total.key, total.count, table), 0);
}

// The last `length` day keys ending on `today`, oldest first.
export function dayKeysEnding(today: string, length: number): string[] {
  const end = parseDateKey(today);
  return Array.from({ length }, (_, i) => toDateKey(addDays(end, i - (length - 1))));
}

// Daily deeds for the last `length` days, oldest first, today last.
export function lastDays(rows: readonly DhikrRow[], today: string, length: number, table: readonly DhikrEntry[] = DHIKR): number[] {
  return dayKeysEnding(today, length).map((day) => deedsForDay(rows, day, table));
}

export function countForKey(rows: readonly DhikrRow[], key: string, day: string): number {
  return rows.filter((row) => row.key === key && row.day === day).reduce((sum, row) => sum + row.count, 0);
}

export function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

// "Not yet today" or "N today" under a dhikr's name.
export function todayLine(count: number): string {
  return count > 0 ? `${count} today` : 'Not yet today';
}
