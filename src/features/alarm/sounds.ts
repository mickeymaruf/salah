import type { AlarmSoundId } from '@/shared/state/settings';

export const ALARM_SOURCES: Record<AlarmSoundId, number> = {
  chime: require('../../../assets/sounds/chime.wav'),
  bell: require('../../../assets/sounds/bell.wav'),
  soft: require('../../../assets/sounds/soft.wav'),
};
