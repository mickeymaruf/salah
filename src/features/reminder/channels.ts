import { Platform } from 'react-native';
import { AndroidImportance, AndroidNotificationVisibility, setNotificationChannelAsync } from 'expo-notifications';

export const ASK_CHANNEL = 'ask-silent';

// A high-importance channel with no sound and no vibration. It still shows on the lock screen.
export async function ensureAskChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await setNotificationChannelAsync(ASK_CHANNEL, {
    name: 'Prayer questions',
    description: 'A silent question at each prayer time: did you pray?',
    importance: AndroidImportance.HIGH,
    sound: null,
    enableVibrate: false,
    lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
  });
}
