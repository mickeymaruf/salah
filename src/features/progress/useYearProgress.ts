import { useEffect, useMemo, useState } from 'react';
import type { Profile } from '@/shared/state/profile';
import { getYear, type PrayerLogEntry } from '@/features/prayer-times/data/prayerLog';
import { usePrayerLogStore } from '@/features/prayer-times/data/prayerLogStore';
import { useTodayPrayers } from '@/features/prayer-times/useTodayPrayers';
import { buildYear } from './model';
import { computeStats } from './stats';

export function useYearProgress(profile: Profile) {
  const { at, dayKey, states } = useTodayPrayers(profile);
  const year = at.getFullYear();
  const revision = usePrayerLogStore((state) => state.revision);
  const [entries, setEntries] = useState<PrayerLogEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    getYear(year)
      .then((rows) => {
        if (!cancelled) setEntries(rows);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [year, revision]);

  return useMemo(() => {
    const firstLogged = entries[0]?.date;
    const profileStart = profile.startedOn ?? dayKey;
    const startKey = firstLogged && firstLogged < profileStart ? firstLogged : profileStart;
    const grid = buildYear({ year, entries, todayKey: dayKey, todayStates: states, startKey });
    return { year, dayKey, grid, stats: computeStats(grid) };
  }, [year, entries, dayKey, states, profile.startedOn]);
}
