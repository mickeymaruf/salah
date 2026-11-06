import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useSettingsStore } from '@/shared/state/settingsStore';

let player: AudioPlayer | null = null;

// Loads the pop ahead of time so the first tap plays without a delay.
export function preloadPop(): void {
  if (!player) player = createAudioPlayer(require('../../../assets/sounds/pop.wav'));
}

// A short soft pop when a prayer is marked as prayed. It follows the silent switch and the "Sound when marking a
// prayer" setting; nothing else (confetti, haptics) depends on it.
export function playPop(): void {
  if (!useSettingsStore.getState().settings.markSound) return;
  preloadPop();
  const current = player;
  if (!current) return;
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' })
    .then(() => current.seekTo(0))
    .then(() => current.play())
    .catch(() => undefined);
}
