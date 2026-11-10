import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { addDays, now, toDateKey } from '@/shared/lib/date';
import type { Profile } from '@/shared/state/profile';
import { getDayTimes } from '@/features/prayer-times/calculate';
import { getRange } from '@/features/prayer-times/data/prayerLog';
import { usePrayerLogStore } from '@/features/prayer-times/data/prayerLogStore';
import { askKey, prayersToMiss } from './askPlan';
import { REMINDER_MEMORY_DAYS, REMINDER_STOPS_AT_NEXT_PRAYER } from './config';
import { ensureSince } from './memoryStorage';

// When the asking has run out (the next prayer began with no answer) the prayer is logged as missed. Runs on launch and
// when the app returns to the foreground. Prayers from before the reminders first ran are left alone.
export function useReminderSync(profile: Profile | null): void {
  const markMissed = usePrayerLogStore((state) => state.markMissed);
  const [foregrounds, setForegrounds] = useState(0);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setForegrounds((count) => count + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!profile || !REMINDER_STOPS_AT_NEXT_PRAYER) return;
    let cancelled = false;
    (async () => {
      const memory = await ensureSince();
      const from = now();
      const since = new Date(memory.since ?? from.toISOString());
      const logged = await getRange(toDateKey(addDays(from, -REMINDER_MEMORY_DAYS - 1)), toDateKey(from));
      const marked = new Set(logged.map((entry) => askKey(entry.date, entry.prayer)));
      const missed = prayersToMiss((day) => getDayTimes(profile, day), from, since, marked, REMINDER_MEMORY_DAYS);
      for (const { date, prayer } of missed) {
        if (cancelled) return;
        await markMissed(date, prayer);
      }
    })().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [profile, foregrounds, markMissed]);
}
