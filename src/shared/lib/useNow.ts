import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { now } from './date';

// Re-reads the clock on an interval and when the app returns to the foreground,
// because timers pause while the app is suspended.
export function useNow(intervalMs: number): Date {
  const [current, setCurrent] = useState(now);

  useEffect(() => {
    const id = setInterval(() => setCurrent(now()), intervalMs);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setCurrent(now());
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [intervalMs]);

  return current;
}
