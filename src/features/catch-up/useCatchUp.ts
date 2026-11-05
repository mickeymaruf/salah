import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { router, usePathname } from 'expo-router';
import { now, toDateKey } from '@/shared/lib/date';
import type { Profile } from '@/shared/state/profile';
import { getRange } from '@/features/prayer-times/data/prayerLog';
import { useCatchUpStore } from './catchUpStore';
import { buildCatchUpQueue, queueStartKey } from './queue';

// Alarm screens have their own flow, so the prompt waits for the next open instead of covering them.
const BUSY_PATHS = ['/alarm', '/proof', '/verified', '/catch-up'];
// Gives a notification tap that cold-started the app time to open its alarm before this checks the screen.
const SETTLE_MS = 700;

// Asks about every passed prayer that has no mark each time the app opens: on a cold start and each time it comes back
// to the foreground. It never starts on its own while the app is in use, and not right after onboarding.
// `ready` turns true once the app has loaded. A profile created later by onboarding does not count as an open.
export function useCatchUp(profile: Profile | null, ready: boolean): void {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const profileRef = useRef(profile);

  useEffect(() => {
    pathRef.current = pathname;
    profileRef.current = profile;
  }, [pathname, profile]);

  useEffect(() => {
    if (!ready) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const onOpen = async () => {
      const current = profileRef.current;
      if (!current || BUSY_PATHS.includes(pathRef.current)) return;
      const at = now();
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
    });
    return () => {
      sub.remove();
      timers.forEach(clearTimeout);
    };
  }, [ready]);
}
