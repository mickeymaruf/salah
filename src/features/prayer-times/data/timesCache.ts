import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CalculationInput, DayTimes } from '../calculate';
import { PRAYER_NAMES } from '../calculate';
import { fetchMonth } from './aladhan';
import { rememberTimes, tableKey } from './timesMemory';

type Table = Record<string, DayTimes>;

const loadedMonths = new Set<string>();

function serialize(table: Table): string {
  const plain = Object.fromEntries(
    Object.entries(table).map(([date, times]) => [
      date,
      Object.fromEntries(PRAYER_NAMES.map((name) => [name, times[name].toISOString()])),
    ]),
  );
  return JSON.stringify(plain);
}

function deserialize(raw: string): Table | null {
  try {
    const plain = JSON.parse(raw) as Record<string, Record<string, string>>;
    const table: Table = {};
    for (const [date, times] of Object.entries(plain)) {
      const day = {} as DayTimes;
      for (const name of PRAYER_NAMES) {
        const value = new Date(times[name]);
        if (Number.isNaN(value.getTime())) return null;
        day[name] = value;
      }
      table[date] = day;
    }
    return table;
  } catch {
    return null;
  }
}

async function loadMonth(input: CalculationInput, year: number, month: number): Promise<boolean> {
  const monthKey = `${tableKey(input)}|${year}-${String(month).padStart(2, '0')}`;
  if (loadedMonths.has(monthKey)) return false;

  const storageKey = `salah.times.${monthKey}`;
  const stored = await AsyncStorage.getItem(storageKey).catch(() => null);
  const cached = stored ? deserialize(stored) : null;
  if (cached) {
    rememberTimes(input, cached);
    loadedMonths.add(monthKey);
    return true;
  }

  const fetched = await fetchMonth(input, year, month);
  if (!fetched) return false;
  rememberTimes(input, fetched);
  loadedMonths.add(monthKey);
  await AsyncStorage.setItem(storageKey, serialize(fetched)).catch(() => undefined);
  return true;
}

// Loads this month and the next, from storage or from the API. Returns true if anything new became available.
export async function syncTimes(input: CalculationInput, from: Date): Promise<boolean> {
  const next = new Date(from.getFullYear(), from.getMonth() + 1, 1);
  const results = await Promise.all([
    loadMonth(input, from.getFullYear(), from.getMonth() + 1),
    loadMonth(input, next.getFullYear(), next.getMonth() + 1),
  ]);
  return results.some(Boolean);
}
