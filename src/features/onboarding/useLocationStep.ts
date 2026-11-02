import { useCallback, useEffect, useState } from 'react';
import { detectLocation, hasLocationPermission, type DetectedPlace } from '@/features/prayer-times/location';

export type LocationStatus = 'idle' | 'detecting' | 'ready' | 'denied' | 'blocked' | 'error';

export function useLocationStep() {
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [place, setPlace] = useState<DetectedPlace | null>(null);

  const detect = useCallback(async () => {
    setStatus('detecting');
    const result = await detectLocation();
    if (result.kind === 'ok') {
      setPlace(result.place);
      setStatus('ready');
    } else if (result.kind === 'denied') {
      setStatus(result.canAskAgain ? 'denied' : 'blocked');
    } else {
      setStatus('error');
    }
  }, []);

  // Skip the permission prompt when access was already granted earlier.
  useEffect(() => {
    hasLocationPermission().then((granted) => {
      if (granted) detect();
    });
  }, [detect]);

  return { status, place, detect };
}
