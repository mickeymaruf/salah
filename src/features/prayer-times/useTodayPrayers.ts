import { useMemo } from 'react';
import { addDays, parseDateKey, toDateKey } from '@/shared/lib/date';
import { useNow } from '@/shared/lib/useNow';
import type { Profile } from '@/shared/state/profile';
import { getDayTimes } from './calculate';
import { useDayLog } from './data/useDayLog';
import { useTimesStore } from './data/useTimesSync';
import { decodeStates, encodeStates, getDayStates } from './schedule';
import { getPrayerWindow } from './window';

export function useTodayPrayers(profile: Profile) {
  const at = useNow(10_000);
  const dayKey = toDateKey(at);
  const entries = useDayLog(dayKey);
  const outcomes = useMemo(() => new Map(entries.map((entry) => [entry.prayer, entry.outcome] as const)), [entries]);
  // The revision changes when a downloaded month table arrives, which re-runs this hook with the new times.
  const timesRevision = useTimesStore((state) => state.revision);
  const { times, yesterdayTimes, tomorrowTimes } = useMemo(() => {
    const day = parseDateKey(dayKey);
    return {
      times: getDayTimes(profile, day),
      yesterdayTimes: getDayTimes(profile, addDays(day, -1)),
      tomorrowTimes: getDayTimes(profile, addDays(day, 1)),
      timesRevision,
    };
  }, [profile, dayKey, timesRevision]);

  // The clock ticks every 10 s but the states rarely change, so keep one stable object for consumers.
  const statesKey = encodeStates(getDayStates(times, outcomes, at));
  const states = useMemo(() => decodeStates(statesKey), [statesKey]);
  const window = getPrayerWindow(yesterdayTimes, times, tomorrowTimes, at);

  return { at, dayKey, times, states, window };
}
