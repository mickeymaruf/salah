import { useMemo } from 'react';
import { addDays, parseDateKey, toDateKey } from '@/shared/lib/date';
import { useNow } from '@/shared/lib/useNow';
import type { Profile } from '@/shared/state/profile';
import { getDayTimes, type PrayerName } from './calculate';
import { useDayLog } from './data/useDayLog';
import { useTimesStore } from './data/useTimesSync';
import { decodeStates, encodeStates, getDayStates } from './schedule';
import { getPrayerWindow } from './window';

// What the Today screen shows: the day picked with the arrows (today when `picked` is null) and, always, the prayer
// that is in progress right now. The clock ticks every second so the countdown is live; `states` keeps one object
// until a prayer's state changes, so the list below does not redraw every tick.
export function useTodayView(profile: Profile, picked: string | null) {
  const at = useNow(1000);
  const todayKey = toDateKey(at);
  const dayKey = picked ?? todayKey;
  const entries = useDayLog(dayKey);
  const outcomes = useMemo(() => new Map(entries.map((entry) => [entry.prayer, entry.outcome] as const)), [entries]);
  // The revision changes when a downloaded month table arrives, which re-runs this with the new times.
  const timesRevision = useTimesStore((state) => state.revision);

  const nowTimes = useMemo(() => {
    const day = parseDateKey(todayKey);
    return {
      yesterday: getDayTimes(profile, addDays(day, -1)),
      today: getDayTimes(profile, day),
      tomorrow: getDayTimes(profile, addDays(day, 1)),
      timesRevision,
    };
  }, [profile, todayKey, timesRevision]);

  const times = useMemo(
    () => (dayKey === todayKey ? nowTimes.today : getDayTimes(profile, parseDateKey(dayKey))),
    [profile, dayKey, todayKey, nowTimes],
  );

  const statesKey = encodeStates(getDayStates(times, outcomes, at));
  const states = useMemo(() => decodeStates(statesKey), [statesKey]);
  const window = getPrayerWindow(nowTimes.yesterday, nowTimes.today, nowTimes.tomorrow, at);
  // Before Fajr the window is yesterday's Isha, so no prayer on today's list is the current one.
  const currentName: PrayerName | null = toDateKey(window.start) === dayKey ? window.name : null;

  return { at, todayKey, dayKey, times, states, window, currentName };
}
