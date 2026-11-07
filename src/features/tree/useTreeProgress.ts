import { useEffect, useMemo, useState } from 'react';
import { addDays, parseDateKey, toDateKey } from '@/shared/lib/date';
import type { Profile } from '@/shared/state/profile';
import { getDayTimes } from '../prayer-times/calculate';
import { applyOverrides } from '../prayer-times/data/optimistic';
import { getRange, type PrayerLogEntry } from '../prayer-times/data/prayerLog';
import { usePrayerLogStore } from '../prayer-times/data/prayerLogStore';
import { useTimesStore } from '../prayer-times/data/useTimesSync';
import { useTodayPrayers } from '../prayer-times/useTodayPrayers';
import { HISTORY_DAYS, computeTreeProgress, todayStanding, windowsEnded, type TreeProgress } from './treeProgress';

// Null until the log has been read once, so the screen never draws a bare tree for a moment.
export function useTreeProgress(profile: Profile): TreeProgress | null {
  const { at, dayKey, times, states } = useTodayPrayers(profile);
  const revision = usePrayerLogStore((state) => state.revision);
  const overrides = usePrayerLogStore((state) => state.overrides);
  const timesRevision = useTimesStore((state) => state.revision);
  const [stored, setStored] = useState<PrayerLogEntry[] | null>(null);

  const startKey = useMemo(() => toDateKey(addDays(parseDateKey(dayKey), -HISTORY_DAYS)), [dayKey]);

  useEffect(() => {
    let cancelled = false;
    getRange(startKey, dayKey)
      .then((rows) => {
        if (!cancelled) setStored(rows);
      })
      .catch(() => {
        if (!cancelled) setStored([]);
      });
    return () => {
      cancelled = true;
    };
  }, [startKey, dayKey, revision]);

  const tomorrowFajr = useMemo(
    () => getDayTimes(profile, addDays(parseDateKey(dayKey), 1)).fajr,
    // A downloaded month table changes the times, so the revision is a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, dayKey, timesRevision],
  );

  const entries = useMemo(
    () => (stored === null ? null : applyOverrides(stored, overrides, (date) => date >= startKey && date <= dayKey)),
    [stored, overrides, startKey, dayKey],
  );

  const ended = windowsEnded(times, tomorrowFajr, at);
  const standing = todayStanding(states, ended);
  const broken = standing.broken;
  const prayed = standing.prayed;

  return useMemo(
    () => (entries === null ? null : computeTreeProgress({ todayKey: dayKey, entries, today: { prayed, broken } })),
    [entries, dayKey, prayed, broken],
  );
}
