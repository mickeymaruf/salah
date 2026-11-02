import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './migrations';

let opened: Promise<SQLite.SQLiteDatabase> | null = null;

async function open(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('salah.db');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  for (let version = current; version < MIGRATIONS.length; version++) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(MIGRATIONS[version]);
      await txn.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
  return db;
}

// One shared connection. A failed open is not cached so the next call can retry.
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!opened) {
    opened = open().catch((error) => {
      opened = null;
      throw error;
    });
  }
  return opened;
}
