import { useMemo } from 'react';
import { addDays, parseDateKey, toDateKey } from '@/shared/lib/date';
import { useNow } from '@/shared/lib/useNow';
import type { Profile } from '@/shared/state/profile';
import { getDayTimes } from './calculate';
import { usePrayedOn } from './data/usePrayedOn';
import { getDayStates, getNextPrayer } from './schedule';

export function useTodayPrayers(profile: Profile) {
  const at = useNow(10_000);
  const dayKey = toDateKey(at);
  const prayed = usePrayedOn(dayKey);

  const { times, tomorrowTimes } = useMemo(() => {
    const day = parseDateKey(dayKey);
    return { times: getDayTimes(profile, day), tomorrowTimes: getDayTimes(profile, addDays(day, 1)) };
  }, [profile, dayKey]);

  const states = getDayStates(times, prayed, at);
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
