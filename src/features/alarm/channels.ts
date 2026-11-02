import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import {
  AndroidAudioContentType,
  AndroidAudioUsage,
  AndroidImportance,
  AndroidNotificationVisibility,
  setNotificationChannelAsync,
} from 'expo-notifications';
import { ALARM_SOUNDS, type AlarmSoundId } from '@/shared/state/settings';

export const REMINDER_CHANNEL = 'reminder';

export function alarmChannel(sound: AlarmSoundId): string {
  return `alarm-${sound}`;
}

// Expo Go cannot bundle the custom .wav files, so it falls back to the system sound.
export const hasCustomSounds = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

export function soundFile(sound: AlarmSoundId): string {
  return `${sound}.wav`;
}

// Android fixes a channel's sound at creation, so each alarm sound gets its own channel.
export async function ensureChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await setNotificationChannelAsync(REMINDER_CHANNEL, {
    name: 'Prayer reminders',
    importance: AndroidImportance.HIGH,
  });

  await Promise.all(
    ALARM_SOUNDS.map((sound) =>
      setNotificationChannelAsync(alarmChannel(sound), {
        name: `Prayer alarm (${sound})`,
        importance: AndroidImportance.MAX,
        sound: hasCustomSounds ? soundFile(sound) : 'default',
        audioAttributes: {
          usage: AndroidAudioUsage.ALARM,
          contentType: AndroidAudioContentType.SONIFICATION,
        },
        vibrationPattern: [0, 500, 300, 500],
        lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
      }),
    ),
  );
}
