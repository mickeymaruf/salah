export type AlarmSoundId = 'chime' | 'bell' | 'soft';

export const ALARM_SOUNDS: readonly AlarmSoundId[] = ['chime', 'bell', 'soft'];

export interface Settings {
  requireProof: boolean;
  // The soft pop when a prayer is marked as prayed. The confetti and the tap feedback stay on either way.
  markSound: boolean;
  alarmSound: AlarmSoundId;
  // 0 turns the reminder off.
  reminderMinutesBefore: number;
}

export const REMINDER_OPTIONS: readonly number[] = [0, 5, 10, 15, 30];

export const DEFAULT_SETTINGS: Settings = {
  requireProof: true,
  markSound: true,
  alarmSound: 'chime',
  reminderMinutesBefore: 10,
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
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
