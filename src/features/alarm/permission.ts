import * as Notifications from 'expo-notifications';
import { ensureChannels } from './channels';

export async function hasNotificationPermission(): Promise<boolean> {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

// Android 13+ only shows the prompt once a channel exists.
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    await ensureChannels();
    const { granted } = await Notifications.requestPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}
