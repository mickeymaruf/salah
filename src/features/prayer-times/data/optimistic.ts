import type { PrayerLogEntry } from './prayerLog';

// A pending change keyed by "date:prayer". An entry means "marked", null means "cleared".
export type Overrides = Record<string, PrayerLogEntry | null>;

export function overrideKey(date: string, prayer: string): string {
  return `${date}:${prayer}`;
}

// Layers changes that are still being written over what the database returned, so the screen
// does not wait for the write and the re-query. `inRange` limits which dates a query covers.
export function applyOverrides(
  entries: readonly PrayerLogEntry[],
  overrides: Overrides,
  inRange: (date: string) => boolean,
): PrayerLogEntry[] {
  const merged = new Map(entries.map((entry) => [overrideKey(entry.date, entry.prayer), entry]));
  for (const [key, value] of Object.entries(overrides)) {
    if (!inRange(key.slice(0, 10))) continue;
    if (value === null) merged.delete(key);
    else merged.set(key, value);
  }
  return [...merged.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
