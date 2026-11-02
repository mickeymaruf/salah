import { create } from 'zustand';
import type { PrayerName } from '../calculate';
import { markPrayed } from './prayerLog';

interface PrayerLogState {
  // Bumped after every write so screens that read the log know to query again.
  revision: number;
  mark: (date: string, prayer: PrayerName, proofUri: string | null) => Promise<void>;
  // For writes made outside `mark`, such as the dev seed.
  invalidate: () => void;
}

export const usePrayerLogStore = create<PrayerLogState>((set) => ({
  revision: 0,
  mark: async (date, prayer, proofUri) => {
    await markPrayed(date, prayer, proofUri);
    set((state) => ({ revision: state.revision + 1 }));
  },
  invalidate: () => set((state) => ({ revision: state.revision + 1 })),
}));
