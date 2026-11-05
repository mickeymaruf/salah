import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { router, usePathname } from 'expo-router';
import { now, toDateKey } from '@/shared/lib/date';
import type { Profile } from '@/shared/state/profile';
import { getRange } from '@/features/prayer-times/data/prayerLog';
import { useCatchUpStore } from './catchUpStore';
import { loadLastActive, saveLastActive } from './lastActive';
import { buildCatchUpQueue, isOpenAfterAbsence, queueStartKey } from './queue';

// Alarm screens have their own flow, so the prompt waits for a later open instead of covering them.
const BUSY_PATHS = ['/alarm', '/proof', '/verified', '/catch-up'];
// Gives a notification tap that cold-started the app time to open its alarm before this checks the screen.
const SETTLE_MS = 700;

// Runs when the app opens (cold start or coming back to the foreground), never on its own while the app is in use.
export function useCatchUp(profile: Profile | null, enabled: boolean): void {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const profileRef = useRef(profile);

  useEffect(() => {
    pathRef.current = pathname;
    profileRef.current = profile;
  }, [pathname, profile]);

  useEffect(() => {
    if (!enabled) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const onOpen = async () => {
      const at = now();
      const lastActive = await loadLastActive();
      await saveLastActive(at);
      const current = profileRef.current;
      if (!current || !isOpenAfterAbsence(lastActive, at)) return;

      const logged = await getRange(queueStartKey(current.startedOn, at), toDateKey(at));
      const queue = buildCatchUpQueue({ profile: current, logged, at });
      if (queue.length === 0) return;

      timers.push(
        setTimeout(() => {
          if (BUSY_PATHS.includes(pathRef.current)) return;
          useCatchUpStore.getState().start(queue);
          router.push('/catch-up');
        }, SETTLE_MS),
      );
    };

    onOpen().catch(() => undefined);

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') onOpen().catch(() => undefined);
      // The time the app was last in use, so the idle gap is measured from when it was put away.
      else saveLastActive(now()).catch(() => undefined);
    });
    return () => {
      sub.remove();
      timers.forEach(clearTimeout);
    };
  }, [enabled]);
}
