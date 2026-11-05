import { useEffect, useMemo, useState } from 'react';
import type { PrayerName } from '../calculate';
import { applyOverrides } from './optimistic';
import { getDay, type PrayerLogEntry } from './prayerLog';
import { usePrayerLogStore } from './prayerLogStore';

const NONE: PrayerLogEntry[] = [];

// Entries for one day, re-read after every write to the log.
export function useDayLog(date: string): PrayerLogEntry[] {
  const revision = usePrayerLogStore((state) => state.revision);
  const overrides = usePrayerLogStore((state) => state.overrides);
  const [stored, setEntries] = useState<PrayerLogEntry[]>(NONE);

  useEffect(() => {
    let cancelled = false;
    getDay(date)
      .then((rows) => {
        if (!cancelled) setEntries(rows);
      })
      .catch(() => {
        if (!cancelled) setEntries(NONE);
      });
    return () => {
      cancelled = true;
    };
  }, [date, revision]);

  return useMemo(() => applyOverrides(stored, overrides, (key) => key === date), [stored, overrides, date]);
}

export function usePrayedOn(date: string): ReadonlySet<PrayerName> {
  const entries = useDayLog(date);
  return useMemo(
    () => new Set(entries.filter((entry) => entry.outcome === 'prayed').map((entry) => entry.prayer)),
    [entries],
  );
}
