import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

// Loads data each time the screen comes into focus, so a count made on another screen shows when you come back.
// `key` says when the question changed (a different month, say) and the data must be loaded again.
export function useFocusData<T>(load: () => Promise<T>, initial: T, key: string): T {
  const [data, setData] = useState<T>(initial);
  const latest = useRef(load);
  useEffect(() => {
    latest.current = load;
  });

  useFocusEffect(
    useCallback(() => {
      let active = true;
      latest
        .current()
        .then((value) => {
          if (active) setData(value);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]),
  );
  return data;
}
