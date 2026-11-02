import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import type { Profile } from '@/shared/state/profile';
import type { Settings } from '@/shared/state/settings';
import { usePrayerLogStore } from '@/features/prayer-times/data/prayerLogStore';
import { useTimesStore } from '@/features/prayer-times/data/useTimesSync';
import { syncAlarms } from './scheduler';

// Rebuilds the 7-day schedule whenever its inputs change: profile, settings, a new log entry,
// or the app returning to the foreground (the window must slide forward each day).
export function useAlarmSync(profile: Profile | null, settings: Settings): void {
  const revision = usePrayerLogStore((state) => state.revision);
  const timesRevision = useTimesStore((state) => state.revision);
  const [foregrounds, setForegrounds] = useState(0);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setForegrounds((count) => count + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (profile) syncAlarms(profile, settings);
  }, [profile, settings, revision, timesRevision, foregrounds]);
}
