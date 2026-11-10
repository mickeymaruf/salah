import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import type { TapSensitivity } from '@/shared/state/settings';
import { INITIAL_DETECTOR, detectTaps, type DetectorState } from './tapDetector';
import { listenToScreenOff, screenOffAvailable, startScreenOffService, stopScreenOffService, updateScreenOffText } from './screenOff';

const NOTIFICATION_DELAY_MS = 1000;

interface Options {
  enabled: boolean;
  sensitivity: TapSensitivity;
  title: string;
  // Shown in the notification while counting, for example "21 so far".
  text: string;
  // Called once for each tap felt while the screen is off.
  onTap: () => void;
}

// While the counter is open and the setting is on, a foreground service reads the accelerometer. Taps count only when the app is not in the foreground,
// so a touch on the screen is never counted twice.
export function useScreenOffCounting({ enabled, sensitivity, title, text, onTap }: Options): void {
  const active = enabled && screenOffAvailable;
  const detector = useRef<DetectorState>(INITIAL_DETECTOR);
  const latest = useRef({ onTap, sensitivity, text });

  useEffect(() => {
    latest.current = { onTap, sensitivity, text };
  });

  useEffect(() => {
    if (!active) return undefined;
    startScreenOffService(title, latest.current.text);
    const stop = listenToScreenOff(
      (flat) => {
        if (AppState.currentState === 'active') {
          detector.current = INITIAL_DETECTOR;
          return;
        }
        const result = detectTaps(detector.current, flat, latest.current.sensitivity);
        detector.current = result.state;
        for (let i = 0; i < result.taps; i++) latest.current.onTap();
      },
      () => undefined,
    );
    return () => {
      stop();
      stopScreenOffService();
      detector.current = INITIAL_DETECTOR;
    };
  }, [active, title]);

  useEffect(() => {
    if (!active) return undefined;
    const timer = setTimeout(() => updateScreenOffText(text), NOTIFICATION_DELAY_MS);
    return () => clearTimeout(timer);
  }, [active, text]);
}
