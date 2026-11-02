import type { PrayerName } from '../calculate';
import type { LogChoice } from '../logChoice';
import { usePrayerLogStore } from './prayerLogStore';

// Prayed is stored as a log row without a photo, which the UI shows as an outlined check.
// An existing photo-verified row is kept. Missed removes the row.
export function useSaveChoice() {
  const mark = usePrayerLogStore((state) => state.mark);
  const unmark = usePrayerLogStore((state) => state.unmark);

  return (date: string, prayer: PrayerName, choice: LogChoice): void => {
    if (choice === 'prayed') mark(date, prayer, null);
    else unmark(date, prayer);
  };
}
