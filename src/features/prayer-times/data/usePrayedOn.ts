import { useEffect, useState } from 'react';
import type { PrayerName } from '../calculate';
import { getDay } from './prayerLog';
import { usePrayerLogStore } from './prayerLogStore';

const NONE: ReadonlySet<PrayerName> = new Set();

export function usePrayedOn(date: string): ReadonlySet<PrayerName> {
  const revision = usePrayerLogStore((state) => state.revision);
  const [prayed, setPrayed] = useState<ReadonlySet<PrayerName>>(NONE);

  useEffect(() => {
    let cancelled = false;
    getDay(date)
      .then((entries) => {
        if (!cancelled) setPrayed(new Set(entries.map((entry) => entry.prayer)));
      })
      .catch(() => {
        if (!cancelled) setPrayed(NONE);
      });
    return () => {
      cancelled = true;
    };
  }, [date, revision]);

  return prayed;
}
