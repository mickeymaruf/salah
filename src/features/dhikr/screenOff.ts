import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';

type Events = {
  onSamples: (event: { samples: number[] }) => void;
  onStopped: (event: Record<string, never>) => void;
};

interface ScreenOffNative {
  addListener<K extends keyof Events>(name: K, listener: Events[K]): { remove(): void };
  start(title: string, text: string): void;
  stop(): void;
  update(text: string): void;
  isRunning(): boolean;
}

// The native module exists only in an Android build made from this project. Expo Go and iOS have none.
const native = Platform.OS === 'android' ? requireOptionalNativeModule<ScreenOffNative>('ScreenOffCounter') : null;

export const screenOffAvailable = native !== null;

export function startScreenOffService(title: string, text: string): void {
  native?.start(title, text);
}

export function stopScreenOffService(): void {
  native?.stop();
}

export function updateScreenOffText(text: string): void {
  native?.update(text);
}

// Calls `onSamples` with each batch of accelerometer samples and `onStopped` when the notification's Stop button is used.
export function listenToScreenOff(onSamples: (flat: number[]) => void, onStopped: () => void): () => void {
  if (!native) return () => undefined;
  const samples = native.addListener('onSamples', (event) => onSamples(event.samples));
  const stopped = native.addListener('onStopped', onStopped);
  return () => {
    samples.remove();
    stopped.remove();
  };
}
