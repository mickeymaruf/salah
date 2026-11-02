import { useMemo } from 'react';
import { addDays, parseDateKey, toDateKey } from '@/shared/lib/date';
import { useNow } from '@/shared/lib/useNow';
import type { Profile } from '@/shared/state/profile';
import { getDayTimes, type PrayerName } from './calculate';
import { getDayStates, getNextPrayer } from './schedule';

const NO_PRAYERS: ReadonlySet<PrayerName> = new Set();

export function useTodayPrayers(profile: Profile, prayed: ReadonlySet<PrayerName> = NO_PRAYERS) {
  const at = useNow(10_000);
  const dayKey = toDateKey(at);

  const { times, tomorrowTimes } = useMemo(() => {
    const day = parseDateKey(dayKey);
    return { times: getDayTimes(profile, day), tomorrowTimes: getDayTimes(profile, addDays(day, 1)) };
  }, [profile, dayKey]);

  const states = getDayStates(times, prayed, at);
  const next = getNextPrayer(times, tomorrowTimes, at);

  return {
    at,
    times,
    states,
    next,
    countdownMs: next.time.getTime() - at.getTime(),
    prayedCount: Object.values(states).filter((state) => state === 'prayed').length,
  };
}
