import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { create } from 'zustand';
import { now } from '@/shared/lib/date';
import type { Profile } from '@/shared/state/profile';
import { syncTimes } from './timesCache';

interface TimesState {
  // Bumped when a month table arrives, so screens recompute their times.
  revision: number;
  bump: () => void;
}

export const useTimesStore = create<TimesState>((set) => ({
  revision: 0,
  bump: () => set((state) => ({ revision: state.revision + 1 })),
}));

// Downloads the monthly tables from the API (and reuses stored ones). Offline, it does nothing and the
// on-device calculation stays in use.
export function useTimesSync(profile: Profile | null): void {
  const bump = useTimesStore((state) => state.bump);
  const [foregrounds, setForegrounds] = useState(0);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setForegrounds((count) => count + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!profile) return;
    syncTimes(profile, now()).then((changed) => {
      if (changed) bump();
    });
  }, [profile, bump, foregrounds]);
}
