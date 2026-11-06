import { useCallback } from 'react';
import type { PrayerName } from '../calculate';
import type { LogChoice } from '../logChoice';
import { usePrayerLogStore } from './prayerLogStore';

// Prayed keeps an existing photo-verified row. Missed replaces the row. 'clear' returns the prayer to unmarked.
export function useSaveChoice() {
  const mark = usePrayerLogStore((state) => state.mark);
  const markMissed = usePrayerLogStore((state) => state.markMissed);
  const unmark = usePrayerLogStore((state) => state.unmark);

  // One function for as long as the store lives, so memoised rows that receive it do not redraw.
  return useCallback(
    (date: string, prayer: PrayerName, choice: LogChoice | 'clear'): void => {
      if (choice === 'prayed') mark(date, prayer, null);
      else if (choice === 'missed') markMissed(date, prayer);
      else unmark(date, prayer);
    },
    [mark, markMissed, unmark],
  );
}
