import { useEffect } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AlarmSoundId } from '@/shared/state/settings';
import { ALARM_SOURCES } from './sounds';

// Loops while `active` and the calling screen is mounted.
export function useAlarmSound(sound: AlarmSoundId, active: boolean): void {
  useEffect(() => {
    if (!active) return;
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' }).catch(() => undefined);
    const player = createAudioPlayer(ALARM_SOURCES[sound]);
    player.loop = true;
    player.play();
    return () => {
      player.pause();
      player.remove();
    };
  }, [sound, active]);
}
