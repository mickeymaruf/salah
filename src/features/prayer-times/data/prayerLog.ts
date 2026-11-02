import { getDb } from '@/shared/db/database';
import { now } from '@/shared/lib/date';
import type { PrayerName } from '../calculate';

export interface PrayerLogEntry {
  date: string;
  prayer: PrayerName;
  completedAt: string;
  proofUri: string | null;
}

interface Row {
  date: string;
  prayer: PrayerName;
  completed_at: string;
  proof_uri: string | null;
}

function toEntry(row: Row): PrayerLogEntry {
  return { date: row.date, prayer: row.prayer, completedAt: row.completed_at, proofUri: row.proof_uri };
}

// The first completion wins, so a repeated tap or notification never rewrites the time or proof.
export async function markPrayed(date: string, prayer: PrayerName, proofUri: string | null): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR IGNORE INTO prayer_log (date, prayer, completed_at, proof_uri) VALUES (?, ?, ?, ?)',
    [date, prayer, now().toISOString(), proofUri],
  );
}

// Missed is never stored, so choosing Missed deletes the row. The photo file, if any, is left on the device.
export async function removePrayed(date: string, prayer: PrayerName): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM prayer_log WHERE date = ? AND prayer = ?', [date, prayer]);
}

export async function getDay(date: string): Promise<PrayerLogEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>('SELECT * FROM prayer_log WHERE date = ?', [date]);
  return rows.map(toEntry);
}

// Date keys are zero-padded, so string comparison matches calendar order.
export async function getRange(startDate: string, endDate: string): Promise<PrayerLogEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    'SELECT * FROM prayer_log WHERE date BETWEEN ? AND ? ORDER BY date',
    [startDate, endDate],
  );
  return rows.map(toEntry);
}

export function getYear(year: number): Promise<PrayerLogEntry[]> {
  return getRange(`${year}-01-01`, `${year}-12-31`);
}
