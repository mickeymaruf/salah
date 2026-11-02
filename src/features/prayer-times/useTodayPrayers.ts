import { useMemo } from 'react';
import { addDays, parseDateKey, toDateKey } from '@/shared/lib/date';
import { useNow } from '@/shared/lib/useNow';
import type { Profile } from '@/shared/state/profile';
import { getDayTimes } from './calculate';
import { usePrayedOn } from './data/useDayLog';
import { useTimesStore } from './data/useTimesSync';
import { decodeStates, encodeStates, getDayStates, getNextPrayer } from './schedule';

export function useTodayPrayers(profile: Profile) {
  const at = useNow(10_000);
  const dayKey = toDateKey(at);
  const prayed = usePrayedOn(dayKey);

  // The revision changes when a downloaded month table arrives, which re-runs this hook with the new times.
  const timesRevision = useTimesStore((state) => state.revision);
  const { times, tomorrowTimes } = useMemo(() => {
    const day = parseDateKey(dayKey);
    return { times: getDayTimes(profile, day), tomorrowTimes: getDayTimes(profile, addDays(day, 1)), timesRevision };
  }, [profile, dayKey, timesRevision]);

  // The clock ticks every 10 s but the states rarely change, so keep one stable object for consumers.
  const statesKey = encodeStates(getDayStates(times, prayed, at));
  const states = useMemo(() => decodeStates(statesKey), [statesKey]);
  const next = getNextPrayer(times, tomorrowTimes, at);

  return {
    at,
    dayKey,
    times,
    states,
    next,
    countdownMs: next.time.getTime() - at.getTime(),
    prayedCount: Object.values(states).filter((state) => state === 'prayed').length,
  };
}
