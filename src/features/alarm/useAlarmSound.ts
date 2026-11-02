import { useEffect } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AlarmSoundId } from '@/shared/state/settings';

const SOURCES: Record<AlarmSoundId, number> = {
  chime: require('../../../assets/sounds/chime.wav'),
  bell: require('../../../assets/sounds/bell.wav'),
  soft: require('../../../assets/sounds/soft.wav'),
};

// Loops while the calling screen is mounted and stops when it unmounts.
export function useAlarmSound(sound: AlarmSoundId): void {
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' }).catch(() => undefined);
    const player = createAudioPlayer(SOURCES[sound]);
    player.loop = true;
    player.play();
    return () => {
      player.pause();
      player.remove();
    };
  }, [sound]);
}
