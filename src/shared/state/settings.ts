export type AlarmSoundId = 'chime' | 'bell' | 'soft';

export type TapSensitivity = 'low' | 'medium' | 'high';

export const TAP_SENSITIVITIES: readonly TapSensitivity[] = ['low', 'medium', 'high'];

export const ALARM_SOUNDS: readonly AlarmSoundId[] = ['chime', 'bell', 'soft'];

export interface Settings {
  requireProof: boolean;
  // The soft pop when a prayer is marked as prayed. The confetti and the tap feedback stay on either way.
  markSound: boolean;
  alarmSound: AlarmSoundId;
  // 0 turns the reminder off.
  reminderMinutesBefore: number;
  // Experimental, Android only: keep counting a dhikr by fingernail taps on the phone while the screen is off.
  screenOffCounting: boolean;
  tapSensitivity: TapSensitivity;
}

export const REMINDER_OPTIONS: readonly number[] = [0, 5, 10, 15, 30];

export const DEFAULT_SETTINGS: Settings = {
  requireProof: true,
  markSound: true,
  alarmSound: 'chime',
  reminderMinutesBefore: 10,
  screenOffCounting: false,
  tapSensitivity: 'medium',
};

// Field by field so an older stored shape still yields a complete, valid object.
export function parseSettings(raw: string | null): Settings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return DEFAULT_SETTINGS;
    const s = value as Record<string, unknown>;
    return {
      requireProof: typeof s.requireProof === 'boolean' ? s.requireProof : DEFAULT_SETTINGS.requireProof,
      markSound: typeof s.markSound === 'boolean' ? s.markSound : DEFAULT_SETTINGS.markSound,
      alarmSound: ALARM_SOUNDS.includes(s.alarmSound as AlarmSoundId)
        ? (s.alarmSound as AlarmSoundId)
        : DEFAULT_SETTINGS.alarmSound,
      reminderMinutesBefore: REMINDER_OPTIONS.includes(s.reminderMinutesBefore as number)
        ? (s.reminderMinutesBefore as number)
        : DEFAULT_SETTINGS.reminderMinutesBefore,
      screenOffCounting: typeof s.screenOffCounting === 'boolean' ? s.screenOffCounting : DEFAULT_SETTINGS.screenOffCounting,
      tapSensitivity: TAP_SENSITIVITIES.includes(s.tapSensitivity as TapSensitivity) ? (s.tapSensitivity as TapSensitivity) : DEFAULT_SETTINGS.tapSensitivity,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
