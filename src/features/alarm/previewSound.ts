import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AlarmSoundId } from '@/shared/state/settings';
import { ALARM_SOURCES } from './sounds';

const PREVIEW_MS = 2500;

export function previewSound(sound: AlarmSoundId): void {
  setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' }).catch(() => undefined);
  const player = createAudioPlayer(ALARM_SOURCES[sound]);
  player.play();
  setTimeout(() => {
    player.pause();
    player.remove();
  }, PREVIEW_MS);
}
