import { getDb } from '@/shared/db/database';
import type { DhikrRow, DhikrTotal } from '../deeds';

interface Row {
  dhikr_key: string;
  day: string;
  count: number;
}

const toRow = (row: Row): DhikrRow => ({ key: row.dhikr_key, day: row.day, count: row.count });

// One row per dhikr per day, replaced in place with the latest count.
export async function setDhikrCount(key: string, day: string, count: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO dhikr_log (dhikr_key, day, count) VALUES (?, ?, ?) ON CONFLICT (dhikr_key, day) DO UPDATE SET count = excluded.count',
    [key, day, Math.max(0, Math.floor(count))],
  );
}

export async function getDhikrDay(day: string): Promise<DhikrRow[]> {
  const db = await getDb();
  return (await db.getAllAsync<Row>('SELECT dhikr_key, day, count FROM dhikr_log WHERE day = ?', [day])).map(toRow);
}

// Day keys are zero-padded, so string comparison matches calendar order.
export async function getDhikrRange(startDay: string, endDay: string): Promise<DhikrRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>('SELECT dhikr_key, day, count FROM dhikr_log WHERE day BETWEEN ? AND ? ORDER BY day', [startDay, endDay]);
  return rows.map(toRow);
}

export async function getDhikrTotals(): Promise<DhikrTotal[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ dhikr_key: string; total: number }>('SELECT dhikr_key, SUM(count) AS total FROM dhikr_log GROUP BY dhikr_key');
  return rows.map((row) => ({ key: row.dhikr_key, count: row.total }));
}
