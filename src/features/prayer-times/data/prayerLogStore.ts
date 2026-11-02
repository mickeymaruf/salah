import { create } from 'zustand';
import { now } from '@/shared/lib/date';
import type { PrayerName } from '../calculate';
import { overrideKey, type Overrides } from './optimistic';
import { markPrayed, removePrayed } from './prayerLog';

interface PrayerLogState {
  // Bumped after every write so screens that read the log know to query again.
  revision: number;
  // Changes shown immediately while the database write is still running.
  overrides: Overrides;
  mark: (date: string, prayer: PrayerName, proofUri: string | null) => Promise<void>;
  unmark: (date: string, prayer: PrayerName) => Promise<void>;
  // For writes made outside `mark` and `unmark`, such as the dev seed.
  invalidate: () => void;
}

export const usePrayerLogStore = create<PrayerLogState>((set, get) => {
  // Shows the change at once, then writes it. A failed write is rolled back so the screen never lies.
  const apply = async (key: string, value: Overrides[string], write: () => Promise<void>) => {
    const previous = get().overrides[key];
    const hadPrevious = key in get().overrides;
    set((state) => ({ overrides: { ...state.overrides, [key]: value } }));
    try {
      await write();
    } catch {
      set((state) => {
        const overrides = { ...state.overrides };
        if (hadPrevious) overrides[key] = previous;
        else delete overrides[key];
        return { overrides };
      });
    }
    set((state) => ({ revision: state.revision + 1 }));
  };

  return {
    revision: 0,
    overrides: {},
    mark: (date, prayer, proofUri) =>
      apply(overrideKey(date, prayer), { date, prayer, completedAt: now().toISOString(), proofUri }, () =>
        markPrayed(date, prayer, proofUri),
      ),
    unmark: (date, prayer) => apply(overrideKey(date, prayer), null, () => removePrayed(date, prayer)),
    invalidate: () => set((state) => ({ overrides: {}, revision: state.revision + 1 })),
  };
});
